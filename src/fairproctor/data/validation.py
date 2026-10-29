"""Data and schema validation utilities for FairProctor-AI."""

import logging
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger("fairproctor.data.validation")

# Strictly forbidden feature identifiers to guarantee privacy and prevent candidate overfitting
FORBIDDEN_IDENTIFIER_COLUMNS: Set[str] = {
    "username/id", "username", "user_id", "studentid", "student_id",
    "candidate_id", "candidate", "id", "name", "email", "ip_address", "mac_address"
}


class ValidationError(Exception):
    """Raised when data validation fails safety or schema rules."""
    pass


class DataValidator:
    """Validates schemas, data quality, and ensures strict privacy safeguards."""

    @staticmethod
    def check_for_identifiers(columns: List[str]) -> List[str]:
        """Detects whether candidate identifiers are present in feature columns."""
        flagged: List[str] = []
        for col in columns:
            col_norm = col.lower().strip()
            if col_norm in FORBIDDEN_IDENTIFIER_COLUMNS or "username" in col_norm or "student" in col_norm:
                flagged.append(col)
        return flagged

    @staticmethod
    def validate_features_dataframe(
        df: pd.DataFrame,
        expected_columns: Optional[List[str]] = None,
        max_missing_ratio: float = 0.50,
        allow_empty: bool = False
    ) -> Dict[str, Any]:
        """
        Validates feature dataframe for shape, missingness, infs, and forbidden IDs.

        Raises:
            ValidationError: If forbidden identifiers or unrecoverable flaws exist.
        """
        if df.empty and not allow_empty:
            raise ValidationError("DataFrame is empty. Cannot process empty features.")

        # 1. PII and Identifier Check
        identifiers = DataValidator.check_for_identifiers(list(df.columns))
        if identifiers:
            raise ValidationError(
                f"Privacy Violation: Forbidden candidate identifier columns detected: {identifiers}. "
                "Identifiers must be dropped before feature processing."
            )

        # 2. Expected Columns Check
        if expected_columns is not None:
            missing_cols = set(expected_columns) - set(df.columns)
            if missing_cols:
                raise ValidationError(
                    f"Schema mismatch: missing expected columns: {sorted(list(missing_cols))}"
                )

        # 3. Numeric Infs Check
        num_cols = df.select_dtypes(include=[np.number]).columns
        has_inf = np.isinf(df[num_cols].to_numpy()).any() if len(num_cols) > 0 and len(df) > 0 else False
        if has_inf:
            raise ValidationError("Numeric features contain Infinite values (+inf or -inf).")

        # 4. Missing Rate Check
        high_missing_cols = {}
        for col in df.columns:
            miss_rate = df[col].isna().mean()
            if miss_rate > max_missing_ratio:
                high_missing_cols[col] = miss_rate

        # 5. Near-constant check
        constant_cols = [c for c in df.columns if df[c].nunique(dropna=True) <= 1]

        return {
            "is_valid": True,
            "row_count": len(df),
            "column_count": len(df.columns),
            "high_missing_cols": high_missing_cols,
            "constant_columns": constant_cols,
        }

    @staticmethod
    def validate_target_labels(labels: pd.Series, expected_classes: Tuple[int, ...] = (0, 1)) -> None:
        """Validates that target labels are clean, binary, and non-empty."""
        if labels.empty:
            raise ValidationError("Target series is empty.")

        if labels.isna().any():
            raise ValidationError("Target series contains NaN/missing values.")

        unique_vals = set(labels.unique())
        if not unique_vals.issubset(set(expected_classes)):
            raise ValidationError(
                f"Target contains unexpected classes: {unique_vals}. Expected subset of {expected_classes}."
            )

        # Ensure at least 1 instance of each class for binary classification
        if len(unique_vals) < 2:
            raise ValidationError(
                f"Target contains only one class ({unique_vals}). Cannot train or evaluate binary classifier."
            )
