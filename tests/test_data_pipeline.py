"""Unit tests for dataset discovery, validation, and preprocessing pipelines."""

import numpy as np
import pandas as pd
import pytest

from fairproctor.data.inspect_datasets import DatasetInspector
from fairproctor.data.loaders import load_visual_dataset, load_behavioral_datasets
from fairproctor.data.preprocessing import build_tabular_preprocessor, get_feature_names_out
from fairproctor.data.validation import DataValidator, ValidationError


def test_dataset_discovery():
    """Verify that DatasetInspector finds the real data files."""
    inspector = DatasetInspector()
    files = inspector.discover_files()
    assert len(files) >= 4
    filenames = [f.name for f in files]
    assert any("Students suspicious behaviors" in name for name in filenames)
    assert any("Dataset1.csv" in name for name in filenames)


def test_pii_identifier_leakage_detection():
    """Verify that candidate identifiers are rejected by DataValidator."""
    leakage_df = pd.DataFrame({
        "Username/ID": ["Student1", "Student2"],
        "feature_1": [1.0, 2.0],
    })

    with pytest.raises(ValidationError, match="Forbidden candidate identifier columns"):
        DataValidator.validate_features_dataframe(leakage_df)


def test_infinite_values_rejected():
    """Verify that infinite numbers raise ValidationError."""
    inf_df = pd.DataFrame({
        "feature_1": [1.0, np.inf, 3.0],
    })

    with pytest.raises(ValidationError, match="contain Infinite values"):
        DataValidator.validate_features_dataframe(inf_df)


def test_target_validation():
    """Verify that invalid target series are properly caught."""
    # Valid binary
    valid_y = pd.Series([0, 1, 0, 1])
    DataValidator.validate_target_labels(valid_y)

    # Missing values
    with pytest.raises(ValidationError, match="contains NaN"):
        DataValidator.validate_target_labels(pd.Series([0, np.nan, 1]))

    # Single class only
    with pytest.raises(ValidationError, match="only one class"):
        DataValidator.validate_target_labels(pd.Series([0, 0, 0]))

    # Unexpected class
    with pytest.raises(ValidationError, match="unexpected classes"):
        DataValidator.validate_target_labels(pd.Series([0, 1, 2]))


def test_preprocessor_fitting_and_transformation():
    """Verify preprocessing pipeline fits correctly without data leakage."""
    train_df = pd.DataFrame({
        "num_1": [10.0, 20.0, np.nan],
        "cat_1": ["forward", "left", "down"],
    })
    test_df = pd.DataFrame({
        "num_1": [15.0, np.nan],
        "cat_1": ["forward", "unknown_category"],
    })

    preprocessor = build_tabular_preprocessor(
        numeric_features=["num_1"],
        categorical_features=["cat_1"],
        scale_numeric=True
    )

    # Fit on training data only
    preprocessor.fit(train_df)
    transformed_train = preprocessor.transform(train_df)
    transformed_test = preprocessor.transform(test_df)

    assert transformed_train.shape[0] == 3
    assert transformed_test.shape[0] == 2
    # Verify no NaN remains after median imputation
    assert not np.isnan(transformed_train).any()
    assert not np.isnan(transformed_test).any()

    feature_names = get_feature_names_out(preprocessor)
    assert len(feature_names) > 0
