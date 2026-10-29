"""Session Risk Model (Model B) and Policy-Driven Behavioral Evaluator.

Ingests examination event streams and student behavioral summaries.
Combines a trained supervised baseline on available assessment logs with a
rule-based proctoring policy evaluator for genuine event log deployment.
"""

import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from fairproctor.config import ARTIFACTS_DIR, MODELS_DIR, ProctoringPolicy, TrainingConfig
from fairproctor.data.loaders import load_behavioral_datasets
from fairproctor.data.validation import DataValidator
from fairproctor.features.behavioral_features import BehavioralFeatureExtractor

logger = logging.getLogger("fairproctor.models.behavior")


class BehavioralSessionModel:
    """Combines a trained tabular behavioral baseline with deterministic policy rules."""

    def __init__(
        self,
        pipeline: Optional[Pipeline] = None,
        feature_names: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        policy: Optional[ProctoringPolicy] = None
    ):
        self.pipeline = pipeline
        self.feature_names = feature_names or []
        self.metadata = metadata or {}
        self.policy = policy or ProctoringPolicy()

    def evaluate_behavioral_events(
        self,
        event_summary: Dict[str, Any],
        custom_policy: Optional[ProctoringPolicy] = None
    ) -> Dict[str, Any]:
        """
        Rule-based policy evaluation of live or replayed browser event telemetry.

        Args:
            event_summary: Dict containing total_tab_switches, paste_count, etc.
            custom_policy: Optional specific ProctoringPolicy overrides.

        Returns:
            Dict containing behavioral risk points (0-100), flags, and policy infractions.
        """
        pol = custom_policy or self.policy
        tab_switches = int(event_summary.get("total_tab_switches", 0))
        paste_count = int(event_summary.get("paste_count", 0))
        rapid_answers = int(event_summary.get("rapid_answer_count", 0))

        risk_score = 0.0
        flags: List[Dict[str, Any]] = []

        # 1. Tab switches evaluation
        if not pol.allow_tab_switch and tab_switches > pol.max_tolerated_tab_switches:
            excess = tab_switches - pol.max_tolerated_tab_switches
            severity = "HIGH" if excess >= 3 else "MEDIUM"
            tab_risk = min(40.0, excess * 12.0)
            risk_score += tab_risk
            flags.append({
                "type": "TAB_SWITCH_VIOLATION",
                "count": tab_switches,
                "tolerated": pol.max_tolerated_tab_switches,
                "severity": severity,
                "explanation": (
                    f"Candidate switched browser tabs {tab_switches} times "
                    f"(policy tolerates up to {pol.max_tolerated_tab_switches})."
                )
            })

        # 2. Copy/Paste evaluation
        if not pol.allow_copy_paste and paste_count > 0:
            paste_risk = min(35.0, paste_count * 15.0)
            risk_score += paste_risk
            flags.append({
                "type": "COPY_PASTE_VIOLATION",
                "count": paste_count,
                "severity": "HIGH",
                "explanation": f"Unauthorized paste event detected ({paste_count} instances)."
            })

        # 3. Rapid guessing / bot-like submissions (< 5 sec answers)
        if rapid_answers >= 3:
            risk_score += 15.0
            flags.append({
                "type": "RAPID_RESPONSE_ANOMALY",
                "count": rapid_answers,
                "severity": "LOW",
                "explanation": f"{rapid_answers} questions answered abnormally fast (< 5s), suggesting random guessing."
            })

        capped_risk = min(100.0, max(0.0, risk_score))
        return {
            "behavioral_risk_score": round(capped_risk, 1),
            "flags": flags,
            "has_infractions": len(flags) > 0,
        }

    def predict_tabular_risk(self, X: pd.DataFrame) -> Optional[np.ndarray]:
        """Predicts probabilities from the trained tabular baseline if fitted."""
        if self.pipeline is None:
            return None
        return self.pipeline.predict_proba(X)[:, 1]

    def save(self, output_path: Optional[Path] = None) -> Path:
        """Serializes behavioral model bundle."""
        out = output_path or (MODELS_DIR / "session_behavior_model.joblib")
        out.parent.mkdir(parents=True, exist_ok=True)
        bundle = {
            "pipeline": self.pipeline,
            "feature_names": self.feature_names,
            "metadata": self.metadata,
        }
        joblib.dump(bundle, out)
        logger.info(f"Saved behavioral model bundle to {out}")
        return out

    @classmethod
    def load(cls, model_path: Optional[Path] = None) -> "BehavioralSessionModel":
        """Loads a persisted behavioral model bundle from disk."""
        p = model_path or (MODELS_DIR / "session_behavior_model.joblib")
        if not p.exists():
            logger.warning(f"Persisted behavioral model not found at {p}. Initializing rule-only engine.")
            return cls(pipeline=None, feature_names=[], metadata={"status": "rule_only"})
        bundle = joblib.load(p)
        return cls(
            pipeline=bundle.get("pipeline"),
            feature_names=bundle.get("feature_names", []),
            metadata=bundle.get("metadata", {}),
        )


class BehavioralModelTrainer:
    """Trains a baseline model on the GitHub assessment student dataset."""

    def __init__(self, config: Optional[TrainingConfig] = None):
        self.config = config or TrainingConfig()

    def train_and_evaluate(
        self,
        data_dir: Optional[Path] = None
    ) -> Tuple[BehavioralSessionModel, Dict[str, Any]]:
        """
        Trains a baseline model on Dataset-main student summaries,
        rigorously reporting the small-sample limitation (n=111).
        """
        dataset = load_behavioral_datasets(data_dir)
        agg_df = dataset.aggregated_df

        if agg_df.empty:
            raise ValueError("No aggregated behavioral records found in Dataset-main.")

        X, y = BehavioralFeatureExtractor.prepare_training_features(agg_df)

        if y is None or len(y) == 0:
            raise ValueError("No valid target column found for behavioral training.")

        # Validate
        DataValidator.validate_features_dataframe(X)
        DataValidator.validate_target_labels(y)

        n_samples = len(X)
        logger.info(f"Behavioral dataset: {n_samples} samples, {X.shape[1]} features.")

        # Split 80/20 stratified
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=self.config.test_size,
            random_state=self.config.random_seed,
            stratify=y
        )

        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(random_state=self.config.random_seed, class_weight="balanced"))
        ])

        pipeline.fit(X_train, y_train)

        test_preds = pipeline.predict(X_test)
        test_probas = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, test_preds)
        prec = precision_score(y_test, test_preds, zero_division=0)
        rec = recall_score(y_test, test_preds, zero_division=0)
        f1 = f1_score(y_test, test_preds, zero_division=0)
        roc = roc_auc_score(y_test, test_probas) if len(set(y_test)) > 1 else 0.5
        cm = confusion_matrix(y_test, test_preds).tolist()

        metadata = {
            "model_type": "LogisticRegression_BehavioralBaseline",
            "version": "1.0.0",
            "trained_at": datetime.utcnow().isoformat(),
            "n_samples": n_samples,
            "n_features": X.shape[1],
            "feature_names": list(X.columns),
            "limitations_note": (
                f"Sample size is limited to {n_samples} student sessions across Dataset1 and Dataset2. "
                "This baseline demonstrates behavioral feasibility, but production deployment must "
                "rely on genuine, large-scale Integraminds telemetry and the rule-based policy evaluator."
            ),
            "test_metrics": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(roc, 4),
                "confusion_matrix": cm,
            }
        }

        model = BehavioralSessionModel(
            pipeline=pipeline,
            feature_names=list(X.columns),
            metadata=metadata
        )

        return model, metadata
