# FairProctor-AI Candidate Portal & Real-Time Reviewer Integration
## Evaluation Report: Challenge IM-102 ("Proctoring That Does Not Punish a Shared Room")

**Status:** Validated & Runnable  
**Model Version:** Visual Model v2.0.0 (Logistic Regression on Invariant Geometries)  
**Policy Version:** IM-102-v1.0 (Zero-Penalty Shared Room & Environmental Non-Penalization)  
**Date:** October 2026  

---

## 1. Executive Summary & Challenge Context

For Challenge IM-102 (*"Proctoring That Does Not Punish a Shared Room"*), commercial AI proctoring tools frequently generate severe false accusations against students from lower socio-economic backgrounds, shared dormitories, or low-bandwidth environments. When multiple faces appear in the background, ambient lighting fluctuates, or network latency causes frame dropouts, standard algorithmic proctoring systems immediately flag the session for cheating or automatically disqualify the candidate.

**FairProctor-AI** resolves this challenge through an integrated, privacy-first examination architecture:
1. **Candidate Examination Portal:** A 10-screen onboarding, hardware readiness, camera privacy check, and active examination interface with live telemetry.
2. **Deterministic Fairness Safeguards (Policy IM-102):** Environmental observations (background individuals in shared rooms, low lighting, network jitter, or camera loss) produce **0 misconduct penalty points** and strictly cannot independently escalate review priority.
3. **Transparent Reviewer Integration:** Real-time Server-Sent Events (SSE) stream candidate lifecycle telemetry directly into the reviewer dashboard without full-page reloads, clearly labeling events as **`[BROWSER NATIVE]`**, **`[SIMULATED]`**, or **`[MODEL SCORING]`**.
4. **Human Review Adjudication:** Decisions remain strictly in human hands with server-side role gating; model outputs are explicitly labeled as provisional review-priority heuristics rather than automated judgements.

---

## 2. Architecture & Modified Files

```mermaid
flowchart TD
    subgraph Candidate Browser Client
        W[10-Screen Wizard & Onboarding] --> AE[Active Exam Interface]
        AE --> BT[Browser Telemetry: Visibility, Answers, Ping]
        AE --> SC[Demo Simulation Controls]
    end

    subgraph FastAPI Backend [:8000]
        CE[Candidate API Router] --> SS[Session Store & Lifecycle]
        SS --> FPE[FairProctorEngine.score_session]
        FPE --> IM102[Policy IM-102 Rule Evaluator]
        SS --> SSE[Server-Sent Events Pub/Sub]
    end

    subgraph Reviewer Dashboard Client
        SSE --> RD[Live Event Timeline & Detail View]
        RD --> HA[Role-Gated Human Adjudication]
    end

    BT -->|POST /candidate/events| CE
    SC -->|POST /candidate/events| CE
    HA -->|POST /sessions/{id}/decisions| CE
```

### Modified and Created Files

| File | Purpose |
| :--- | :--- |
| `src/fairproctor/api/schemas.py` | Added `CandidateEventType`, `EventSource`, `CandidateEventPayload`, `CandidateEventRecord`, and candidate session models. |
| `src/fairproctor/api/session_store.py` | Added candidate session lifecycle (`start_candidate_session`, `record_candidate_event`, `record_candidate_answer`, `submit_candidate_exam`), engine scoring recalculation with IM-102 protection, and thread-safe SSE pub/sub broadcast. |
| `src/fairproctor/api/service.py` | Added candidate API endpoints (`/candidate/sessions/start`, `/events`, `/answers`, `/submit`) and streaming SSE endpoints (`/api/v1/events/stream`, `/api/v1/sessions/{id}/stream`). |
| `tests/test_candidate_api_lifecycle.py` | 5 comprehensive automated tests verifying candidate session start, event schema validation, 422 on unauthorized event types, IM-102 zero-penalty enforcement, camera drop, and SSE stream. |
| `frontend/src/types/proctoring.ts` | Added TypeScript interfaces for candidate events, payloads, exam questions, and session lifecycle metadata. |
| `frontend/src/api/client.ts` | Added candidate client methods and `subscribeToEventStream` SSE subscription with automatic reconnect handling. |
| `frontend/src/candidate/examQuestions.ts` | 5 synthetic computer science & algorithm multiple-choice questions (no real student identifiers). |
| `frontend/src/candidate/CandidatePortal.tsx` | Complete 10-screen candidate wizard & examination interface, 5-minute timer, camera preview, simulation drawer, and submission dialog. |
| `frontend/src/components/Navbar.tsx` | Added portal switcher pill (`Reviewer Dashboard` vs `Candidate Exam`). |
| `frontend/src/pages/SessionDetailPage.tsx` | Added live candidate telemetry stream card, source badges (`SIMULATION` vs `BROWSER NATIVE`), reliability badges, and IM-102 policy indicator. |
| `frontend/src/pages/ReviewQueuePage.tsx` | Added `LIVE EXAM` indicator and candidate progress badge. |
| `frontend/src/App.tsx` | Wired dual-mode portal switcher, CandidatePortal rendering, and real-time SSE listener. |
| `frontend/src/tests/candidate_portal.test.ts` | 7 automated frontend tests validating question integrity, pseudonymization, event schemas, camera denial, and IM-102 rules. |

---

## 3. Setup and Launch Commands

### Prerequisites
- Python 3.10+ (with project venv installed)
- Node.js 18+ and npm

### 1. Start the FastAPI Backend
```bash
# From workspace root:
& ".\.venv\Scripts\python.exe" -m uvicorn fairproctor.api.service:app --host 127.0.0.1 --port 8000 --reload
```
*Health Check:* `http://127.0.0.1:8000/api/v1/health`

### 2. Start the Frontend Development Server
```bash
# In the frontend/ directory:
cd frontend
& "E:\Data\node\npm.cmd" run dev -- --host
```
*Frontend URL:* `http://localhost:5173/`

### 3. Run Automated Backend Tests
```bash
# In workspace root:
& ".\.venv\Scripts\python.exe" -m pytest tests/
# Output: 48 passed in 11.56s
```

### 4. Run Automated Frontend Tests & Production Build
```bash
# In frontend/ directory:
& "E:\Data\node\npx.cmd" vitest run
# Output: 19 passed in 4.37s

& "E:\Data\node\npm.cmd" run build
# Output: built in 2.93s, zero errors
```

---

## 5. Candidate and Reviewer URLs

| View | Access Path | Description |
| :--- | :--- | :--- |
| **Reviewer Dashboard** | `http://localhost:5173/` (Navbar > Reviewer Dashboard) | Review queue, session audit details, environmental fairness tab, and decisions archive. |
| **Candidate Exam Portal** | `http://localhost:5173/` (Navbar > Candidate Exam) | 10-screen onboarding check, camera privacy prompt, active exam, and simulation drawer. |
| **Direct Session Detail** | `http://localhost:5173/` (Select session in queue) | Live telemetry stream, evidence timeline, model confidence breakdown, and human decision form. |
| **SSE Event Stream** | `http://127.0.0.1:8000/api/v1/events/stream` | Real-time text/event-stream broadcast of live candidate telemetry. |

---

## 6. API Endpoints Added or Reused

All candidate inputs are strictly validated on the server. The client never supplies risk scores, timestamps, or authorization roles.

### Added Candidate Endpoints

#### 1. Start Candidate Session
`POST /api/v1/candidate/sessions/start`
- **Request:**
  ```json
  {
    "candidate_ref": "cand_anon_3348",
    "exam_title": "CS 401 — Advanced Algorithms & Systems",
    "is_shared_room": true,
    "has_camera": true,
    "has_microphone": true
  }
  ```
- **Response:** `201 Created` with initialized `SessionDetailResponse` and pseudonymous `session_id`.

#### 2. Record Candidate Lifecycle Event
`POST /api/v1/candidate/sessions/{session_id}/events`
- **Validation:** Only valid `CandidateEventType` enum values are permitted. Rejects invalid strings with `422 Unprocessable Entity`. Server generates the UTC timestamp.
- **Request:**
  ```json
  {
    "event_type": "ENVIRONMENTAL_OBSERVATION",
    "source": "simulation",
    "is_simulated": true,
    "metadata": {
      "condition": "background_person",
      "observed_persons": 2,
      "reason": "Simulated roommate walked past background"
    }
  }
  ```
- **Response:** `200 OK` with recorded event record and broadcast via SSE.

#### 3. Submit Exam Answer
`POST /api/v1/candidate/sessions/{session_id}/answers`
- **Request:** `{"question_id": 1, "answer": "B"}`
- **Response:** `200 OK` with `ANSWER_SUBMITTED` event record and updated answer count.

#### 4. Submit Candidate Examination
`POST /api/v1/candidate/sessions/{session_id}/submit`
- **Request:** `{"candidate_ref": "cand_anon_3348", "submission_confirmed": true}`
- **Response:** `200 OK` with final recalculated `SessionDetailResponse` (`candidate_status: "COMPLETED"`).

#### 5. Server-Sent Events (SSE) Live Stream
`GET /api/v1/events/stream` and `GET /api/v1/sessions/{session_id}/stream`
- **Media Type:** `text/event-stream` with 15s keepalive pings.
- **Events Emitted:** `connected`, `session_created`, `event_added`, `session_completed`.

---

## 7. Signal Classification: Real, Simulated, or Model-Generated

To maintain academic and demonstration integrity, every signal is explicitly categorized:

| Telemetry Signal | Source Classification | Capture Mechanism | Misconduct Impact |
| :--- | :--- | :--- | :--- |
| **Tab Visibility Changes** | **Browser Native** | Captured via standard browser `document.addEventListener('visibilitychange')`. | Contextual observation; does not trigger automatic violation. |
| **Network Latency Ping** | **Browser Native** | Client measures round-trip HTTP ping to FastAPI `/api/v1/health` in milliseconds. | Informational only. |
| **Answer Submissions** | **Browser Native** | Real user selections on synthetic questions 1–5. | Evaluated for cohort answer distribution. |
| **Local Webcam Stream** | **Browser Native** | Browser `navigator.mediaDevices.getUserMedia()`; renders in local `<video>` element. Never persisted to cloud. | Missing stream drops confidence, produces 0 misconduct penalty. |
| **Roommate / Background Person** | **Simulated** | Injected via Demo Simulation Controls; clearly labeled `[SIMULATED]`. | **0 penalty points** under Policy IM-102. |
| **Ambient Light Fluctuations** | **Simulated** | Injected via Demo Simulation Controls; labeled `[SIMULATED]`. | Softens threshold; 0 misconduct penalty. |
| **Network Bandwidth Drop** | **Simulated** | Injected via Demo Simulation Controls; labeled `[SIMULATED]`. | Marked as connectivity issue; 0 misconduct penalty. |
| **Visual Feature Classification** | **Model-Generated** | Trained Logistic Regression on 6 invariant features (ear, yaw, pitch, roll, mar, mouth/ear). | Provisional review-priority heuristic. |
| **Reviewer Adjudication** | **Human Authority** | Authorized Lead Proctor or Reviewer decision. | Sole determinative outcome for the session. |

---

## 8. Five-Minute Demonstration Scenario

Follow this repeatable 5-minute demonstration script from a clean application launch:

### Step 1: Onboarding & Readiness (Minutes 0:00 – 1:30)
1. Navigate to `http://localhost:5173/`.
2. In the top navbar, click **`Candidate Exam`**.
3. **Screen 1 (Welcome):** Verify exam title (*CS 401 — Advanced Algorithms & Systems*). Confirm that *"Shared Room Environment (Policy IM-102 Protection Active)"* is checked. Click **`Begin System Readiness Check`**.
4. **Screen 2 (System Readiness):** Observe browser, OS, and screen checks passing. Click **`Continue to Camera & Mic Check`**.
5. **Screen 3 (Camera Check):** Click **`Grant Camera & Audio Access`** (or click **`Proceed in Limited-Evidence Mode`** if camera is unavailable). Notice the camera preview and visible camera indicator. Click **`Continue to Network Quality Check`**.
6. **Screen 4 (Network Quality):** Click **`Test Network Latency`**. Observe the real-time latency ping (e.g., 28 ms). Click **`Continue to Ambient Lighting Check`**.
7. **Screen 5 (Lighting Check):** Confirm ambient lighting indicator. Click **`Continue to Privacy Notice & Explicit Consent`**.
8. **Screen 6 (Privacy Notice):** Review data safeguards (local processing, no biometric identity matching, no cloud video recording). Check the explicit consent checkbox: *"I understand and explicitly consent to candidate telemetry capture under Policy IM-102"*. Click **`Accept Terms & Proceed to Instructions`**.
9. **Screen 7 (Instructions):** Review examination guidelines. Click **`Start Examination Now`**.

### Step 2: Active Examination & Telemetry (Minutes 1:30 – 3:30)
10. **Screen 8 (Active Exam):**
    - Observe the 5-minute countdown timer ticking down.
    - **Question 1:** Select option **B** ($O(n^2)$ worst-case Quicksort). Click **`Next Question`**.
    - **Question 2:** Select option **C** (*Stack* for LIFO).
11. **Trigger Demo Simulations:**
    - In the bottom floating **Demo Simulation Controls** drawer, click:
      - **`Shared Room (2nd Person)`**: Simulates a roommate walking behind the candidate.
      - **`Low Lighting`**: Simulates sudden room illumination drop.
      - **`Network Drop`**: Simulates temporary packet loss.
      - **`Network Restored`**: Simulates connectivity recovery.
      - **`Camera Off`** and then **`Camera Restored`**: Simulates brief hardware interruption.
      - **`Tab Switch`**: Simulates a browser tab switch.
12. **Complete Questions 3, 4, and 5:**
    - **Question 3:** Select option **B** (*Preemptive Scheduling*).
    - **Question 4:** Select option **C** (*SYN -> SYN-ACK -> ACK*).
    - **Question 5:** Select option **D** (*Exponential $O(2^n)$*).
13. Click **`Submit Examination`** in the top navigation or bottom bar.
14. **Screen 9 (Confirmation Modal):** Review unanswered warning (0 unanswered) and click **`Yes, Submit Exam Now`**.

### Step 3: Submission & Reviewer Inspection (Minutes 3:30 – 5:00)
15. **Screen 10 (Completion):** Observe the completion card showing session reference (e.g. `sess_live_cand_33488a`) and confirmation that **IM-102 Zero Risk Penalty** was enforced.
16. Click **`Inspect Live Session in Reviewer Dashboard`**.
17. **Reviewer Dashboard (Active Session Detail):**
    - The candidate session opens immediately.
    - Inspect the **Live Candidate Telemetry & Event Stream**:
      - Confirm all browser events (`SESSION_STARTED`, `ANSWER_SUBMITTED`, `TAB_VISIBILITY_CHANGED`) and simulated events (`ENVIRONMENTAL_OBSERVATION`, `NETWORK_DEGRADED`) appear with exact UTC timestamps.
      - Notice the distinct **`[SIMULATION]`** (amber) vs **`[BROWSER NATIVE]`** (indigo) badges.
      - Inspect the **Environmental & Accessibility Notices** card:
        > *"Shared room / background activity observed. Per IM-102 policy, presence of background individuals alone is NOT grounds for penalty."*
      - Confirm the Risk Priority score remains **`LOW`** (Provisional Review-Priority Heuristic).
18. **Record Reviewer Adjudication:**
    - In the **Human Review Adjudication** form at the bottom, select **`No Concern Identified`**.
    - Enter notes: *"Observed shared room movement was brief and environmental. Candidate cleared under Policy IM-102."*
    - Click **`Record Human Review Determination`**.
    - Verify that the audit record is saved and displayed with timestamp and reviewer ID (`rev_lead_01`).

---

## 9. Privacy, Fairness, and Ethical Safeguards

FairProctor-AI adheres to strict ethical proctoring guidelines:

1. **Zero-Penalty Shared Room Policy (IM-102):** The presence of a second person in a candidate's background does **not** add penalty points. It is logged as an environmental context note.
2. **Graceful Camera-Denied Fallback:** If a candidate denies camera permissions or suffers camera hardware failure, the system falls back to a limited-evidence mode. Missing video reduces model confidence rather than triggering cheating accusations.
3. **No Biometric Face Recognition:** The system does not identify candidates, compute facial embeddings, or infer sensitive demographic attributes.
4. **No Cloud Video Storage:** Video frames are processed in-browser. Zero video streams are transmitted to or stored on server disks.
5. **No Automatic Disqualification:** Algorithms only calculate provisional review-priority heuristics; only human reviewers with appropriate authorization roles can make determinations.
6. **No Real PII:** Candidate references are generated pseudonymously (`cand_anon_XXXX`) without collecting names, emails, or student IDs.

---

## 10. Automated Test & Build Verification Results

### Backend Automated Test Suite (`pytest`)
- **Total Tests Collected:** 48
- **Passed:** 48 (100%)
- **Execution Time:** 11.56 seconds
- **Test Modules:**
  - `tests/test_candidate_api_lifecycle.py`: 5 passed (Session start, validation, 422 errors, IM-102 zero-penalty, SSE stream)
  - `tests/test_api_dashboard_endpoints.py`: 5 passed
  - `tests/test_data_pipeline.py`: 5 passed
  - `tests/test_engine_and_api.py`: 4 passed
  - `tests/test_engine_integration.py`: 16 passed
  - `tests/test_models_and_inference.py`: 6 passed
  - `tests/test_safety_properties.py`: 7 passed

### Frontend Automated Test Suite (`vitest`)
- **Total Tests Collected:** 19
- **Passed:** 19 (100%)
- **Execution Time:** 4.37 seconds
- **Test Modules:**
  - `frontend/src/tests/candidate_portal.test.ts`: 7 passed (Synthetic MCQs, pseudonymization, 10 event types, simulation badges, camera denial, IM-102 non-penalization)
  - `frontend/src/tests/dashboard.test.ts`: 12 passed (Reviewer queue sorting, search filtering, fallback fixtures)

### Frontend Production Build (`npm run build`)
```text
vite v8.3.5 building client environment for production...
✓ 2679 modules transformed.
dist/index.html                   1.28 kB │ gzip:   0.70 kB
dist/assets/index-C-dxv3TF.css   39.96 kB │ gzip:   7.29 kB
dist/assets/index-DjUSYFPi.js   813.23 kB │ gzip: 231.49 kB
✓ built in 2.93s
```

---

## 11. Known Limitations & Production Disclaimer

> [!WARNING]
> **Prototype Demonstration Notice:**
> Although FairProctor-AI demonstrates robust architecture and passed all 67 automated test cases (48 backend + 19 frontend), this deployment is configured as a local demonstration prototype and is **not** certified for high-stakes production examinations without:
> 1. Production OAuth2/OIDC single sign-on integration for student and proctor authentication.
> 2. Hardened WebSocket/gRPC transport with mutual TLS for distributed campus deployments.
> 3. Persistent relational or document database (PostgreSQL/TimescaleDB) replacing the in-memory session store.
> 4. Multi-jurisdiction FERPA, GDPR, and COPPA institutional compliance review.

---
*FairProctor-AI Engineering Team &middot; Challenge IM-102*
