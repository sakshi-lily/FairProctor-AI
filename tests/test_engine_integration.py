"""End-to-end integration tests for FairProctorEngine and local FastAPI service.

Verifies:
- Multimodal session scoring
- Modality-isolated sessions (video-only, browser-only, empty)
- Missing modalities reporting and confidence degradation
- Fairness properties (poor lighting, low bandwidth, multiple faces in shared room)
- Repeated correlated observation clustering
- Paste event policy enforcement
- Timestamp validation and malformed input handling
- Model loading failures without fallback
- Evidence traceability
- FastAPI endpoints (/health, /status, /score-session)
"""

import pytest
from fastapi.testclient import TestClient

from fairproctor.api.schemas import (
    BrowserEventsInput,
    EnvironmentalConditionsInput,
    ExamPolicyInput,
    ScoreSessionRequest,
    VisualFrameInput,
)
from fairproctor.api.service import create_app
from fairproctor.config import MODELS_DIR
from fairproctor.engine.policy import ExamPolicy
from fairproctor.engine.risk_engine import FairProctorEngine


@pytest.fixture
def engine_v2():
    """Initializes FairProctorEngine with Visual Model v2.0.0."""
    return FairProctorEngine.load(visual_version="v2")


@pytest.fixture
def api_client(engine_v2):
    """Initializes FastAPI TestClient with pre-loaded engine."""
    app = create_app(engine=engine_v2)
    return TestClient(app)


# -----------------------------------------------------------------------------
# 1. Valid Multimodal Session
# -----------------------------------------------------------------------------
def test_valid_multimodal_session(engine_v2):
    """Verify that a complete multimodal session produces a valid, explainable assessment."""
    session_data = {
        "session_id": "session_multi_001",
        "session_metadata": {"is_shared_room": True, "expected_duration_sec": 50.0},
        "video_observations": [
            {"timestamp_sec": float(i * 5), "face_present": 1, "no_of_face": 1, "head_pose": "forward", "phone_present": 0}
            for i in range(10)
        ],
        "browser_events": {
            "total_tab_switches": 0,
            "paste_count": 0,
            "rapid_answer_count": 0,
        },
        "environmental_conditions": {
            "fps": 0.2,
            "network_interruptions": 0,
        },
        "policy": ExamPolicy(shared_room_candidate=True),
    }

    result = engine_v2.score_session(session_data)
    assert result.session_id == "session_multi_001"
    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert result.risk_level == "LOW"
    assert result.recommended_action == "NO_ACTION"
    assert result.model_version in ["2.0.0", "v2.0.0"]
    assert result.policy_version == "1.0.0"
    assert "HIGH" in result.confidence_or_uncertainty
    assert len(result.missing_data) == 0


# -----------------------------------------------------------------------------
# 2. Video-Only Session
# -----------------------------------------------------------------------------
def test_video_only_session(engine_v2):
    """Verify that a session with only video observations is scored safely."""
    session_data = {
        "session_id": "session_video_only",
        "session_metadata": {"expected_duration_sec": 25.0},
        "video_observations": [
            {"timestamp_sec": float(i * 5), "face_present": 1, "no_of_face": 1, "head_pose": "forward", "phone_present": 0}
            for i in range(5)
        ],
        "browser_events": None,
    }

    result = engine_v2.score_session(session_data)
    assert result.risk_score == 0.0
    assert "browser_telemetry" in result.missing_data
    assert "video_stream" not in result.missing_data
    assert "MODERATE" in result.confidence_or_uncertainty


# -----------------------------------------------------------------------------
# 3. Browser-Event-Only Session
# -----------------------------------------------------------------------------
def test_browser_only_session(engine_v2):
    """Verify that a session with only browser event telemetry is scored safely."""
    session_data = {
        "session_id": "session_browser_only",
        "video_observations": None,
        "browser_events": {
            "total_tab_switches": 2,
            "paste_count": 0,
            "rapid_answer_count": 0,
        },
        "policy": ExamPolicy(allow_tab_switch=False, max_tolerated_tab_switches=1),
    }

    result = engine_v2.score_session(session_data)
    assert result.risk_score > 0.0
    assert "video_stream" in result.missing_data
    assert "browser_telemetry" not in result.missing_data
    assert any(e["observation_type"] == "TAB_SWITCH_VIOLATION" for e in result.evidence_timeline)


# -----------------------------------------------------------------------------
# 4. Empty Session Handling
# -----------------------------------------------------------------------------
def test_empty_session_handling(engine_v2):
    """Verify that an empty payload returns a benign, safe default assessment."""
    result = engine_v2.score_session({})
    assert result.session_id == "session_unknown"
    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert result.risk_level == "LOW"
    assert "video_stream" in result.missing_data
    assert "browser_telemetry" in result.missing_data
    assert "LOW" in result.confidence_or_uncertainty


# -----------------------------------------------------------------------------
# 5. Missing Modalities Reporting
# -----------------------------------------------------------------------------
def test_missing_modalities_reporting(engine_v2):
    """Verify that absent telemetry streams are transparently listed in missing_data."""
    session_data = {
        "session_id": "session_missing_modalities",
        "video_observations": [],
        "browser_events": {},
    }
    result = engine_v2.score_session(session_data)
    assert "video_stream" in result.missing_data
    assert "browser_telemetry" in result.missing_data
    # Missing data alone must not be penalized
    assert result.risk_score == 0.0


# -----------------------------------------------------------------------------
# 6. Poor Lighting Safeguard
# -----------------------------------------------------------------------------
def test_poor_lighting_safeguard(engine_v2):
    """Verify that dark or poor ambient lighting never increases misconduct risk."""
    frames = [
        {"timestamp_sec": float(i * 5), "face_present": 1, "no_of_face": 1, "face_conf": 35.0, "head_pose": "forward", "phone_present": 0}
        for i in range(10)
    ]
    session_data = {
        "session_id": "session_dim_room",
        "video_observations": frames,
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
    }
    result = engine_v2.score_session(session_data)
    assert result.risk_score == 0.0
    assert any("Poor lighting" in w for w in result.environmental_warnings)


# -----------------------------------------------------------------------------
# 7. Low Bandwidth Safeguard
# -----------------------------------------------------------------------------
def test_low_bandwidth_safeguard(engine_v2):
    """Verify that 0.2 FPS downsampling and network disconnects do not inflate risk."""
    session_data = {
        "session_id": "session_low_bw",
        "video_observations": [
            {"timestamp_sec": float(i * 5), "face_present": 1, "no_of_face": 1, "head_pose": "forward", "phone_present": 0}
            for i in range(4)
        ],
        "environmental_conditions": {
            "fps": 0.2,
            "network_interruptions": 3,
        },
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
    }
    result = engine_v2.score_session(session_data)
    assert result.risk_score == 0.0
    assert any("network interruptions" in w for w in result.environmental_warnings)


# -----------------------------------------------------------------------------
# 8. Multiple Faces in Shared Room Safeguard
# -----------------------------------------------------------------------------
def test_multiple_faces_in_shared_room(engine_v2):
    """Verify that candidates with roommates/family in shared rooms are not penalized (IM-102)."""
    frames = [
        {"timestamp_sec": float(i * 5), "face_present": 1, "no_of_face": 2, "head_pose": "forward", "phone_present": 0}
        for i in range(6)
    ]
    session_data = {
        "session_id": "session_shared_room",
        "session_metadata": {"is_shared_room": True},
        "video_observations": frames,
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
        "policy": ExamPolicy(shared_room_candidate=True),
    }
    result = engine_v2.score_session(session_data)
    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0

    bg_items = [e for e in result.evidence_timeline if e["observation_type"] == "BACKGROUND_PERSON_DETECTED"]
    assert len(bg_items) == 1
    assert bg_items[0]["contribution_score"] == 0.0
    assert bg_items[0]["severity"] == "INFO"


# -----------------------------------------------------------------------------
# 9. Repeated Correlated Detections Clustering
# -----------------------------------------------------------------------------
def test_repeated_correlated_detections(engine_v2):
    """Verify that 10 consecutive phone detection frames within 15s are clustered into one episode."""
    frames = [
        {"timestamp_sec": float(i * 2), "face_present": 1, "no_of_face": 1, "phone_present": 1, "phone_conf": 0.88}
        for i in range(10)
    ]
    session_data = {
        "session_id": "session_phone_cluster",
        "video_observations": frames,
    }
    result = engine_v2.score_session(session_data)
    phone_flags = [e for e in result.evidence_timeline if e["observation_type"] == "PHONE_DETECTED"]

    # Merged into a single continuous episode
    assert len(phone_flags) == 1
    assert "0s - 18s" in phone_flags[0]["timestamp_or_interval"]
    assert phone_flags[0]["contribution_score"] <= 40.0


# -----------------------------------------------------------------------------
# 10. Permitted vs Prohibited Paste Events
# -----------------------------------------------------------------------------
def test_permitted_vs_prohibited_paste_events(engine_v2):
    """Verify that paste events are penalized when prohibited, but allowed when configured."""
    session_base = {
        "session_id": "session_paste_test",
        "browser_events": {"paste_count": 3, "total_tab_switches": 0},
    }

    # Prohibited
    policy_prohibited = ExamPolicy(allow_copy_paste=False)
    res_prohibited = engine_v2.score_session({**session_base, "policy": policy_prohibited})
    assert res_prohibited.risk_score > 0.0
    assert any(e["observation_type"] == "COPY_PASTE_VIOLATION" for e in res_prohibited.evidence_timeline)

    # Permitted
    policy_permitted = ExamPolicy(allow_copy_paste=True)
    res_permitted = engine_v2.score_session({**session_base, "policy": policy_permitted})
    assert res_permitted.risk_score == 0.0
    assert not any(e["observation_type"] == "COPY_PASTE_VIOLATION" for e in res_permitted.evidence_timeline)
    assert any(e["observation_type"] == "PERMITTED_PASTE_EVENT" for e in res_permitted.evidence_timeline)


# -----------------------------------------------------------------------------
# 11. Invalid Timestamps Rejected
# -----------------------------------------------------------------------------
def test_invalid_timestamps_rejected(engine_v2):
    """Verify that negative timestamps are explicitly rejected."""
    frames = [
        {"timestamp_sec": -5.0, "face_present": 1, "phone_present": 0},
        {"timestamp_sec": 10.0, "face_present": 1, "phone_present": 0},
    ]
    session_data = {
        "session_id": "session_negative_ts",
        "video_observations": frames,
    }
    with pytest.raises(ValueError, match="timestamp_sec cannot be negative"):
        engine_v2.score_session(session_data)


# -----------------------------------------------------------------------------
# 12. Model Version Integrity
# -----------------------------------------------------------------------------
def test_model_version_integrity(engine_v2):
    """Verify that active visual model is v2.0.0 and recorded in assessment."""
    assert engine_v2.version in ["2.0.0", "v2.0.0"]
    session_data = {"session_id": "session_version_check"}
    res = engine_v2.score_session(session_data)
    assert res.model_version in ["2.0.0", "v2.0.0"]
    assert res.policy_version == "1.0.0"


# -----------------------------------------------------------------------------
# 13. Model Loading Failure Without Fallback
# -----------------------------------------------------------------------------
def test_model_loading_failure_without_fallback(tmp_path):
    """Verify that attempting to load a missing v2 model raises FileNotFoundError without silent fallback."""
    empty_dir = tmp_path / "empty_models"
    empty_dir.mkdir()

    with pytest.raises(FileNotFoundError, match="Visual model v2.0.0 not found"):
        FairProctorEngine.load(models_dir=empty_dir, visual_version="v2", allow_legacy_fallback=False)


# -----------------------------------------------------------------------------
# 14. Evidence Traceability
# -----------------------------------------------------------------------------
def test_evidence_traceability(engine_v2):
    """Verify that every generated flag references real evidence with timestamps and policy citations."""
    session_data = {
        "session_id": "session_trace_001",
        "video_observations": [
            {"timestamp_sec": 10.0, "phone_present": 1, "phone_conf": 0.95},
            {"timestamp_sec": 15.0, "phone_present": 1, "phone_conf": 0.92},
        ],
        "browser_events": {"total_tab_switches": 4, "paste_count": 0},
        "policy": ExamPolicy(allow_tab_switch=False, max_tolerated_tab_switches=1),
    }
    res = engine_v2.score_session(session_data)

    for item in res.evidence_timeline:
        assert len(item["timestamp_or_interval"]) > 0
        assert len(item["observation_type"]) > 0
        assert len(item["relevant_policy"]) > 0
        assert len(item["explanation"]) > 10
        assert item["severity"] in ["INFO", "LOW", "MEDIUM", "HIGH"]
        assert item["contribution_score"] >= 0.0


# -----------------------------------------------------------------------------
# 15. API Health & Status Endpoints
# -----------------------------------------------------------------------------
def test_api_health_and_status_endpoints(api_client):
    """Verify FastAPI GET /health and GET /status endpoints."""
    # Health check
    res_health = api_client.get("/health")
    assert res_health.status_code == 200
    data_health = res_health.json()
    assert data_health["status"] == "healthy"
    assert data_health["visual_model_loaded"] is True
    assert data_health["engine_version"] in ["2.0.0", "v2.0.0"]

    # Status check
    res_status = api_client.get("/status")
    assert res_status.status_code == 200
    data_status = res_status.json()
    assert data_status["status"] == "ready"
    assert data_status["visual_model"]["version"] in ["2.0.0", "v2.0.0"]
    assert data_status["visual_model"]["invariant_features_enabled"] is True
    assert len(data_status["fairness_safeguards"]) > 0


# -----------------------------------------------------------------------------
# 16. API Session Scoring & Error Handling
# -----------------------------------------------------------------------------
def test_api_session_scoring_and_error_handling(api_client):
    """Verify FastAPI POST /score-session with valid and malformed requests."""
    # Valid request
    valid_payload = {
        "session_id": "api_eval_100",
        "session_metadata": {"is_shared_room": True},
        "video_observations": [
            {"timestamp_sec": 0.0, "face_present": 1, "phone_present": 0},
            {"timestamp_sec": 5.0, "face_present": 1, "phone_present": 0},
        ],
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
    }
    res_valid = api_client.post("/score-session", json=valid_payload)
    assert res_valid.status_code == 200
    body = res_valid.json()
    assert body["session_id"] == "api_eval_100"
    assert body["risk_score"] == 0.0
    assert body["integrity_score"] == 100.0
    assert body["risk_level"] == "LOW"
    assert body["model_version"] in ["2.0.0", "v2.0.0"]
    assert body["policy_version"] == "1.0.0"

    # Malformed request: empty session_id
    invalid_payload = {
        "session_id": "",  # Min length violation
        "video_observations": [],
    }
    res_invalid = api_client.post("/score-session", json=invalid_payload)
    assert res_invalid.status_code == 422  # Pydantic validation error

    # Business logic error: negative timestamp
    bad_ts_payload = {
        "session_id": "api_bad_ts",
        "video_observations": [{"timestamp_sec": -10.0, "face_present": 1}],
    }
    res_bad_ts = api_client.post("/score-session", json=bad_ts_payload)
    assert res_bad_ts.status_code == 400
    assert "timestamp_sec cannot be negative" in res_bad_ts.json()["detail"]
