"""Visual Behavior Classification Model (Model A).

Trains and evaluates models on visual features to classify suspicious vs normal
frame-level behaviors (e.g., looking away, phone presence, off-script gaze).
Supports both v1 (full features, stratified split) and v2 (invariant behavioral
features, leakage-resistant contiguous block split).
"""

import hashlib
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import KFold, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline

from fairproctor.config import ARTIFACTS_DIR, MODELS_DIR, TrainingConfig
from fairproctor.data.loaders import load_visual_dataset
from fairproctor.data.preprocessing import build_tabular_preprocessor
from fairproctor.data.validation import DataValidator
from fairproctor.features.visual_features import VisualFeatureExtractor
from fairproctor.models.calibration import ModelCalibrator

logger = logging.getLogger("fairproctor.models.visual")

# Spatial coordinates that encode camera framing/participant position rather than behavior
RAW_SPATIAL_COORDINATES: List[str] = [
    "face_x", "face_y", "face_w", "face_h",
    "left_eye_x", "left_eye_y", "right_eye_x", "right_eye_y",
    "nose_tip_x", "nose_tip_y", "mouth_x", "mouth_y",
    "left_hand_x", "left_hand_y", "right_hand_x", "right_hand_y",
    "phone_loc_x", "phone_loc_y",
    "gazePoint_x", "gazePoint_y",
    "pupil_left_x", "pupil_left_y", "pupil_right_x", "pupil_right_y"
]


class VisualBehaviorClassifier:
    """End-to-end wrapper around the trained visual behavior pipeline and metadata."""

    def __init__(
        self,
        pipeline: Pipeline,
        feature_names: List[str],
        metadata: Dict[str, Any]
    ):
        self.pipeline = pipeline
        self.feature_names = feature_names
        self.metadata = metadata

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Predicts probabilities of suspicious visual behavior [P(normal), P(suspicious)]."""
        # Ensure only expected features are passed to pipeline
        cols_present = [c for c in self.feature_names if c in X.columns]
        X_sub = X[cols_present].copy()
        # Add any missing expected columns with default/median values
        for c in self.feature_names:
            if c not in X_sub.columns:
                X_sub[c] = 0.0
        return self.pipeline.predict_proba(X_sub[self.feature_names])

    def predict(self, X: pd.DataFrame, threshold: float = 0.50) -> np.ndarray:
        """Predicts binary label based on configurable probability threshold."""
        proba = self.predict_proba(X)[:, 1]
        return (proba >= threshold).astype(int)

    def score_frame(self, frame_series_or_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Scores a single frame and returns calibrated probability and prediction."""
        start_time = time.perf_counter()
        df = pd.DataFrame([frame_series_or_dict])
        proba = float(self.predict_proba(df)[0, 1])
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return {
            "suspicious_visual_prob": round(proba, 4),
            "is_suspicious_visual": proba >= 0.50,
            "latency_ms": round(latency_ms, 3),
        }

    def save(self, output_path: Optional[Path] = None) -> Path:
        """Serializes model, preprocessor, feature schema, and metadata to disk."""
        version = self.metadata.get("version", "1.0.0")
        default_name = "visual_behavior_model_v2.joblib" if version.startswith("2") else "visual_behavior_model.joblib"
        out = output_path or (MODELS_DIR / default_name)
        out.parent.mkdir(parents=True, exist_ok=True)
        bundle = {
            "pipeline": self.pipeline,
            "feature_names": self.feature_names,
            "metadata": self.metadata,
        }
        joblib.dump(bundle, out)
        logger.info(f"Saved visual behavior model bundle to {out}")
        return out

    @classmethod
    def load(cls, model_path: Optional[Path] = None) -> "VisualBehaviorClassifier":
        """Loads a persisted model bundle from disk (prefers v2 if available)."""
        if model_path is None:
            v2_path = MODELS_DIR / "visual_behavior_model_v2.joblib"
            v1_path = MODELS_DIR / "visual_behavior_model.joblib"
            model_path = v2_path if v2_path.exists() else v1_path

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        bundle = joblib.load(model_path)
        return cls(
            pipeline=bundle["pipeline"],
            feature_names=bundle["feature_names"],
            metadata=bundle["metadata"],
        )


class VisualModelTrainer:
    """Trains, compares, and evaluates candidate models on visual features."""

    def __init__(self, config: Optional[TrainingConfig] = None):
        self.config = config or TrainingConfig()

    def train_and_evaluate(
        self,
        data_path: Optional[Path] = None,
        use_invariant_features: bool = True,
        split_strategy: str = "contiguous_block",
        model_version: str = "2.0.0"
    ) -> Tuple[VisualBehaviorClassifier, Dict[str, Any]]:
        """
        Trains and compares candidate models (Logistic Regression, Random Forest,
        HistGradientBoosting) using leakage-resistant validation.

        Args:
            data_path: Optional path to Mendeley CSV.
            use_invariant_features: If True (v2), drops 22 raw spatial coordinates.
            split_strategy: 'contiguous_block' (prevents adjacent-frame leakage) or 'random_stratified'.
            model_version: '2.0.0' for invariant block-split, '1.0.0' for legacy.
        """
        dataset = load_visual_dataset(data_path)
        features_df = dataset.features_df
        labels = dataset.labels

        # Validation
        DataValidator.validate_features_dataframe(features_df)
        DataValidator.validate_target_labels(labels)

        # Feature selection
        if use_invariant_features:
            selected_features = [c for c in features_df.columns if c not in RAW_SPATIAL_COORDINATES]
            excluded_features = list(RAW_SPATIAL_COORDINATES)
            logger.info(f"Using {len(selected_features)} invariant behavioral features (dropped {len(excluded_features)} spatial coords).")
        else:
            selected_features = list(features_df.columns)
            excluded_features = []
            logger.info(f"Using all {len(selected_features)} raw visual features.")

        X = features_df[selected_features].copy()
        y = labels.copy()

        num_cols = [c for c in selected_features if c not in ["head_pose", "gaze_direction"]]
        cat_cols = [c for c in selected_features if c in ["head_pose", "gaze_direction"]]

        # Split Strategy
        if split_strategy == "contiguous_block":
            # Out-of-sequence block partition: first 80% development, last 20% holdout test
            split_idx = int(len(X) * (1.0 - self.config.test_size))
            X_train_val = X.iloc[:split_idx].reset_index(drop=True)
            y_train_val = y.iloc[:split_idx].reset_index(drop=True)
            X_test = X.iloc[split_idx:].reset_index(drop=True)
            y_test = y.iloc[split_idx:].reset_index(drop=True)
            # Contiguous KFold without shuffle on development split
            cv_splitter = KFold(n_splits=self.config.n_splits, shuffle=False)
            logger.info(f"Contiguous block split: {len(X_train_val)} dev, {len(X_test)} holdout test.")
        else:
            # Legacy random stratified split (subject to adjacent frame leakage)
            X_train_val, X_test, y_train_val, y_test = train_test_split(
                X, y,
                test_size=self.config.test_size,
                random_state=self.config.random_seed,
                stratify=y
            )
            cv_splitter = StratifiedKFold(n_splits=self.config.n_splits, shuffle=True, random_state=self.config.random_seed)
            logger.info(f"Random stratified split: {len(X_train_val)} dev, {len(X_test)} holdout test.")

        # Candidate Model definitions
        candidates: Dict[str, BaseEstimator] = {
            "logistic_regression": LogisticRegression(
                max_iter=1000,
                random_state=self.config.random_seed,
                class_weight="balanced"
            ),
            "random_forest": RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=self.config.random_seed,
                n_jobs=-1,
                class_weight="balanced"
            ),
            "hist_gradient_boosting": HistGradientBoostingClassifier(
                max_iter=100,
                random_state=self.config.random_seed,
                class_weight="balanced"
            ),
        }

        cv_results: Dict[str, Dict[str, float]] = {}
        logger.info(f"Evaluating candidate models with 5-fold ({split_strategy}) CV on development split...")

        for name, clf in candidates.items():
            preprocessor = build_tabular_preprocessor(num_cols, cat_cols)
            pipe = Pipeline([
                ("preprocessor", preprocessor),
                ("classifier", clf)
            ])

            f1_scores, precisions, recalls, roc_aucs, accs = [], [], [], [], []
            for train_idx, val_idx in cv_splitter.split(X_train_val, y_train_val):
                X_tr, X_val = X_train_val.iloc[train_idx], X_train_val.iloc[val_idx]
                y_tr, y_val = y_train_val.iloc[train_idx], y_train_val.iloc[val_idx]

                pipe.fit(X_tr, y_tr)
                preds = pipe.predict(X_val)
                probas = pipe.predict_proba(X_val)[:, 1] if hasattr(pipe, "predict_proba") else preds

                f1_scores.append(f1_score(y_val, preds, zero_division=0))
                precisions.append(precision_score(y_val, preds, zero_division=0))
                recalls.append(recall_score(y_val, preds, zero_division=0))
                accs.append(accuracy_score(y_val, preds))
                roc_aucs.append(roc_auc_score(y_val, probas) if len(np.unique(y_val)) > 1 else 0.5)

            cv_results[name] = {
                "mean_f1": float(np.mean(f1_scores)),
                "std_f1": float(np.std(f1_scores)),
                "mean_accuracy": float(np.mean(accs)),
                "mean_precision": float(np.mean(precisions)),
                "mean_recall": float(np.mean(recalls)),
                "mean_roc_auc": float(np.mean(roc_aucs)),
            }
            logger.info(f"Model [{name}]: CV F1={np.mean(f1_scores):.4f} (+/- {np.std(f1_scores):.4f}), ROC-AUC={np.mean(roc_aucs):.4f}")

        # Model Selection: Pick best based on CV F1 score
        best_name = max(cv_results, key=lambda k: cv_results[k]["mean_f1"])
        logger.info(f"Selected best model on development split: [{best_name}]")

        # Fit final pipeline on all development data
        final_preprocessor = build_tabular_preprocessor(num_cols, cat_cols)
        best_clf = candidates[best_name]
        final_pipeline = Pipeline([
            ("preprocessor", final_preprocessor),
            ("classifier", best_clf)
        ])
        final_pipeline.fit(X_train_val, y_train_val)

        # Isolated Test Set Evaluation
        start_eval = time.perf_counter()
        test_preds = final_pipeline.predict(X_test)
        test_probas = final_pipeline.predict_proba(X_test)[:, 1]
        inference_latency_ms = ((time.perf_counter() - start_eval) / max(len(X_test), 1)) * 1000.0

        test_acc = accuracy_score(y_test, test_preds)
        test_prec = precision_score(y_test, test_preds, zero_division=0)
        test_rec = recall_score(y_test, test_preds, zero_division=0)
        test_f1 = f1_score(y_test, test_preds, zero_division=0)
        test_roc_auc = roc_auc_score(y_test, test_probas)
        test_pr_auc = average_precision_score(y_test, test_probas)
        conf_mat = confusion_matrix(y_test, test_preds).tolist()
        calib_stats = ModelCalibrator.compute_calibration_curve(y_test.to_numpy(), test_probas)

        metadata = {
            "model_type": best_name,
            "version": model_version,
            "trained_at": datetime.utcnow().isoformat(),
            "source_dataset": str(dataset.source_file.name),
            "is_simulated_dataset": dataset.is_simulated,
            "split_strategy": split_strategy,
            "feature_set": "invariant_behavioral" if use_invariant_features else "full_features",
            "feature_count": len(selected_features),
            "excluded_features": excluded_features,
            "limitations_note": (
                "Trained on staged laboratory behaviors. "
                "Spatial coordinates removed to prevent seat/framing overfitting. "
                "Contiguous block evaluation prevents adjacent-frame leakage."
            ),
            "cv_benchmark": cv_results,
            "test_metrics": {
                "accuracy": round(test_acc, 4),
                "precision": round(test_prec, 4),
                "recall": round(test_rec, 4),
                "f1_score": round(test_f1, 4),
                "roc_auc": round(test_roc_auc, 4),
                "pr_auc": round(test_pr_auc, 4),
                "confusion_matrix": conf_mat,
                "brier_score": calib_stats["brier_score"],
                "inference_latency_ms_per_frame": round(inference_latency_ms, 4),
            },
            "training_samples": len(X_train_val),
            "test_samples": len(X_test),
            "class_distribution_test": {
                str(k): int(v) for k, v in y_test.value_counts().to_dict().items()
            }
        }

        classifier = VisualBehaviorClassifier(
            pipeline=final_pipeline,
            feature_names=selected_features,
            metadata=metadata
        )

        return classifier, metadata
