"""Tests for Candidate Portal examination lifecycle, event validation, and live engine integration."""

import pytest
from fastapi.testclient import TestClient

from fairproctor.api.service import create_app


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


def test_candidate_session_start_and_queue_ingestion(client):
    """Verifies candidate session starts, produces pseudonymous reference, and appears in reviewer queue."""
    start_payload = {
        "candidate_pseudonym": "cand_anon_test_101",
        "exam_title": "Algorithms & Systems Integrity Mock Examination",
        "is_shared_room_declared": True,
        "camera_permitted": True,
        "notes": "Testing candidate initialization flow."
    }
    resp = client.post("/api/v1/candidate/sessions/start", json=start_payload)
    assert resp.status_code == 200
    data = resp.json()

    session_id = data["session_id"]
    assert session_id.startswith("sess_live_cand_")
    assert data["is_live_candidate_session"] is True
    assert data["candidate_status"] == "IN_PROGRESS"
    assert data["review_status"] == "PENDING_REVIEW"
    assert len(data["events"]) == 1
    assert data["events"][0]["event_type"] == "SESSION_STARTED"
    assert data["events"][0]["source"] == "browser"
    assert "timestamp" in data["events"][0]

    # Verify session is immediately visible in reviewer queue
    queue_resp = client.get("/api/v1/sessions")
    assert queue_resp.status_code == 200
    queue_sessions = queue_resp.json()["sessions"]
    matching = [s for s in queue_sessions if s["session_id"] == session_id]
    assert len(matching) == 1
    assert matching[0]["is_live_candidate_session"] is True
    assert matching[0]["candidate_status"] == "IN_PROGRESS"


def test_candidate_event_validation_and_scoring_updates(client):
    """Verifies event validation, server timestamping, and re-scoring via FairProctorEngine."""
    # 1. Start session
    start_resp = client.post("/api/v1/candidate/sessions/start", json={
        "candidate_pseudonym": "cand_anon_test_102",
        "is_shared_room_declared": True,
        "camera_permitted": True
    })
    session_id = start_resp.json()["session_id"]

    # 2. Reject invalid event type
    bad_resp = client.post(f"/api/v1/candidate/sessions/{session_id}/events", json={
        "event_type": "UNAUTHORIZED_CHEATING_HACK_EVENT",
        "source": "browser"
    })
    assert bad_resp.status_code == 422

    # 3. Record real browser TAB_VISIBILITY_CHANGED event
    tab_evt = client.post(f"/api/v1/candidate/sessions/{session_id}/events", json={
        "event_type": "TAB_VISIBILITY_CHANGED",
        "source": "browser",
        "metadata": {"hidden": True, "duration_sec": 3.5},
        "is_simulated": False
    })
    assert tab_evt.status_code == 200
    rec = tab_evt.json()
    assert rec["event_type"] == "TAB_VISIBILITY_CHANGED"
    assert rec["is_simulated"] is False
    assert rec["evidence_reliability"] == "high_browser_telemetry"

    # 4. Record simulated ENVIRONMENTAL_OBSERVATION (Shared Room Background Person)
    env_evt = client.post(f"/api/v1/candidate/sessions/{session_id}/events", json={
        "event_type": "ENVIRONMENTAL_OBSERVATION",
        "source": "simulation",
        "metadata": {
            "condition_type": "background_person",
            "description": "Secondary individual walked across room in background."
        },
        "is_simulated": True
    })
    assert env_evt.status_code == 200
    assert env_evt.json()["is_simulated"] is True
    assert env_evt.json()["evidence_reliability"] == "simulated_demonstration"

    # 5. Verify that IM-102 protects the candidate (0 penalty points for shared room)
    session_detail = client.get(f"/api/v1/candidate/sessions/{session_id}").json()
    # Risk score must NOT be inflated by shared room background person
    assert session_detail["risk_score"] < 25.0
    # Environmental warning must be recorded
    assert any("shared" in str(w).lower() or "room" in str(w).lower() or "background" in str(w).lower()
               for w in session_detail["environmental_warnings"])


def test_camera_unavailable_lowers_confidence_without_penalty(client):
    """Verifies that CAMERA_UNAVAILABLE marks missing modality without inflating misconduct risk."""
    start_resp = client.post("/api/v1/candidate/sessions/start", json={
        "candidate_pseudonym": "cand_anon_test_103",
        "is_shared_room_declared": True,
        "camera_permitted": False
    })
    session_id = start_resp.json()["session_id"]

    cam_evt = client.post(f"/api/v1/candidate/sessions/{session_id}/events", json={
        "event_type": "CAMERA_UNAVAILABLE",
        "source": "browser",
        "metadata": {"reason": "permission_denied"},
        "is_simulated": False
    })
    assert cam_evt.status_code == 200

    detail = client.get(f"/api/v1/candidate/sessions/{session_id}").json()
    # Missing video stream tracked
    assert "video_stream" in detail["missing_data"]
    # Missing video does NOT independently inflate risk score (remains low)
    assert detail["risk_score"] <= 10.0


def test_candidate_answer_submission_and_exam_completion(client):
    """Verifies question answering, answers_count increment, and exam completion."""
    start_resp = client.post("/api/v1/candidate/sessions/start", json={
        "candidate_pseudonym": "cand_anon_test_104"
    })
    session_id = start_resp.json()["session_id"]

    # Submit Answer 1
    ans_1 = client.post(f"/api/v1/candidate/sessions/{session_id}/answers", json={
        "question_id": 1,
        "question_text": "What is the worst-case time complexity of quicksort?",
        "selected_option": "O(n^2)",
        "time_spent_seconds": 18.2
    })
    assert ans_1.status_code == 200

    # Submit Answer 2
    ans_2 = client.post(f"/api/v1/candidate/sessions/{session_id}/answers", json={
        "question_id": 2,
        "question_text": "Which data structure uses LIFO order?",
        "selected_option": "Stack",
        "time_spent_seconds": 12.0
    })
    assert ans_2.status_code == 200

    detail = client.get(f"/api/v1/candidate/sessions/{session_id}").json()
    assert detail["answers_count"] == 2
    assert detail["candidate_status"] == "IN_PROGRESS"

    # Submit exam
    submit_resp = client.post(f"/api/v1/candidate/sessions/{session_id}/submit", json={
        "answers": {"1": "O(n^2)", "2": "Stack"},
        "total_time_spent_seconds": 30.2
    })
    assert submit_resp.status_code == 200
    final_detail = submit_resp.json()
    assert final_detail["candidate_status"] == "COMPLETED"
    event_types = [e["event_type"] for e in final_detail["events"]]
    assert "SESSION_SUBMITTED" in event_types
    assert "SESSION_COMPLETED" in event_types


def test_sse_endpoint_connects_cleanly(client):
    """Verifies that the SSE streaming endpoint opens cleanly with text/event-stream."""
    with client.stream("GET", "/api/v1/events/stream") as resp:
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers["content-type"]
        # Read the first event
        for line in resp.iter_lines():
            if line:
                assert "connected" in line or "status" in line
                break
