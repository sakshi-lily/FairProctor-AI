"""Probability calibration and reliability evaluation for FairProctor-AI models."""

import logging
from typing import Any, Dict, Optional, Tuple

import numpy as np
from sklearn.calibration import CalibratedClassifierCV, calibration_curve

logger = logging.getLogger("fairproctor.models.calibration")


class ModelCalibrator:
    """Calibrates classifier probabilities and calculates calibration metrics."""

    @staticmethod
    def calibrate_estimator(
        base_estimator: Any,
        X_val: np.ndarray,
        y_val: np.ndarray,
        method: str = "sigmoid"
    ) -> CalibratedClassifierCV:
        """
        Calibrates a pre-fitted estimator using a dedicated validation split.

        Args:
            base_estimator: Pre-fitted classifier.
            X_val: Feature matrix of validation set.
            y_val: Binary targets of validation set.
            method: 'sigmoid' (Platt scaling) or 'isotonic'.

        Returns:
            Fitted CalibratedClassifierCV.
        """
        calibrated = CalibratedClassifierCV(
            estimator=base_estimator,
            method=method,
            cv="prefit"
        )
        calibrated.fit(X_val, y_val)
        return calibrated

    @staticmethod
    def compute_brier_score(y_true: np.ndarray, y_prob: np.ndarray) -> float:
        """Computes mean squared error between predicted probabilities and binary outcomes."""
        return float(np.mean((y_prob - y_true) ** 2))

    @staticmethod
    def compute_calibration_curve(
        y_true: np.ndarray,
        y_prob: np.ndarray,
        n_bins: int = 5
    ) -> Dict[str, Any]:
        """Calculates empirical fraction of positives vs mean predicted probability across bins."""
        prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=n_bins, strategy="uniform")
        brier = ModelCalibrator.compute_brier_score(y_true, y_prob)

        return {
            "fraction_of_positives": [float(x) for x in prob_true],
            "mean_predicted_value": [float(x) for x in prob_pred],
            "brier_score": round(brier, 4),
        }
