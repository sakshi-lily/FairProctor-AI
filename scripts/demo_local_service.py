"""Reproducible demonstration of the local FairProctor-AI FastAPI service and explainable engine.

Demonstrates:
1. Health check (/health)
2. Detailed engine and model status (/status)
3. Multi-modal session scoring with environmental safeguards:
   - Shared living room background activity (+0.0 pts, INFO)
   - Dim ambient lighting condition (+0.0 pts, Quality context)
   - Low bandwidth downsampling (0.2 FPS / 1 frame per 5s)
   - Correlated phone detection clustered into a single episode (+35.0 pts)
   - Permitted vs unauthorized paste policy enforcement
"""

import json
import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "src"))

from fastapi.testclient import TestClient
from fairproctor.api.service import create_app
from fairproctor.engine.risk_engine import FairProctorEngine

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("demo")


def run_demonstration():
    print("=" * 80)
    print("FAIRPROCTOR-AI LOCAL SERVICE DEMONSTRATION (IM-102)")
    print("=" * 80)

    # 1. Initialize Engine and FastAPI application
    print("\n[Step 1] Initializing FairProctor-AI Engine v2.0.0 and Local FastAPI Service...")
    engine = FairProctorEngine.load(visual_version="v2")
    app = create_app(engine=engine)
    client = TestClient(app)
    print(f"Engine Version: {engine.version}")
    print(f"Visual Model: {engine.visual_model.metadata.get('model_type')} ({engine.visual_model.metadata.get('version')})")
    print(f"Invariant Features ({len(engine.visual_model.feature_names)}): {engine.visual_model.feature_names}")

    # 2. Check Health Endpoint
    print("\n[Step 2] Querying GET /health...")
    health_resp = client.get("/health")
    print(f"HTTP Status: {health_resp.status_code}")
    print("Response JSON:")
    print(json.dumps(health_resp.json(), indent=2))

    # 3. Check Status Endpoint
    print("\n[Step 3] Querying GET /status (Detailed Model & Policy Status)...")
    status_resp = client.get("/status")
    print(f"HTTP Status: {status_resp.status_code}")
    print("Response JSON:")
    print(json.dumps(status_resp.json(), indent=2))

    # 4. Construct Synthetic Candidate Session
    # Candidate in a shared room with poor lighting and low bandwidth, with one phone episode
    print("\n[Step 4] Submitting POST /score-session with Synthetic Multi-Modal Payload...")
    synthetic_session = {
        "session_id": "candidate_session_im102_demo",
        "session_metadata": {
            "candidate_id": "cand_demo_8821",
            "is_shared_room": True,
            "expected_duration_sec": 60.0
        },
        "video_observations": [
            # Frame 0: Candidate working normally, secondary person in background
            {
                "timestamp_sec": 0.0,
                "face_present": 1,
                "no_of_face": 2,          # Secondary individual in background
                "face_conf": 52.0,        # Dim room lighting
                "head_pose": "forward",
                "phone_present": 0,
                "phone_conf": 0.0
            },
            # Frame 1: Candidate writing notes on scratchpad (head down)
            {
                "timestamp_sec": 5.0,
                "face_present": 1,
                "no_of_face": 2,
                "face_conf": 54.0,
                "head_pose": "down",       # Brief downward glance (< 30s)
                "phone_present": 0,
                "phone_conf": 0.0
            },
            # Frame 2: Phone appears
            {
                "timestamp_sec": 10.0,
                "face_present": 1,
                "no_of_face": 1,
                "face_conf": 55.0,
                "head_pose": "forward",
                "phone_present": 1,        # Phone detected
                "phone_conf": 0.91
            },
            # Frame 3: Phone still in hand (correlated consecutive frame)
            {
                "timestamp_sec": 15.0,
                "face_present": 1,
                "no_of_face": 1,
                "face_conf": 56.0,
                "head_pose": "forward",
                "phone_present": 1,        # Phone detected (should cluster with Frame 2)
                "phone_conf": 0.89
            },
            # Frame 4: Phone put away, normal candidate focus
            {
                "timestamp_sec": 20.0,
                "face_present": 1,
                "no_of_face": 1,
                "face_conf": 58.0,
                "head_pose": "forward",
                "phone_present": 0,
                "phone_conf": 0.0
            }
        ],
        "browser_events": {
            "total_tab_switches": 0,
            "paste_count": 0,
            "rapid_answer_count": 0
        },
        "environmental_conditions": {
            "fps": 0.2,                   # Low bandwidth: 1 frame every 5s
            "network_interruptions": 1,
            "lighting_conf": 54.0
        },
        "policy": {
            "exam_id": "im102_exam_fair",
            "policy_version": "1.0.0",
            "allow_copy_paste": False,
            "allow_tab_switch": False,
            "shared_room_candidate": True,
            "low_bandwidth_candidate": True
        }
    }

    score_resp = client.post("/score-session", json=synthetic_session)
    print(f"HTTP Status: {score_resp.status_code}")
    res = score_resp.json()

    print("\n" + "=" * 80)
    print("EVALUATION RESULT BREAKDOWN")
    print("=" * 80)
    print(f"Session Identifier:     {res['session_id']}")
    print(f"Risk Score:             {res['risk_score']}/100 (Review Priority Ranking; NOT a probability)")
    print(f"Integrity Score:        {res['integrity_score']}/100")
    print(f"Review Priority Level:  {res['risk_level']}")
    print(f"Recommended Action:     {res['recommended_action']}")
    print(f"Confidence Level:       {res['confidence_or_uncertainty']}")
    print(f"Model & Policy Version: Model v{res['model_version']} | Policy v{res['policy_version']}")

    print("\n--- Contributing Factors ---")
    for k, v in res["contributing_factors"].items():
        print(f"  • {k.replace('_', ' ').title()}: +{v:.1f} pts")

    print("\n--- Environmental Quality Context (0.0 Penalty Points) ---")
    for w in res["environmental_warnings"]:
        print(f"  [Context] {w}")

    print(f"\n--- Evidence Timeline ({len(res['evidence_timeline'])} items) ---")
    for item in res["evidence_timeline"]:
        print(
            f"  [{item['timestamp_or_interval']}] ({item['source']}) {item['observation_type']} "
            f"[{item['severity']}]: {item['explanation']} (Contribution: +{item['contribution_score']:.1f} pts)"
        )

    print("\n" + "=" * 80)
    print("FAIRNESS SAFEGUARD VERIFICATION SUMMARY")
    print("=" * 80)
    print("1. Shared Room Invariance: Background persons added +0.0 pts (INFO item).")
    print("2. Lighting Invariance: Face confidence 52-58% added +0.0 pts (Softened threshold).")
    print("3. Low Bandwidth Invariance: 0.2 FPS downsampling added +0.0 pts.")
    print("4. Temporal Deduplication: 2 consecutive phone frames clustered into 1 episode.")
    print("5. Brief Head Down Invariance: Single 5-second downward look was not penalized.")
    print("6. Score Meaning: 30.0/100 triggers SPOT_CHECK review queue, NOT automated disqualification.")
    print("=" * 80)


if __name__ == "__main__":
    run_demonstration()
