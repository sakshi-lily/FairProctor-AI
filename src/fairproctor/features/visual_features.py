"""Visual behavior feature extraction and session-level aggregation."""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger("fairproctor.features.visual")


class VisualFeatureExtractor:
    """Extracts, cleans, and engineers visual features from video frame observations."""

    BASE_NUMERIC_FEATURES = [
        "face_present", "no_of_face", "face_conf",
        "face_x", "face_y", "face_w", "face_h",
        "hand_count", "hand_obj_interaction",
        "head_pitch", "head_yaw", "head_roll",
        "phone_present", "phone_conf",
        "gaze_on_script", "gazePoint_x", "gazePoint_y",
        "pupil_left_x", "pupil_left_y", "pupil_right_x", "pupil_right_y"
    ]

    BASE_CATEGORICAL_FEATURES = [
        "head_pose", "gaze_direction"
    ]

    @classmethod
    def get_feature_lists(cls, df: pd.DataFrame) -> Tuple[List[str], List[str]]:
        """Returns existing numeric and categorical column names from the given dataframe."""
        existing_numeric = [col for col in cls.BASE_NUMERIC_FEATURES if col in df.columns]
        existing_categorical = [col for col in cls.BASE_CATEGORICAL_FEATURES if col in df.columns]
        return existing_numeric, existing_categorical

    @classmethod
    def engineer_frame_features(cls, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates derived visual features from raw frame measurements.

        Derived features:
        - head_rotation_magnitude: Euclidean norm of pitch, yaw, roll.
        - phone_active: High-confidence phone presence indicator.
        - is_looking_away: Combination of off-script gaze and non-forward head pose.
        - face_absent: Indicator when no face is detected in the frame.
        - multiple_faces_detected: Indicator for > 1 face.
        """
        df_out = df.copy()

        # 1. Head rotation magnitude
        angles = ["head_pitch", "head_yaw", "head_roll"]
        if all(a in df_out.columns for a in angles):
            pitch = pd.to_numeric(df_out["head_pitch"], errors="coerce").fillna(0.0)
            yaw = pd.to_numeric(df_out["head_yaw"], errors="coerce").fillna(0.0)
            roll = pd.to_numeric(df_out["head_roll"], errors="coerce").fillna(0.0)
            df_out["head_rotation_magnitude"] = np.sqrt(pitch**2 + yaw**2 + roll**2)

        # 2. Phone active indicator
        if "phone_present" in df_out.columns and "phone_conf" in df_out.columns:
            p_pres = pd.to_numeric(df_out["phone_present"], errors="coerce").fillna(0)
            p_conf = pd.to_numeric(df_out["phone_conf"], errors="coerce").fillna(0.0)
            df_out["phone_active"] = ((p_pres > 0) & (p_conf >= 0.40)).astype(int)

        # 3. Looking away indicator
        if "head_pose" in df_out.columns or "gaze_direction" in df_out.columns:
            head_away = (
                df_out["head_pose"].astype(str).str.lower().isin(["left", "right", "down"])
                if "head_pose" in df_out.columns else pd.Series(False, index=df_out.index)
            )
            gaze_off = (
                df_out["gaze_on_script"].astype(str).isin(["0", "0.0", "False", "false"])
                if "gaze_on_script" in df_out.columns else pd.Series(False, index=df_out.index)
            )
            df_out["is_looking_away"] = (head_away | gaze_off).astype(int)

        # 4. Face presence indicators
        if "face_present" in df_out.columns:
            f_pres = pd.to_numeric(df_out["face_present"], errors="coerce").fillna(0)
            df_out["face_absent"] = (f_pres == 0).astype(int)

        if "no_of_face" in df_out.columns:
            n_faces = pd.to_numeric(df_out["no_of_face"], errors="coerce").fillna(0)
            df_out["multiple_faces_detected"] = (n_faces > 1).astype(int)

        return df_out

    @classmethod
    def aggregate_session_visuals(
        cls,
        frames_df: pd.DataFrame,
        sample_interval_sec: float = 5.0
    ) -> Dict[str, Any]:
        """
        Aggregates frame observations into session-level summary statistics.
        Supports low-bandwidth operation (e.g. 1 frame every 5 seconds).

        Returns:
            Dictionary of session-level aggregated metrics and rate measurements.
        """
        if frames_df.empty:
            return {
                "total_frames_analyzed": 0,
                "session_duration_sec": 0.0,
                "phone_detected_ratio": 0.0,
                "looking_away_ratio": 0.0,
                "face_absent_ratio": 0.0,
                "multiple_faces_ratio": 0.0,
                "mean_face_confidence": 0.0,
                "is_empty": True,
            }

        df_feat = cls.engineer_frame_features(frames_df)
        total_frames = len(df_feat)
        est_duration = total_frames * sample_interval_sec

        phone_ratio = float(df_feat.get("phone_active", pd.Series(0)).mean()) if total_frames > 0 else 0.0
        away_ratio = float(df_feat.get("is_looking_away", pd.Series(0)).mean()) if total_frames > 0 else 0.0
        absent_ratio = float(df_feat.get("face_absent", pd.Series(0)).mean()) if total_frames > 0 else 0.0
        multi_face_ratio = float(df_feat.get("multiple_faces_detected", pd.Series(0)).mean()) if total_frames > 0 else 0.0
        mean_face_conf = float(pd.to_numeric(df_feat.get("face_conf", pd.Series(0)), errors="coerce").mean())

        return {
            "total_frames_analyzed": total_frames,
            "session_duration_sec": est_duration,
            "phone_detected_ratio": phone_ratio,
            "looking_away_ratio": away_ratio,
            "face_absent_ratio": absent_ratio,
            "multiple_faces_ratio": multi_face_ratio,
            "mean_face_confidence": mean_face_conf,
            "is_empty": False,
        }
