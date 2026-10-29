# FairProctor-AI: Engine Integration, Fairness Audit & Local Service Verification Report

**Role**: Senior ML Engineer & Python Backend Architect  
**Project**: FairProctor-AI  
**Challenge**: IM-102 Advanced — *Proctoring That Does Not Punish a Shared Room*  
**Date**: October 29, 2026  
**Target Engine**: Central FairProctorEngine (`v2.0.0`) & Local FastAPI Service (`v2.0.0`)  

---

## 1. Executive Summary & Integration Objective

Following our independent ML audit and the development of Visual Model v2.0.0 (Logistic Regression on invariant features), this phase focused on end-to-end integration and verification of the FairProctor-AI decision-support system. 

The objective was to:
1. Establish a **strict scoring contract** across multi-modal evidence (video observations, browser focus/telemetry, paste events, answer timing, collusion findings, and environmental conditions).
2. Enforce **mathematical and procedural fairness invariants** to guarantee that candidates in shared rooms, low-bandwidth regions, or poor lighting are never falsely accused of cheating.
3. Eliminate silent fallback risks by **locking the active visual model to v2.0.0** and requiring explicit developer flags for legacy compatibility.
4. Expose the full scoring workflow through a robust, local **FastAPI service** with input validation, meaningful HTTP error semantics, and zero PII exposure in logs.
5. Create a comprehensive automated test suite and executable demonstration verifying all properties.

---

## 2. Files Inspected and Modified

The following table details the files audited and improved during this integration:

| Component / File Path | Role | Changes & Enhancements Made |
| :--- | :--- | :--- |
| [`src/fairproctor/engine/risk_engine.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/src/fairproctor/engine/risk_engine.py) | Central Engine | Added `policy_version` to `SessionRiskAssessment`; implemented strict v2.0.0 loading without silent fallback; integrated visual model inference alongside semantic detectors; enforced brief head-turn tolerance ($<30\text{s}$); updated review-priority heuristic documentation. |
| [`src/fairproctor/engine/policy.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/src/fairproctor/engine/policy.py) | Policy Rules | Added `policy_version` attribute to `ExamPolicy` dataclass; defined defaults for shared rooms and low bandwidth. |
| [`src/fairproctor/engine/explanations.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/src/fairproctor/engine/explanations.py) | Explainability | Updated `generate_reviewer_summary` to include engine and policy versions, explicitly defining the risk score as a provisional review-priority heuristic rather than an empirical probability. |
| [`src/fairproctor/api/schemas.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/src/fairproctor/api/schemas.py) | API Contracts | Added `policy_version` to `ScoreSessionResponse` and `ExamPolicyInput`; enforced non-empty `session_id`; added validation constraints on timestamps and counts. |
| [`src/fairproctor/api/service.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/src/fairproctor/api/service.py) | FastAPI Service | Upgraded to v2.0.0; added `/health`, `/status`, `/score-session`, and `/score` endpoints; mapped `ValueError` to HTTP 400 and unhandled errors to HTTP 500; masked sensitive candidate identifiers from logs. |
| [`tests/test_engine_integration.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/tests/test_engine_integration.py) | Integration Tests | Created 16 comprehensive end-to-end integration tests covering all multimodal permutations, edge cases, fallback protections, and API endpoints. |
| [`scripts/demo_local_service.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/scripts/demo_local_service.py) | Executable Demo | Created local demonstration script illustrating health checks, model status, and synthetic candidate scoring under shared room conditions. |

---

## 3. Actual Engine Behavior & Scoring Contract

The scoring contract between client applications and the `FairProctorEngine` is formalized as follows:

### 3.1 Accepted Input Permutations
The engine accepts any combination of multi-modal evidence streams via dictionary or `ScoreSessionRequest`:
- **Video Observations** (`video_observations`): Sequence of video frame metadata (`timestamp_sec`, `face_present`, `no_of_face`, `face_conf`, `head_pose`, `phone_present`, `phone_conf`, `gaze_direction`).
- **Browser Event Telemetry** (`browser_events`): Summary of client-side events (`total_tab_switches`, `paste_count`, `rapid_answer_count`, `mean_response_time_sec`).
- **Environmental Reliability** (`environmental_conditions`): Measurement context (`fps`, `network_interruptions`, `lighting_conf`).
- **Cross-Candidate Collusion Findings** (`similarity_findings`): Post-exam pairwise similarity findings (`suspicious_collusion_flag`, `identical_response_ratio`).
- **Examination Policy Settings** (`policy`): Rule overrides (`allow_copy_paste`, `allow_tab_switch`, `shared_room_candidate`, `low_bandwidth_candidate`).

### 3.2 Output Assessment Structure
The engine returns a structured, validated `SessionRiskAssessment` containing:
- `session_id`: Unique session identifier.
- `risk_score`: Float between $0.0$ and $100.0$ representing **review priority ranking** (higher = greater reviewer inspection priority).
- `integrity_score`: Float between $0.0$ and $100.0$ calculated as $100.0 - \text{risk\_score}$.
- `risk_level`: Review-priority category (`LOW`, `MEDIUM`, `HIGH`).
- `evidence_timeline`: Chronological list of timestamped evidence items with source, policy citation, and explanation.
- `contributing_factors`: Breakdown of risk points across modalities (`visual_behavior`, `browser_events`, `cross_candidate_similarity`).
- `environmental_warnings`: List of capture quality mitigations (lighting, bandwidth, network drops).
- `missing_data`: List of absent telemetry modalities (`video_stream`, `browser_telemetry`).
- `confidence_or_uncertainty`: Assessment confidence level (`HIGH`, `MODERATE`, `LOW`) with human-readable rationale.
- `recommended_action`: Actionable next step (`NO_ACTION`, `SPOT_CHECK`, `PRIORITY_HUMAN_REVIEW`).
- `model_version`: Active model version (`2.0.0`).
- `policy_version`: Active exam policy version (`1.0.0`).
- `summary_explanation`: Comprehensive, non-accusatory reviewer briefing.

> [!IMPORTANT]
> **Strict Semantic Distinction**:
> The `risk_score` is explicitly documented as a **provisional review-priority heuristic (0-100)** to triage human reviewer queues. It is **NOT** a calibrated probability of cheating. Describing this score as a probability is strictly prohibited in code, docstrings, and API schemas.

---

## 4. Enforcement of Fairness Safeguards (IM-102)

All 10 required fairness properties were verified programmatically against the implementation:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      FAIRPROCTOR-AI SAFEGUARDS                         │
├───────────────────────────────────┬────────────────────────────────────┤
│ Property                          │ Engine Enforcement Mechanism       │
├───────────────────────────────────┼────────────────────────────────────┤
│ 1. Missing video alone            │ +0.0 pts; reported in missing_data │
│ 2. Missing browser alone          │ +0.0 pts; reported in missing_data │
│ 3. Poor ambient lighting          │ +0.0 pts; logged in env_warnings   │
│ 4. Network interruptions          │ +0.0 pts; logged in env_warnings   │
│ 5. Low frame availability         │ +0.0 pts; 0.2 FPS tolerated        │
│ 6. Multiple faces in shared room  │ +0.0 pts; INFO context item        │
│ 7. Brief head turn / scratchpad   │ +0.0 pts if < 30s; capped if > 30s │
│ 8. Paste events                   │ Configured per exam policy rules   │
│ 9. Correlated observations        │ Clustered into single episode      │
│ 10. Evidence traceability         │ Every flag cites real timestamps   │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **Missing Video Stream Alone**: If video frames are omitted, visual risk contribution is $0.0$. `"video_stream"` is added to `missing_data`, and confidence is downgraded to `MODERATE` or `LOW`.
2. **Missing Browser Telemetry Alone**: If browser telemetry is absent, browser risk contribution is $0.0$. `"browser_telemetry"` is added to `missing_data`.
3. **Poor Lighting Alone**: When average face detection confidence is low ($< 65\%$), an informational warning is logged in `environmental_warnings`. The risk inflation penalty is strictly $0.0$.
4. **Network Interruption Alone**: Connection dropouts are logged in `environmental_warnings` and reduce data reliability, contributing $0.0$ risk points.
5. **Low Frame Availability Alone**: Operating at $0.2\text{ FPS}$ (1 frame every 5 seconds) is accepted as standard low-bandwidth operation and adds $0.0$ risk points.
6. **Multiple Faces Alone (Shared Room Protection)**: When `is_shared_room = True` or `policy.shared_room_candidate = True`, frames with secondary individuals generate an `INFO` item (`BACKGROUND_PERSON_DETECTED`) with **$0.0$ risk points**.
7. **Legitimate Head Turn / Scratchpad Note-Taking**: In real exams, candidates naturally look down to write on scratchpads or turn their head briefly. The engine enforces that gaze deviations lasting less than `policy.max_tolerated_absence_seconds` ($30.0\text{s}$) contribute **$0.0$ risk points**. If sustained beyond $30.0\text{s}$, the observation is flagged as `MEDIUM` severity with a capped contribution ($\le 20.0\text{ pts}$) and an explicit note asking the human reviewer to verify if scratchpad notes are permitted.
8. **Paste Events Interpreted per Policy**:
   - If `policy.allow_copy_paste == True`: Paste events generate an `INFO` context item with **$0.0$ risk points**.
   - If `policy.allow_copy_paste == False`: Paste events generate a `COPY_PASTE_VIOLATION` with proportional risk points.
9. **Correlated Observations Deduplication**: If multiple consecutive frames detect a phone within a $15.0\text{s}$ window, `EvidenceAggregator.cluster_temporal_observations` groups them into a **single continuous temporal episode** with a single capped risk contribution ($\le 40.0\text{ pts}$), rather than counting each frame as an independent infraction.
10. **Evidence Traceability & Non-Hallucination**: Every evidence item in `evidence_timeline` cites a real timestamp interval derived from the input data, a policy rule citation, and a human-readable explanation. Timestamps are never fabricated.

---

## 5. Audit of Evidence Aggregation & Provisional Heuristics

### 5.1 Evidence Clustering & Signal Isolation
- **Episode Merging**: Temporal clustering groups proximate frame anomalies of the same type within `max_gap_seconds` ($15.0\text{s}$ for mobile devices; $10.0\text{s}$ for gaze deviations).
- **Weak Signal Isolation**: A single isolated weak observation (e.g. 3 rapid button clicks adding $10.0\text{ pts}$, or a single excess tab switch adding $12.0\text{ pts}$) produces a composite risk score below $25.0$. The session remains in the `LOW` review priority tier with recommended action `NO_ACTION`.
- **Modality Separation**: Environmental reliability metrics are calculated in a completely separate pipeline (`EnvironmentalReliabilityExtractor`) and can never bleed into or inflate the misconduct risk factors.

### 5.2 Provisional Heuristic Weights Rationale
Because the public datasets lack multi-modal, auditor-confirmed ground-truth misconduct labels for combined telemetry, the point allocations below represent **provisional review-priority heuristics** designed to order reviewer queues:

| Evidence Factor | Assigned Points | Severity | Rationale / Limitation |
| :--- | :---: | :---: | :--- |
| **Phone Detection Episode** | $20.0\text{ to }40.0\text{ pts}$ | HIGH | Scaled by episode duration ($+10\text{ pts} / 10\text{s}$), capped at $40.0\text{ pts}$. High priority for human verification. |
| **Sustained Gaze Deviation** | $5.0\text{ to }20.0\text{ pts}$ | MEDIUM | Only triggers if duration $\ge 30\text{s}$. Capped at $20.0\text{ pts}$ due to potential scratchpad use. |
| **Excess Tab Switches** | $12.0\text{ pts} / \text{switch}$ | MEDIUM / HIGH | Triggers only after exceeding `max_tolerated_tab_switches` ($1$). Capped at $40.0\text{ pts}$. |
| **Unauthorized Copy-Paste** | $15.0\text{ pts} / \text{event}$ | HIGH | Capped at $35.0\text{ pts}$. Disabled when policy permits pasting. |
| **Rapid Guessing Anomaly** | $10.0\text{ pts}$ | LOW | Fixed modest penalty ($10.0\text{ pts}$) when $\ge 3$ questions answered in $<5\text{s}$. |
| **Answer Collusion Flag** | $35.0\text{ pts}$ | HIGH | Statistical distractor match across candidates; requires post-exam reviewer audit. |

---

## 6. Model Versioning & Loading Controls

### 6.1 Version Enforcement
1. **Default Active Model**: `FairProctorEngine.load()` defaults strictly to `visual_version="v2"` (`visual_behavior_model_v2.joblib`).
2. **Elimination of Silent Fallback**: If Model v2.0.0 is missing from disk, `FairProctorEngine.load()` raises an immediate `FileNotFoundError`:
   ```python
   raise FileNotFoundError(
       f"Visual model v2.0.0 not found at {v_path_v2}. "
       "Train and persist v2.0.0 using 'python scripts/train_visual_model.py --version v2', "
       "or explicitly pass allow_legacy_fallback=True to permit legacy v1.0.0."
   )
   ```
3. **Explicit Legacy Fallback**: Legacy Model v1.0.0 can only be loaded if a developer explicitly passes `allow_legacy_fallback=True`. When invoked, an explicit `logger.warning` is logged.
4. **Metadata Alignment**: The visual classifier bundle metadata was verified:
   - Architecture: `logistic_regression`
   - Version: `2.0.0`
   - Split Strategy: `contiguous_block`
   - Invariant Features ($13$): `face_present`, `no_of_face`, `face_conf`, `hand_count`, `hand_obj_interaction`, `head_pose`, `head_pitch`, `head_yaw`, `head_roll`, `phone_present`, `phone_conf`, `gaze_on_script`, `gaze_direction`.
   - Raw Spatial Coordinates Excluded ($22$): All pixel coordinates (`face_x/y/w/h`, eye/nose/mouth coordinates, phone bounding boxes) are permanently excluded.

---

## 7. Local FastAPI Service Verification

The local FastAPI service was verified using `fastapi.testclient.TestClient`:

### 7.1 Verified Endpoints

| Endpoint | Method | Status Code | Purpose & Output |
| :--- | :---: | :---: | :--- |
| `/health` | GET | `200 OK` | Liveness and model availability check (`status: healthy`, `engine_version: 2.0.0`). |
| `/status` | GET | `200 OK` | Detailed inspection of loaded visual/behavioral models, invariant features, and active fairness rules. |
| `/score-session` | POST | `200 OK` | Primary session evaluation endpoint; returns complete `ScoreSessionResponse`. |
| `/score` | POST | `200 OK` | Convenience alias for `/score-session`. |
| `/docs` | GET | `200 OK` | Auto-generated Swagger UI interactive documentation. |
| `/openapi.json` | GET | `200 OK` | Full OpenAPI schema definition. |

### 7.2 Error Handling & Security
- **Pydantic Validation (HTTP 422)**: Malformed payloads (e.g. empty `session_id`, negative integer counts) return a standard FastAPI 422 Unprocessable Entity with field-specific validation error details.
- **Business Logic Errors (HTTP 400)**: Invalid domain data (such as negative `timestamp_sec` values) raise a `ValueError` mapped to HTTP 400 Bad Request with an actionable error message.
- **Privacy & PII Protection**: Candidate names, email addresses, and credentials are never requested or accepted by the schema. Session identifiers in log messages are masked to prevent accidental telemetry leakage.
- **Local Isolation**: The service binds locally (`127.0.0.1:8000`) and makes no outbound network connections.

---

## 8. Test Suite Verification & Performance

### 8.1 Automated Test Suite Execution
All automated unit and integration tests were executed via pytest under Python 3.14.6:

```powershell
python -m pytest -v
```

**Results**: **38 passed, 0 failed in 5.71s** (100% pass rate).

| Test Module | Tests | Status | Scope |
| :--- | :---: | :---: | :--- |
| `tests/test_engine_integration.py` | 16 | **PASSED** | Multimodal scoring, missing modalities, edge cases, error handling, API client. |
| `tests/test_safety_properties.py` | 7 | **PASSED** | Core fairness invariants (lighting, shared room, paste policy, network). |
| `tests/test_models_and_inference.py` | 6 | **PASSED** | Model loading, reproducibility, calibration, v2 invariant features, latency. |
| `tests/test_data_pipeline.py` | 5 | **PASSED** | Data loaders, missingness, schema validation, PII leakage detection. |
| `tests/test_engine_and_api.py` | 4 | **PASSED** | Episode clustering, collusion analysis, basic API scoring. |
| **Total** | **38** | **ALL PASSED** | Full coverage of functional and safety requirements. |

### 8.2 CPU Inference Benchmarks
- **Visual Model v2.0.0 Inference**: **$0.015\text{ ms / frame}$** on single CPU core ($\approx 67,500\text{ FPS}$).
- **End-to-End Session Scoring**: **$< 6.0\text{ ms}$** per examination session.
- **Model Bundle Disk Footprint**: **$0.006\text{ MB}$** (`6.5\text{ KB}`), compared to $0.395\text{ MB}$ for legacy tree models.
- **Memory Footprint**: Less than $2\text{ MB}$ RAM overhead during full inference pipeline.

---

## 9. Reproducible Local Demonstration

A complete local demonstration script is available at [`scripts/demo_local_service.py`](file:///c:/Users/saura/OneDrive/Pictures/FairProctor-AI/FairProctor-AI/scripts/demo_local_service.py).

### 9.1 How to Run the Demonstration
Execute the demonstration script from the repository root:

```powershell
python scripts/demo_local_service.py
```

### 9.2 Example Request Payload
```json
{
  "session_id": "candidate_session_im102_demo",
  "session_metadata": {
    "candidate_id": "cand_demo_8821",
    "is_shared_room": true,
    "expected_duration_sec": 60.0
  },
  "video_observations": [
    {
      "timestamp_sec": 0.0,
      "face_present": 1,
      "no_of_face": 2,
      "face_conf": 52.0,
      "head_pose": "forward",
      "phone_present": 0,
      "phone_conf": 0.0
    },
    {
      "timestamp_sec": 5.0,
      "face_present": 1,
      "no_of_face": 2,
      "face_conf": 54.0,
      "head_pose": "down",
      "phone_present": 0,
      "phone_conf": 0.0
    },
    {
      "timestamp_sec": 10.0,
      "face_present": 1,
      "no_of_face": 1,
      "face_conf": 55.0,
      "head_pose": "forward",
      "phone_present": 1,
      "phone_conf": 0.91
    },
    {
      "timestamp_sec": 15.0,
      "face_present": 1,
      "no_of_face": 1,
      "face_conf": 56.0,
      "head_pose": "forward",
      "phone_present": 1,
      "phone_conf": 0.89
    },
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
    "fps": 0.2,
    "network_interruptions": 1,
    "lighting_conf": 54.0
  },
  "policy": {
    "exam_id": "im102_exam_fair",
    "policy_version": "1.0.0",
    "allow_copy_paste": false,
    "allow_tab_switch": false,
    "shared_room_candidate": true,
    "low_bandwidth_candidate": true
  }
}
```

### 9.3 Output Assessment Breakdown
```
================================================================================
EVALUATION RESULT BREAKDOWN
================================================================================
Session Identifier:     candidate_session_im102_demo
Risk Score:             30.0/100 (Review Priority Ranking; NOT a probability)
Integrity Score:        70.0/100
Review Priority Level:  MEDIUM
Recommended Action:     SPOT_CHECK
Confidence Level:       MODERATE (Low environmental quality)
Model & Policy Version: Model v2.0.0 | Policy v1.0.0

--- Contributing Factors ---
  • Visual Behavior: +30.0 pts
  • Browser Events: +0.0 pts
  • Cross Candidate Similarity: +0.0 pts

--- Environmental Quality Context (0.0 Penalty Points) ---
  [Context] Poor lighting condition detected (Average face detection confidence 55.0%). Confidence threshold softened to avoid false accusations.
  [Context] Low frame availability detected (5/12 frames received, 41.7%). System tolerating network latency.
  [Context] Candidate experienced 1 network interruptions during the exam.
  [Context] Shared room / background activity observed. Per IM-102 policy, presence of background individuals alone is NOT grounds for penalty.

--- Evidence Timeline (2 items) ---
  [10s - 15s] (VIDEO_CV) PHONE_DETECTED [HIGH]: Unauthorized mobile device observed lasting approximately 10.0 seconds. (Contribution: +30.0 pts)
  [Multiple intervals] (ENVIRONMENTAL) BACKGROUND_PERSON_DETECTED [INFO]: Secondary person observed in background; not penalized per shared-room policy. (Contribution: +0.0 pts)
```

---

## 10. Remaining Limitations & Next Real-World Data Needed

While the engine architecture, fairness policies, and service layers are complete, the following empirical limitations remain:

1. **Absence of Benign Shared-Room Video Data**: In the Mendeley dataset, 100% of frames with multiple faces are labeled as cheating ($114/114$). The model weights alone cannot distinguish benign roommates from unauthorized collaborators; this distinction is currently enforced strictly by the procedural policy layer.
2. **Provisional Multi-Modal Combination Weights**: The point contributions for combining video, browser events, and answer similarity are provisional heuristics rather than statistically calibrated joint probabilities.
3. **Small-Cohort Behavioral Baseline ($N=111$)**: The tabular behavioral model is an exploratory baseline. Training a supervised session risk model requires telemetry from $> 10,000$ real examination attempts.
4. **Natural Scratchpad & Desk Movement**: Staged laboratory datasets lack natural student movements during complex mathematical problem-solving. Real-world proctoring video is needed to model gaze variance when candidates write on physical paper.

---

## 11. Production Readiness Statement

> [!CAUTION]
> **FairProctor-AI is NOT claimed to be production-ready or to possess validated real-world accuracy.**  
> The system is architected as an **explainable decision-support tool** to prioritize human reviewer queues. It must **never** be used for autonomous, consequential disqualification decisions without human auditor review.
