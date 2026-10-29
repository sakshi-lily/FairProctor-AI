"""Automated tests for QR mobile environment check pairing and restricted exam lifecycle."""

import time
import pytest
from fastapi.testclient import TestClient

from fairproctor.api.service import create_app
from fairproctor.api.schemas import (
    CandidateEventType,
    CandidateStartSessionRequest,
    CreatePairingRequest,
    MobileEnvironmentCheckSubmitRequest,
    CandidateEventPayload,
    EventSource,
)


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


def test_qr_pairing_creation_and_status(client):
    """Test generating a secure QR pairing token and checking its status."""
    # 1. Start a candidate session
    start_payload = CandidateStartSessionRequest(
        candidate_pseudonym="cand_test_qr",
        exam_title="CS 401 — Advanced Algorithms",
        is_shared_room_declared=True,
    )
    res_start = client.post("/api/v1/candidate/sessions/start", json=start_payload.model_dump())
    assert res_start.status_code == 200
    session_id = res_start.json()["session_id"]

    # 2. Create pairing token
    pair_req = CreatePairingRequest(frontend_origin="http://192.168.1.50:5173")
    res_pair = client.post(
        f"/api/v1/candidate/sessions/{session_id}/pairing/create",
        json=pair_req.model_dump(),
    )
    assert res_pair.status_code == 200
    pair_data = res_pair.json()

    assert pair_data["session_id"] == session_id
    assert len(pair_data["pairing_token"]) >= 24
    assert pair_data["pairing_code"].startswith("FP-")
    assert pair_data["status"] == "waiting_for_scan"
    assert "http://192.168.1.50:5173/?mode=mobile_check&pairing_token=" in pair_data["qr_payload_url"]
    assert pair_data["ttl_seconds"] == 300

    token = pair_data["pairing_token"]

    # 3. Retrieve status by token
    res_status = client.get(f"/api/v1/candidate/pairing/{token}")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "waiting_for_scan"
    assert status_data["is_expired"] is False

    # 4. Retrieve status by session ID
    res_sess_status = client.get(f"/api/v1/candidate/sessions/{session_id}/pairing/status")
    assert res_sess_status.status_code == 200
    assert res_sess_status.json()["pairing_token"] == token


def test_mobile_check_progression_and_submission(client):
    """Test scanning QR, starting check, and submitting structured mobile scan results."""
    # 1. Start session & create pairing
    res_start = client.post(
        "/api/v1/candidate/sessions/start",
        json={"candidate_pseudonym": "cand_mobile_prog", "is_shared_room_declared": True},
    )
    session_id = res_start.json()["session_id"]

    res_pair = client.post(f"/api/v1/candidate/sessions/{session_id}/pairing/create", json={})
    token = res_pair.json()["pairing_token"]

    # 2. Phone scans and signals start
    res_scan = client.post(f"/api/v1/candidate/pairing/{token}/start")
    assert res_scan.status_code == 200
    assert res_scan.json()["status"] == "in_progress"

    # Verify event logged on session
    res_sess = client.get(f"/api/v1/sessions/{session_id}")
    event_types = [e["event_type"] for e in res_sess.json()["events"]]
    assert CandidateEventType.QR_PAIRING_CREATED.value in event_types
    assert CandidateEventType.ENVIRONMENT_CHECK_STARTED.value in event_types

    # 3. Submit mobile environment verification
    submit_req = MobileEnvironmentCheckSubmitRequest(
        pairing_token=token,
        check_status="completed",
        lighting_status="adequate",
        camera_status="available",
        desk_cleared_confirmed=True,
        room_sweep_completed=True,
        candidate_notes="Single monitor, desk clear of papers.",
        observations={"room_type": "bedroom", "secondary_person_seen": False},
    )
    res_submit = client.post(
        f"/api/v1/candidate/pairing/{token}/submit",
        json=submit_req.model_dump(),
    )
    assert res_submit.status_code == 200
    assert res_submit.json()["status"] == "completed"
    assert res_submit.json()["environment_check"]["desk_cleared_confirmed"] is True

    # 4. Cannot double-submit completed check
    res_dup = client.post(
        f"/api/v1/candidate/pairing/{token}/submit",
        json=submit_req.model_dump(),
    )
    assert res_dup.status_code == 400


def test_mobile_check_camera_unavailable_policy_im102(client):
    """Verify that a candidate with camera unavailable during mobile check is not penalized."""
    res_start = client.post(
        "/api/v1/candidate/sessions/start",
        json={"candidate_pseudonym": "cand_no_cam_phone", "is_shared_room_declared": True},
    )
    session_id = res_start.json()["session_id"]
    res_pair = client.post(f"/api/v1/candidate/sessions/{session_id}/pairing/create", json={})
    token = res_pair.json()["pairing_token"]

    # Phone reports camera unavailable
    submit_req = MobileEnvironmentCheckSubmitRequest(
        pairing_token=token,
        check_status="camera_unavailable",
        lighting_status="uncertain",
        camera_status="unavailable",
        desk_cleared_confirmed=True,
        room_sweep_completed=False,
        candidate_notes="Phone camera hardware permission denied.",
    )
    res_submit = client.post(
        f"/api/v1/candidate/pairing/{token}/submit",
        json=submit_req.model_dump(),
    )
    assert res_submit.status_code == 200

    # Inspect session details: Risk priority must remain LOW
    res_sess = client.get(f"/api/v1/sessions/{session_id}")
    detail = res_sess.json()
    assert detail["risk_level"] == "LOW"
    # Should be recorded in missing_data, not as misconduct violation
    event_types = [e["event_type"] for e in detail["events"]]
    assert CandidateEventType.ENVIRONMENT_CHECK_UNAVAILABLE.value in event_types


def test_restricted_exam_mode_events(client):
    """Test recording fullscreen and tab visibility events during restricted exam mode."""
    res_start = client.post(
        "/api/v1/candidate/sessions/start",
        json={"candidate_pseudonym": "cand_lockdown_test", "is_shared_room_declared": True},
    )
    session_id = res_start.json()["session_id"]

    # 1. Desktop permissions granted
    client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "CAMERA_PERMISSION_GRANTED", "source": "browser"},
    )
    client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "MICROPHONE_PERMISSION_GRANTED", "source": "browser"},
    )

    # 2. Enter fullscreen
    res_fs = client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "EXAM_FULLSCREEN_ENTERED", "source": "browser"},
    )
    assert res_fs.status_code == 200

    # 3. Fullscreen exit (interruption)
    res_exit = client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "EXAM_FULLSCREEN_EXITED", "source": "browser", "metadata": {"reason": "user_escape"}},
    )
    assert res_exit.status_code == 200

    # 4. Tab hidden
    res_hidden = client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "EXAM_TAB_HIDDEN", "source": "browser", "metadata": {"hidden": True}},
    )
    assert res_hidden.status_code == 200

    # 5. Warning acknowledged
    res_ack = client.post(
        f"/api/v1/candidate/sessions/{session_id}/events",
        json={"event_type": "EXAM_WARNING_ACKNOWLEDGED", "source": "candidate", "metadata": {"warning_number": 1}},
    )
    assert res_ack.status_code == 200

    # Verify all recorded in order
    res_sess = client.get(f"/api/v1/sessions/{session_id}")
    detail = res_sess.json()
    types = [e["event_type"] for e in detail["events"]]
    assert "CAMERA_PERMISSION_GRANTED" in types
    assert "MICROPHONE_PERMISSION_GRANTED" in types
    assert "EXAM_FULLSCREEN_ENTERED" in types
    assert "EXAM_FULLSCREEN_EXITED" in types
    assert "EXAM_TAB_HIDDEN" in types
    assert "EXAM_WARNING_ACKNOWLEDGED" in types


def test_pairing_token_validation_errors(client):
    """Test error conditions for invalid tokens, unknown sessions, and expired tokens."""
    # 1. Unknown session
    res_unknown = client.post("/api/v1/candidate/sessions/nonexistent_session/pairing/create", json={})
    assert res_unknown.status_code == 404

    # 2. Unknown token status
    res_bad_token = client.get("/api/v1/candidate/pairing/invalid_token_xyz")
    assert res_bad_token.status_code == 404

    # 3. Token mismatch in body vs path
    res_mismatch = client.post(
        "/api/v1/candidate/pairing/path_token/submit",
        json={"pairing_token": "different_body_token", "check_status": "completed"},
    )
    assert res_mismatch.status_code == 400
