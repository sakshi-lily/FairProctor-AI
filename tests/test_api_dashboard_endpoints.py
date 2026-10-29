"""Tests for Reviewer Dashboard API endpoints and authorization safeguards."""

import pytest
from fastapi.testclient import TestClient

from fairproctor.api.service import create_app


@pytest.fixture
def client():
    # Fresh app instance
    app = create_app()
    return TestClient(app)


def test_overview_endpoint(client):
    """Verifies that /api/v1/overview returns required statistics and explicit demonstration label."""
    resp = client.get("/api/v1/overview")
    assert resp.status_code == 200
    data = resp.json()

    assert "total_sessions" in data
    assert data["total_sessions"] >= 7
    assert "awaiting_review" in data
    assert "priority_review" in data
    assert "insufficient_evidence" in data
    assert "environmental_warnings_count" in data
    assert data["model_version"] == "2.0.0"
    assert data["backend_health"] == "healthy"
    assert data["is_demonstration_data"] is True


def test_list_sessions_sorting_and_filtering(client):
    """Verifies session queue sorts by review priority and filters by status/search."""
    resp = client.get("/api/v1/sessions")
    assert resp.status_code == 200
    data = resp.json()

    sessions = data["sessions"]
    assert len(sessions) >= 7

    # Ensure HIGH priority comes before LOW priority
    priorities = [s["risk_level"] for s in sessions]
    first_low_idx = next((i for i, p in enumerate(priorities) if p == "LOW"), len(priorities))
    first_high_idx = next((i for i, p in enumerate(priorities) if p == "HIGH"), 0)
    assert first_high_idx < first_low_idx

    # Filter by priority=HIGH
    resp_high = client.get("/api/v1/sessions?priority=HIGH")
    assert resp_high.status_code == 200
    for s in resp_high.json()["sessions"]:
        assert s["risk_level"] == "HIGH"

    # Search filter
    resp_search = client.get("/api/v1/sessions?search=phone")
    assert resp_search.status_code == 200
    assert any("phone" in s["session_id"].lower() for s in resp_search.json()["sessions"])


def test_get_session_detail(client):
    """Verifies retrieval of full session detail including evidence and environmental warnings."""
    resp = client.get("/api/v1/sessions/sess_shared_room_01")
    assert resp.status_code == 200
    detail = resp.json()

    assert detail["session_id"] == "sess_shared_room_01"
    assert detail["risk_level"] == "LOW"
    assert len(detail["environmental_warnings"]) > 0
    assert "IM-102" in detail["environmental_warnings"][0]
    assert detail["model_version"] == "2.0.0"
    assert detail["policy_version"] == "1.0.0"
    assert len(detail["evidence_timeline"]) > 0

    # Non-existent session
    resp_404 = client.get("/api/v1/sessions/sess_does_not_exist_999")
    assert resp_404.status_code == 404


def test_reviewer_decision_authorization_and_immutability(client):
    """Verifies authorization gate on CONFIRMED_VIOLATION and immutability of model scores."""
    session_id = "sess_phone_det_02"

    # Fetch original model scores
    orig_resp = client.get(f"/api/v1/sessions/{session_id}")
    assert orig_resp.status_code == 200
    orig_data = orig_resp.json()
    orig_risk = orig_data["risk_score"]
    orig_integrity = orig_data["integrity_score"]

    # 1. Unauthorized confirmation attempt by ASSISTANT_PROCTOR -> 403 Forbidden
    unauthorized_payload = {
        "reviewer_id": "rev_junior_12",
        "reviewer_role": "reviewer",
        "decision": "CONFIRMED_VIOLATION",
        "notes": "Candidate was holding phone."
    }
    resp_forbidden = client.post(
        f"/api/v1/sessions/{session_id}/decisions",
        json=unauthorized_payload
    )
    assert resp_forbidden.status_code == 403
    assert "Lead Proctor" in resp_forbidden.json()["detail"]

    # 2. Authorized confirmation attempt by LEAD_PROCTOR -> 200 OK
    authorized_payload = {
        "reviewer_id": "rev_lead_01",
        "reviewer_role": "lead_proctor",
        "decision": "CONFIRMED_VIOLATION",
        "notes": "Evidence inspected: sustained mobile phone usage verified at t=315s."
    }
    resp_ok = client.post(
        f"/api/v1/sessions/{session_id}/decisions",
        json=authorized_payload
    )
    assert resp_ok.status_code == 200
    decision = resp_ok.json()
    assert decision["decision"] == "CONFIRMED_VIOLATION"
    assert decision["reviewer_role"] == "lead_proctor"

    # 3. Model predictions remain unchanged
    after_resp = client.get(f"/api/v1/sessions/{session_id}")
    assert after_resp.status_code == 200
    after_data = after_resp.json()
    assert after_data["risk_score"] == orig_risk
    assert after_data["integrity_score"] == orig_integrity
    assert after_data["review_status"] == "CONFIRMED_VIOLATION"
    assert after_data["decision_record"]["reviewer_id"] == "rev_lead_01"


def test_score_session_auto_registers_in_queue(client):
    """Verifies that newly evaluated live sessions immediately appear in the review queue."""
    new_session_id = "sess_live_auto_test_99"
    payload = {
        "session_id": new_session_id,
        "video_observations": [],
        "environmental_conditions": {
            "illuminance_lux": 350.0,
            "ambient_noise_db": 42.0,
            "network_latency_ms": 25.0,
            "packet_loss_rate": 0.01,
            "is_shared_space": False,
            "is_low_bandwidth": False,
            "camera_occluded": False,
            "secondary_person_detected": False
        }
    }

    score_resp = client.post("/score-session", json=payload)
    assert score_resp.status_code == 200

    # Verify session is now accessible in /api/v1/sessions/{session_id}
    detail_resp = client.get(f"/api/v1/sessions/{new_session_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["session_id"] == new_session_id
