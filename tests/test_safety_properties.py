"""Automated tests verifying core safety and fairness properties for FairProctor-AI.

Safety Invariants Verified:
1. Missing video alone does not increase misconduct risk.
2. Poor lighting alone does not increase misconduct risk.
3. Network interruptions alone do not increase misconduct risk.
4. Multiple faces in a shared room alone do not increase misconduct risk.
5. Paste events are interpreted strictly according to configured exam policy.
6. Every generated flag references real evidence.
7. Missing modalities are explicitly and transparently reported.
"""

import pytest
import pandas as pd
from fairproctor.engine.policy import ExamPolicy
from fairproctor.engine.risk_engine import FairProctorEngine


@pytest.fixture
def clean_engine():
    """Initializes engine instance for testing."""
    return FairProctorEngine()


def test_missing_video_alone_does_not_increase_risk(clean_engine):
    """Verify that a session with missing video data is never penalized."""
    session = {
        "session_id": "test_no_video",
        "session_metadata": {"is_shared_room": True},
        "video_observations": None,  # Missing video modality
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
    }
    result = clean_engine.score_session(session)

    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert result.risk_level == "LOW"
    assert "video_stream" in result.missing_data
    assert result.recommended_action == "NO_ACTION"


def test_poor_lighting_alone_does_not_increase_risk(clean_engine):
    """Verify that dark or poor lighting conditions never inflate misconduct risk."""
    frames = [
        {
            "timestamp_sec": float(i * 5),
            "face_present": 1,
            "no_of_face": 1,
            "face_conf": 40.0,  # Very low confidence due to dark room
            "head_pose": "forward",
            "gaze_on_script": 1,
            "phone_present": 0,
        }
        for i in range(10)
    ]
    session = {
        "session_id": "test_dark_room",
        "video_observations": frames,
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
    }
    result = clean_engine.score_session(session)

    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert any("Poor lighting" in w for w in result.environmental_warnings)


def test_network_interruption_alone_does_not_increase_risk(clean_engine):
    """Verify that network disconnects never increase misconduct risk."""
    session = {
        "session_id": "test_network_drops",
        "video_observations": [],
        "browser_events": {"total_tab_switches": 0, "paste_count": 0},
        "environmental_conditions": {"network_interruptions": 5, "fps": 0.2},
    }
    result = clean_engine.score_session(session)

    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert any("network interruptions" in w for w in result.environmental_warnings)


def test_multiple_faces_in_shared_room_alone_do_not_increase_risk(clean_engine):
    """Verify that multiple people in a shared room do NOT inflate risk score."""
    frames = [
        {
            "timestamp_sec": float(i * 5),
            "face_present": 1,
            "no_of_face": 2,  # Secondary person in background
            "face_conf": 88.0,
            "head_pose": "forward",
            "gaze_on_script": 1,
            "phone_present": 0,
        }
        for i in range(10)
    ]
    session = {
        "session_id": "test_shared_room",
        "session_metadata": {"is_shared_room": True},
        "video_observations": frames,
        "policy": ExamPolicy(shared_room_candidate=True),
    }
    result = clean_engine.score_session(session)

    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    # Verified: background person was reported as INFO context, not penalized!
    bg_flags = [item for item in result.evidence_timeline if item["observation_type"] == "BACKGROUND_PERSON_DETECTED"]
    assert len(bg_flags) > 0
    assert bg_flags[0]["contribution_score"] == 0.0


def test_paste_event_interpreted_by_policy(clean_engine):
    """Verify that paste events are allowed or flagged according to policy."""
    session_data = {
        "session_id": "test_paste",
        "browser_events": {"paste_count": 2, "total_tab_switches": 0},
    }

    # Policy A: Paste forbidden (e.g. coding exam)
    policy_forbidden = ExamPolicy(allow_copy_paste=False)
    session_data["policy"] = policy_forbidden
    res_forbidden = clean_engine.score_session(session_data)
    assert res_forbidden.risk_score > 0.0
    assert any(e["observation_type"] == "COPY_PASTE_VIOLATION" for e in res_forbidden.evidence_timeline)

    # Policy B: Paste allowed (e.g. essay exam with quotes allowed)
    policy_allowed = ExamPolicy(allow_copy_paste=True)
    session_data["policy"] = policy_allowed
    res_allowed = clean_engine.score_session(session_data)
    assert res_allowed.risk_score == 0.0
    assert not any(e["observation_type"] == "COPY_PASTE_VIOLATION" for e in res_allowed.evidence_timeline)


def test_evidence_traceability_and_timestamps(clean_engine):
    """Verify that every generated flag references real events and valid timestamps."""
    frames = [
        {"timestamp_sec": 10.0, "phone_present": 1, "phone_conf": 0.85, "face_present": 1, "no_of_face": 1},
        {"timestamp_sec": 15.0, "phone_present": 1, "phone_conf": 0.90, "face_present": 1, "no_of_face": 1},
    ]
    session = {
        "session_id": "test_phone_evidence",
        "video_observations": frames,
    }
    result = clean_engine.score_session(session)

    assert len(result.evidence_timeline) > 0
    item = result.evidence_timeline[0]
    assert item["observation_type"] == "PHONE_DETECTED"
    assert "10s - 15s" in item["timestamp_or_interval"]
    assert item["contribution_score"] > 0.0
    assert len(item["explanation"]) > 10


def test_missing_modalities_explicitly_reported(clean_engine):
    """Verify that when telemetry streams are missing, they are explicitly enumerated."""
    session = {
        "session_id": "test_all_missing",
        "video_observations": None,
        "browser_events": None,
    }
    result = clean_engine.score_session(session)

    assert "video_stream" in result.missing_data
    assert "browser_telemetry" in result.missing_data
    assert "LOW" in result.confidence_or_uncertainty
    # Missing data does not equal cheating
    assert result.risk_score == 0.0
