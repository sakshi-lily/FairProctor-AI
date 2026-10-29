"""Fairness, environmental subgroup audits, and low-bandwidth validation."""

import logging
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix, precision_score, recall_score

logger = logging.getLogger("fairproctor.evaluation.fairness")


class FairnessAuditor:
    """Evaluates error parity and false-positive rates across environmental conditions."""

    @staticmethod
    def audit_subgroup_disparity(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        group_mask: np.ndarray,
        group_name: str
    ) -> Dict[str, Any]:
        """
        Evaluates precision, recall, false positive rate (FPR), and sample counts
        for a designated subgroup vs the reference group.
        """
        n_total = len(y_true)
        sub_true = y_true[group_mask]
        sub_pred = y_pred[group_mask]

        ref_true = y_true[~group_mask]
        ref_pred = y_pred[~group_mask]

        def get_group_stats(y_t: np.ndarray, y_p: np.ndarray) -> Dict[str, Any]:
            if len(y_t) == 0:
                return {"samples": 0, "precision": 0.0, "recall": 0.0, "fpr": None, "negative_samples": 0}
            prec = float(precision_score(y_t, y_p, zero_division=0))
            rec = float(recall_score(y_t, y_p, zero_division=0))

            tn, fp, fn, tp = confusion_matrix(y_t, y_p, labels=[0, 1]).ravel()
            total_neg = fp + tn
            fpr = float(fp / total_neg) if total_neg > 0 else None

            return {
                "samples": len(y_t),
                "negative_samples": int(total_neg),
                "positive_samples": int(tp + fn),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "fpr": round(fpr, 4) if fpr is not None else "UNDEFINED_ZERO_NEGATIVES",
                "false_positives": int(fp),
                "true_positives": int(tp),
                "false_negatives": int(fn),
                "true_negatives": int(tn),
            }

        subgroup_stats = get_group_stats(sub_true, sub_pred)
        reference_stats = get_group_stats(ref_true, ref_pred)

        # FPR disparity ratio (subgroup FPR / reference FPR)
        ref_fpr = reference_stats["fpr"]
        sub_fpr = subgroup_stats["fpr"]
        if isinstance(sub_fpr, (int, float)) and isinstance(ref_fpr, (int, float)):
            disparity_ratio = round(sub_fpr / max(ref_fpr, 0.0001), 3)
            is_disproportionate = disparity_ratio > 1.25
        else:
            disparity_ratio = "CANNOT_COMPUTE"
            is_disproportionate = False

        return {
            "group_name": group_name,
            "subgroup_metrics": subgroup_stats,
            "reference_metrics": reference_stats,
            "fpr_disparity_ratio": disparity_ratio,
            "is_fpr_disproportionate": is_disproportionate,
            "auditable": subgroup_stats["negative_samples"] >= 5,
            "audit_warning": (
                "Subgroup contains zero or insufficient negative (normal) cases to compute False Positive Rate. "
                "Empirical fairness cannot be claimed from this dataset."
                if subgroup_stats["negative_samples"] < 5 else None
            ),
        }

    @staticmethod
    def evaluate_visual_subgroups(
        features_df: pd.DataFrame,
        y_true: np.ndarray,
        y_pred: np.ndarray
    ) -> Dict[str, Any]:
        """
        Performs fairness audits across environmental slices present in the visual dataset:
        1. Low face detection confidence (< 75%, proxy for poor lighting / distance)
        2. Multiple faces present in frame (proxy for shared room / background individuals)
        """
        results: Dict[str, Any] = {}

        # 1. Lighting / Face Confidence Subgroup
        if "face_conf" in features_df.columns:
            low_conf_mask = (pd.to_numeric(features_df["face_conf"], errors="coerce") < 75.0).to_numpy()
            if low_conf_mask.sum() >= 10:
                results["poor_lighting_subgroup"] = FairnessAuditor.audit_subgroup_disparity(
                    y_true, y_pred, low_conf_mask, "Poor Lighting (Face Conf < 75%)"
                )
            else:
                results["poor_lighting_subgroup"] = {
                    "status": "INSUFFICIENT_SAMPLES",
                    "note": f"Only {low_conf_mask.sum()} samples met the poor lighting condition."
                }

        # 2. Shared room / Multiple Faces Subgroup
        if "no_of_face" in features_df.columns:
            multi_face_mask = (pd.to_numeric(features_df["no_of_face"], errors="coerce") > 1).to_numpy()
            if multi_face_mask.sum() >= 10:
                results["multiple_faces_subgroup"] = FairnessAuditor.audit_subgroup_disparity(
                    y_true, y_pred, multi_face_mask, "Multiple Faces Detected"
                )
            else:
                results["multiple_faces_subgroup"] = {
                    "status": "INSUFFICIENT_SAMPLES",
                    "note": f"Only {multi_face_mask.sum()} frames contain multiple faces in this dataset."
                }

        return results

    @staticmethod
    def evaluate_low_bandwidth_downsampling(
        frames_df: pd.DataFrame,
        model_predict_fn: Any,
        subsample_stride: int = 5
    ) -> Dict[str, Any]:
        """
        Validates low-bandwidth operation by downsampling continuous frames
        (e.g., simulating 0.2 FPS / 1 frame per 5 seconds).
        """
        if frames_df.empty:
            return {"status": "EMPTY_INPUT"}

        # Full stream predictions
        full_preds = model_predict_fn(frames_df)

        # Downsampled stream (taking every N-th frame)
        downsampled_df = frames_df.iloc[::subsample_stride].reset_index(drop=True)
        downsampled_preds = model_predict_fn(downsampled_df)

        full_suspicious_ratio = float(np.mean(full_preds))
        down_suspicious_ratio = float(np.mean(downsampled_preds))

        discrepancy = abs(full_suspicious_ratio - down_suspicious_ratio)

        return {
            "stride": subsample_stride,
            "full_frames_evaluated": len(frames_df),
            "downsampled_frames_evaluated": len(downsampled_df),
            "full_suspicious_rate": round(full_suspicious_ratio, 4),
            "downsampled_suspicious_rate": round(down_suspicious_ratio, 4),
            "rate_discrepancy": round(discrepancy, 4),
            "low_bandwidth_stability": "STABLE" if discrepancy < 0.08 else "DRIFT_DETECTED",
        }
