"""Unit tests for the central risk engine, temporal clustering, and API service."""

import pytest
from fairproctor.api.schemas import BrowserEventsInput, ScoreSessionRequest, VisualFrameInput
from fairproctor.api.service import FairProctorService
from fairproctor.engine.evidence import EvidenceAggregator
from fairproctor.engine.risk_engine import FairProctorEngine
from fairproctor.features.similarity_features import AnswerSimilarityAnalyzer


def test_repeated_correlated_observations_clustering():
    """
    Verify that 10 sequential frame detections of a phone are clustered
    into a single temporal episode to prevent double-counting violations.
    """
    raw_obs = [
        {"type": "PHONE_DETECTED", "timestamp_sec": float(i * 3.0), "confidence": 0.85}
        for i in range(10)
    ]
    # Total span is 0s to 27s, gaps are 3.0s (less than max_gap=15.0s)
    episodes = EvidenceAggregator.cluster_temporal_observations(raw_obs, max_gap_seconds=15.0)

    assert len(episodes) == 1
    assert episodes[0]["frame_count"] == 10
    assert episodes[0]["start_sec"] == 0.0
    assert episodes[0]["end_sec"] == 27.0


def test_empty_session_handling():
    """Verify that an empty session payload fails safely without throwing exceptions."""
    engine = FairProctorEngine()
    result = engine.score_session({})

    assert result.session_id == "session_unknown"
    assert result.risk_score == 0.0
    assert result.integrity_score == 100.0
    assert result.risk_level == "LOW"
    assert "video_stream" in result.missing_data
    assert "browser_telemetry" in result.missing_data


def test_cross_candidate_collusion_detection():
    """Verify collusion analysis catches identical incorrect responses."""
    analyzer = AnswerSimilarityAnalyzer(min_common_questions=3, min_identical_incorrect=2, min_match_ratio=0.8)

    # Identical wrong options chosen
    answers_a = {
        "q1": {"response": "option_3", "is_correct": False},
        "q2": {"response": "option_4", "is_correct": False},
        "q3": {"response": "option_1", "is_correct": True},
    }
    answers_b = {
        "q1": {"response": "option_3", "is_correct": False},
        "q2": {"response": "option_4", "is_correct": False},
        "q3": {"response": "option_1", "is_correct": True},
    }

    res = analyzer.compare_candidate_pair("cand_1", answers_a, "cand_2", answers_b)
    assert res.suspicious_collusion_flag is True
    assert res.identical_incorrect_count == 2
    assert res.identical_response_ratio == 1.0


def test_api_service_scoring():
    """Verify end-to-end request handling through the service layer."""
    service = FairProctorService()

    req = ScoreSessionRequest(
        session_id="api_test_session_101",
        session_metadata={"is_shared_room": True},
        video_observations=[
            VisualFrameInput(timestamp_sec=0.0, face_present=1, phone_present=0),
            VisualFrameInput(timestamp_sec=5.0, face_present=1, phone_present=0),
        ],
        browser_events=BrowserEventsInput(total_tab_switches=0, paste_count=0),
    )

    response = service.score(req)
    assert response.session_id == "api_test_session_101"
    assert response.risk_score == 0.0
    assert response.integrity_score == 100.0
    assert response.risk_level == "LOW"
    assert response.recommended_action == "NO_ACTION"
