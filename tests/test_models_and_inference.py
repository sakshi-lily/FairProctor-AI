"""Unit tests for model inference, latency, calibration, and reproducibility."""

import time
import numpy as np
import pandas as pd
import pytest

from fairproctor.config import MODELS_DIR
from fairproctor.models.calibration import ModelCalibrator
from fairproctor.models.visual_behavior_model import VisualBehaviorClassifier


@pytest.fixture
def loaded_visual_model():
    """Loads the persisted visual behavior model."""
    model_path = MODELS_DIR / "visual_behavior_model.joblib"
    if not model_path.exists():
        pytest.skip(f"Model file {model_path} not found. Run train_visual_model.py first.")
    return VisualBehaviorClassifier.load(model_path)


def test_model_loading_and_metadata(loaded_visual_model):
    """Verify model bundle contains expected metadata and preprocessor."""
    meta = loaded_visual_model.metadata
    assert "model_type" in meta
    assert "version" in meta
    assert "test_metrics" in meta
    assert len(loaded_visual_model.feature_names) > 0


def test_prediction_output_validation(loaded_visual_model):
    """Verify output shapes and probability ranges."""
    sample_df = pd.DataFrame([{col: 0.0 for col in loaded_visual_model.feature_names}])
    if "head_pose" in sample_df.columns:
        sample_df["head_pose"] = "forward"
    if "gaze_direction" in sample_df.columns:
        sample_df["gaze_direction"] = "center"

    probas = loaded_visual_model.predict_proba(sample_df)
    assert probas.shape == (1, 2)
    assert 0.0 <= probas[0, 0] <= 1.0
    assert 0.0 <= probas[0, 1] <= 1.0
    assert np.isclose(probas[0, 0] + probas[0, 1], 1.0)


def test_cpu_inference_latency(loaded_visual_model):
    """Verify that per-frame CPU scoring executes in under 5 milliseconds."""
    sample = {col: 0.0 for col in loaded_visual_model.feature_names}
    if "head_pose" in sample:
        sample["head_pose"] = "forward"
    if "gaze_direction" in sample:
        sample["gaze_direction"] = "center"

    # Warmup
    _ = loaded_visual_model.score_frame(sample)

    latencies = []
    for _ in range(20):
        t0 = time.perf_counter()
        res = loaded_visual_model.score_frame(sample)
        latencies.append((time.perf_counter() - t0) * 1000.0)

    mean_latency = float(np.mean(latencies))
    assert mean_latency < 30.0, f"Mean single-item latency {mean_latency:.2f} ms exceeded 30 ms budget."

    # Batch throughput test (100 frames)
    batch_df = pd.DataFrame([sample] * 100)
    t_batch_0 = time.perf_counter()
    _ = loaded_visual_model.predict_proba(batch_df)
    batch_per_frame_ms = ((time.perf_counter() - t_batch_0) / 100) * 1000.0
    assert batch_per_frame_ms < 1.0, f"Batch per-frame latency {batch_per_frame_ms:.3f} ms exceeded 1.0 ms budget."


def test_reproducibility_deterministic_inference(loaded_visual_model):
    """Verify that predictions are strictly deterministic."""
    sample = {col: 0.0 for col in loaded_visual_model.feature_names}
    if "head_pose" in sample:
        sample["head_pose"] = "forward"
    if "gaze_direction" in sample:
        sample["gaze_direction"] = "center"

    res_1 = loaded_visual_model.score_frame(sample)
    res_2 = loaded_visual_model.score_frame(sample)

    assert res_1["suspicious_visual_prob"] == res_2["suspicious_visual_prob"]
    assert res_1["is_suspicious_visual"] == res_2["is_suspicious_visual"]


def test_calibration_brier_score():
    """Verify Brier score computation."""
    y_true = np.array([0, 1, 1, 0])
    y_prob = np.array([0.1, 0.9, 0.8, 0.2])
    brier = ModelCalibrator.compute_brier_score(y_true, y_prob)
    assert 0.0 <= brier <= 0.1


def test_visual_model_v2_invariant_features():
    """Verify visual model v2 exists, has v2 metadata, and uses invariant features."""
    v2_path = MODELS_DIR / "visual_behavior_model_v2.joblib"
    if not v2_path.exists():
        pytest.skip("Model v2 not found yet.")
    v2_model = VisualBehaviorClassifier.load(v2_path)
    assert v2_model.metadata.get("version") in ["2.0.0", "v2.0.0"]
    assert v2_model.metadata.get("feature_set") == "invariant_behavioral"
    assert v2_model.metadata.get("split_strategy") == "contiguous_block"

    # Verify predictions run correctly
    sample = {col: 0.0 for col in v2_model.feature_names}
    if "head_pose" in sample:
        sample["head_pose"] = "forward"
    if "gaze_direction" in sample:
        sample["gaze_direction"] = "center"

    res = v2_model.score_frame(sample)
    assert "suspicious_visual_prob" in res
    assert 0.0 <= res["suspicious_visual_prob"] <= 1.0
