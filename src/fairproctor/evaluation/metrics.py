"""Comprehensive evaluation metrics and threshold curve analysis for FairProctor-AI."""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

logger = logging.getLogger("fairproctor.evaluation.metrics")


class ProctoringMetricsEvaluator:
    """Calculates operational and classification metrics for exam proctoring models."""

    @staticmethod
    def evaluate_binary_predictions(
        y_true: np.ndarray,
        y_prob: np.ndarray,
        threshold: float = 0.50
    ) -> Dict[str, Any]:
        """Calculates standard classification metrics at a given threshold."""
        y_pred = (y_prob >= threshold).astype(int)

        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))
        acc = float(accuracy_score(y_true, y_pred))

        # Handle edge cases for AUC
        has_both_classes = len(np.unique(y_true)) > 1
        roc = float(roc_auc_score(y_true, y_prob)) if has_both_classes else 0.5
        pr_auc = float(average_precision_score(y_true, y_prob)) if has_both_classes else 0.0

        cm = confusion_matrix(y_true, y_pred).tolist()

        return {
            "threshold": threshold,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc, 4),
            "pr_auc": round(pr_auc, 4),
            "confusion_matrix": cm,
            "total_samples": len(y_true),
            "positive_samples": int(np.sum(y_true)),
        }

    @staticmethod
    def evaluate_review_queue_reduction(
        y_true: np.ndarray,
        y_prob: np.ndarray,
        target_recall: float = 0.95
    ) -> Dict[str, Any]:
        """
        Computes the operational review queue reduction achievable while
        guaranteeing a minimum target recall (e.g. 95% of confirmed malpractice).
        """
        precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)

        # Find threshold that achieves >= target_recall with maximum precision
        valid_indices = np.where(recalls[:-1] >= target_recall)[0]

        if len(valid_indices) == 0:
            # Fallback to lowest threshold
            best_idx = 0
            best_threshold = float(thresholds[0]) if len(thresholds) > 0 else 0.5
        else:
            # Pick highest threshold that maintains target recall
            best_idx = valid_indices[-1]
            best_threshold = float(thresholds[best_idx])

        y_pred = (y_prob >= best_threshold).astype(int)
        achieved_recall = float(recall_score(y_true, y_pred, zero_division=0))
        achieved_precision = float(precision_score(y_true, y_pred, zero_division=0))

        # Queue reduction metric: % of sessions that DO NOT need human review
        review_queue_size = int(np.sum(y_pred))
        total_sessions = len(y_true)
        queue_pct = (review_queue_size / max(total_sessions, 1)) * 100.0
        reduction_pct = 100.0 - queue_pct

        return {
            "target_recall": target_recall,
            "optimal_threshold": round(best_threshold, 4),
            "achieved_recall": round(achieved_recall, 4),
            "achieved_precision": round(achieved_precision, 4),
            "review_queue_percentage": round(queue_pct, 2),
            "human_review_workload_reduction_pct": round(reduction_pct, 2),
            "sessions_flagged_for_review": review_queue_size,
            "total_sessions": total_sessions,
        }

    @staticmethod
    def threshold_sweep(
        y_true: np.ndarray,
        y_prob: np.ndarray,
        steps: int = 10
    ) -> List[Dict[str, Any]]:
        """Sweeps thresholds from 0.1 to 0.9 and computes metrics for each."""
        thresholds = np.linspace(0.1, 0.9, steps)
        results = []
        for t in thresholds:
            m = ProctoringMetricsEvaluator.evaluate_binary_predictions(y_true, y_prob, threshold=float(t))
            results.append(m)
        return results
