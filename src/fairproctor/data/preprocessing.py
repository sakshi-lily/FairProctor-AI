"""Feature preprocessing pipelines and transformers."""

import logging
from typing import Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

logger = logging.getLogger("fairproctor.data.preprocessing")


class StringNormalizer(BaseEstimator, TransformerMixin):
    """Transformer that strips whitespace and lowers strings, handling 'None' as category."""

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_df = pd.DataFrame(X).copy()
        for col in X_df.columns:
            X_df[col] = X_df[col].astype(str).str.strip().str.lower().replace({"nan": "unknown", "none": "unknown"})
        return X_df

    def get_feature_names_out(self, input_features=None):
        if input_features is not None:
            return np.array(input_features, dtype=object)
        return np.array(["cat_feature"], dtype=object)


def build_tabular_preprocessor(
    numeric_features: List[str],
    categorical_features: List[str],
    scale_numeric: bool = True
) -> ColumnTransformer:
    """
    Constructs a ColumnTransformer that preprocesses numeric and categorical features cleanly.

    Args:
        numeric_features: List of column names to impute with median and optionally scale.
        categorical_features: List of column names to normalize and One-Hot encode.
        scale_numeric: Whether to apply StandardScaler to numeric columns.

    Returns:
        Configured, unfitted ColumnTransformer.
    """
    transformers = []

    if numeric_features:
        num_steps = [
            ("imputer", SimpleImputer(strategy="median")),
        ]
        if scale_numeric:
            num_steps.append(("scaler", StandardScaler()))

        num_pipeline = Pipeline(steps=num_steps)
        transformers.append(("num", num_pipeline, numeric_features))

    if categorical_features:
        cat_pipeline = Pipeline(steps=[
            ("normalizer", StringNormalizer()),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ])
        transformers.append(("cat", cat_pipeline, categorical_features))

    preprocessor = ColumnTransformer(
        transformers=transformers,
        remainder="drop"  # Drop any unselected/ID columns automatically
    )
    return preprocessor


def get_feature_names_out(preprocessor: ColumnTransformer) -> List[str]:
    """Retrieves human-readable feature names after transformation."""
    try:
        return list(preprocessor.get_feature_names_out())
    except Exception as e:
        logger.warning(f"Could not retrieve feature names from preprocessor: {e}")
        return []
