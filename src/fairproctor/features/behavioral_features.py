"""Behavioral event feature extraction from online assessment logs."""

import json
import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger("fairproctor.features.behavioral")


class BehavioralFeatureExtractor:
    """Extracts student-level behavioral features from exam interaction and event logs."""

    # Features from aggregated student dataset (excluding IDs, target, and heuristic leakage)
    AGGREGATED_NUMERIC_FEATURES = [
        "Revisions", "Visit", "KT", "CD",
        "Score-HOTS", "Score-LOTS", "Time-HOTS", "Time-LOTS",
        "Score-HighDiff", "Score-LowDiff", "Time-HighDiff", "Time-LowDiff"
    ]

    @classmethod
    def extract_from_raw_events(cls, student_events_df: pd.DataFrame) -> Dict[str, Any]:
        """
        Derives summary behavioral features from a student's raw question event logs.

        Args:
            student_events_df: DataFrame of rows for one candidate from Raw_Dataset.

        Returns:
            Dictionary of session-level behavioral features.
        """
        if student_events_df.empty:
            return {
                "total_tab_switches": 0,
                "questions_with_tab_switch": 0,
                "max_tab_switches_single_q": 0,
                "total_revisions": 0,
                "mean_time_per_question_sec": 0.0,
                "lots_to_hots_time_ratio": 1.0,
                "rapid_answer_count": 0,
                "questions_attempted": 0,
            }

        # Tab switches
        tab_col = "Tab Switch" if "Tab Switch" in student_events_df.columns else "tab_switch"
        if tab_col in student_events_df.columns:
            tabs = pd.to_numeric(student_events_df[tab_col], errors="coerce").fillna(0)
            total_tabs = int(tabs.sum())
            q_tabs = int((tabs > 0).sum())
            max_tabs = int(tabs.max())
        else:
            total_tabs = 0
            q_tabs = 0
            max_tabs = 0

        # Time per question
        time_col = "Time" if "Time" in student_events_df.columns else "time"
        times = pd.to_numeric(student_events_df[time_col], errors="coerce").fillna(0.0) if time_col in student_events_df.columns else pd.Series(0.0)
        mean_time = float(times.mean()) if len(times) > 0 else 0.0
        rapid_answers = int((times < 5.0).sum())

        # LOTS vs HOTS ratio
        bt_col = "BT level" if "BT level" in student_events_df.columns else "bt_level"
        lots_time = 0.0
        hots_time = 0.0
        if bt_col in student_events_df.columns and time_col in student_events_df.columns:
            lots_mask = student_events_df[bt_col].astype(str).str.upper() == "LOTS"
            hots_mask = student_events_df[bt_col].astype(str).str.upper() == "HOTS"
            lots_time = float(pd.to_numeric(student_events_df.loc[lots_mask, time_col], errors="coerce").sum())
            hots_time = float(pd.to_numeric(student_events_df.loc[hots_mask, time_col], errors="coerce").sum())

        lots_hots_ratio = round(lots_time / max(hots_time, 1.0), 3)

        # Revision count estimation from Response-Submit-Timestamp
        revisions_count = 0
        resp_col = "Response-Submit-Timestamp"
        if resp_col in student_events_df.columns:
            for val in student_events_df[resp_col]:
                if pd.notna(val) and isinstance(val, str) and val.startswith("["):
                    try:
                        parsed = json.loads(val.replace("'", '"'))
                        if isinstance(parsed, list) and len(parsed) > 1:
                            revisions_count += (len(parsed) - 1)
                    except Exception:
                        pass

        return {
            "total_tab_switches": total_tabs,
            "questions_with_tab_switch": q_tabs,
            "max_tab_switches_single_q": max_tabs,
            "total_revisions": revisions_count,
            "mean_time_per_question_sec": round(mean_time, 2),
            "lots_to_hots_time_ratio": lots_hots_ratio,
            "rapid_answer_count": rapid_answers,
            "questions_attempted": len(student_events_df),
        }

    @classmethod
    def prepare_training_features(
        cls,
        df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
        """
        Extracts clean feature matrix from aggregated dataset, stripping IDs,
        target leakage columns, and isolating the target.

        Returns:
            (features_df, target_series or None)
        """
        df_clean = df.copy()

        # Isolate target if present
        target = None
        for t_col in ["Cheater", "cheater", "label", "target"]:
            if t_col in df_clean.columns:
                target = df_clean[t_col].astype(int)
                df_clean = df_clean.drop(columns=[t_col])
                break

        # Explicitly drop identifiers and potential leakage columns
        drop_cols = [
            c for c in df_clean.columns
            if c.lower() in ["username/id", "username", "flag", "_source_file"]
        ]
        if drop_cols:
            df_clean = df_clean.drop(columns=drop_cols)

        # Filter to valid numeric columns
        num_cols = [c for c in cls.AGGREGATED_NUMERIC_FEATURES if c in df_clean.columns]
        features = df_clean[num_cols].apply(pd.to_numeric, errors="coerce").fillna(0.0)

        return features, target
