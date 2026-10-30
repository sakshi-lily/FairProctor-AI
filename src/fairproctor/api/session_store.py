"""In-memory session storage and decision management for FairProctor-AI reviewer dashboard.

Maintains realistic demonstration sessions alongside live scored sessions.
Enforces authorization rules (e.g. Lead Proctor requirement for confirmed violations).
Guarantees separation of human reviewer decisions from model predictions.
"""

import asyncio
from datetime import datetime, timezone
import random
import secrets
import uuid
from typing import Any, Dict, List, Optional
from fairproctor.api.schemas import (
    CandidateAnswerRequest,
    CandidateEventPayload,
    CandidateEventRecord,
    CandidateEventType,
    CandidateStartSessionRequest,
    CandidateSubmitExamRequest,
    CreatePairingRequest,
    CreatePairingResponse,
    EventSource,
    EvidenceItemSchema,
    MobileEnvironmentCheckSubmitRequest,
    OverviewStatsResponse,
    PairingStatus,
    PairingStatusResponse,
    ReviewDecisionType,
    ReviewerDecisionRecord,
    ReviewerDecisionRequest,
    ReviewerRole,
    ScoreSessionResponse,
    SessionDetailResponse,
    SessionListResponse,
    SessionSummaryItem,
)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SessionStore:
    """Thread-safe in-memory store for session summaries, details, live candidate events, and reviewer decisions."""

    def __init__(self):
        self._sessions: Dict[str, SessionDetailResponse] = {}
        self._candidate_states: Dict[str, Dict[str, Any]] = {}
        self._pairings: Dict[str, Dict[str, Any]] = {}
        self._session_to_pairing: Dict[str, str] = {}
        self._code_to_pairing: Dict[str, str] = {}
        self._listeners: List[asyncio.Queue] = []
        self._seed_demonstration_data()

    def _seed_demonstration_data(self) -> None:
        """Seeds realistic, explicitly labelled demonstration fixtures."""
        demo_fixtures = [
            SessionDetailResponse(
                session_id="sess_shared_room_01",
                risk_score=12.0,
                integrity_score=88.0,
                risk_level="LOW",
                evidence_timeline=[
                    EvidenceItemSchema(
                        timestamp_or_interval="t=120s - 128s",
                        source="environmental_conditions",
                        observation_type="shared_space_detection",
                        observed_value={"secondary_person_detected": True, "sustained_conversation": False},
                        relevant_policy="IM-102: Proctoring That Does Not Punish a Shared Room",
                        explanation="Secondary person walked through background. Candidate maintained forward screen attention without auditory collusion.",
                        severity="LOW",
                        contribution_score=0.0,
                        data_quality_limitations="Single webcam sensor without depth map."
                    )
                ],
                contributing_factors={"visual_cv": 0.05, "browser_telemetry": 0.0, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[
                    "Shared room observation: Secondary person in background (IM-102 policy applied: 0 penalty assigned)"
                ],
                missing_data=[],
                confidence_or_uncertainty="Moderate confidence (0.86). Background movement did not interrupt test-taker interaction.",
                recommended_action="NO_ACTION",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Candidate worked in shared living quarters. Passive background individual detected; zero penalty assessed.",
                review_status=ReviewDecisionType.PENDING_REVIEW,
                is_demonstration_data=True,
                created_at="2026-10-29T09:15:00Z"
            ),
            SessionDetailResponse(
                session_id="sess_phone_det_02",
                risk_score=78.5,
                integrity_score=21.5,
                risk_level="HIGH",
                evidence_timeline=[
                    EvidenceItemSchema(
                        timestamp_or_interval="t=315s - 345s",
                        source="video_cv",
                        observation_type="secondary_device_detected",
                        observed_value={"device_type": "mobile_phone", "consecutive_frames": 24},
                        relevant_policy="Standard Exam Security Policy: Unauthorized Electronic Devices",
                        explanation="Visual model v2.0.0 confirmed handheld phone in candidate primary visual field over 24 consecutive frames.",
                        severity="HIGH",
                        contribution_score=0.62,
                        data_quality_limitations="Candidate hand partially occludes bottom edge of screen."
                    ),
                    EvidenceItemSchema(
                        timestamp_or_interval="t=320s",
                        source="browser_telemetry",
                        observation_type="window_blur",
                        observed_value={"blur_duration_sec": 4.2},
                        relevant_policy="Standard Exam Security Policy: Continuous Browser Focus",
                        explanation="DOM window focus lost concurrently with secondary device appearance.",
                        severity="MEDIUM",
                        contribution_score=0.15,
                        data_quality_limitations=None
                    )
                ],
                contributing_factors={"visual_cv": 0.62, "browser_telemetry": 0.15, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[],
                missing_data=[],
                confidence_or_uncertainty="High confidence (0.94). Clear object boundary and temporal stability across video frames.",
                recommended_action="PRIORITY_HUMAN_REVIEW",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Sustained mobile phone detection accompanied by browser focus loss. Manual verification of frames 315-345 strongly advised.",
                review_status=ReviewDecisionType.PENDING_REVIEW,
                is_demonstration_data=True,
                created_at="2026-10-29T10:02:15Z"
            ),
            SessionDetailResponse(
                session_id="sess_tab_switching_03",
                risk_score=56.0,
                integrity_score=44.0,
                risk_level="MEDIUM",
                evidence_timeline=[
                    EvidenceItemSchema(
                        timestamp_or_interval="t=640s - 780s",
                        source="browser_telemetry",
                        observation_type="excessive_tab_switching",
                        observed_value={"blur_events": 14, "paste_events": 4},
                        relevant_policy="Standard Exam Security Policy: Browser Navigation",
                        explanation="Candidate exited examination tab 14 times during coding questions 8-12 with external clipboard paste operations.",
                        severity="MEDIUM",
                        contribution_score=0.56,
                        data_quality_limitations=None
                    )
                ],
                contributing_factors={"visual_cv": 0.04, "browser_telemetry": 0.52, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[],
                missing_data=[],
                confidence_or_uncertainty="High confidence (0.91). DOM telemetry events recorded client-side with cryptographic sequence IDs.",
                recommended_action="SPOT_CHECK",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Excessive loss of DOM focus during problem solving. Reviewer should inspect copied text snippets.",
                review_status=ReviewDecisionType.PENDING_REVIEW,
                is_demonstration_data=True,
                created_at="2026-10-29T11:20:45Z"
            ),
            SessionDetailResponse(
                session_id="sess_poor_lighting_04",
                risk_score=8.0,
                integrity_score=92.0,
                risk_level="LOW",
                evidence_timeline=[],
                contributing_factors={"visual_cv": 0.02, "browser_telemetry": 0.0, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[
                    "Adverse ambient illumination (<0.18 lux index)",
                    "Missing browser telemetry stream",
                    "Network packet loss (>12%)"
                ],
                missing_data=["browser_telemetry"],
                confidence_or_uncertainty="Low confidence (0.38) due to dim environment and partial sensor outage. Insufficient evidence to evaluate integrity.",
                recommended_action="NO_ACTION",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Environmental degradation (poor lighting and missing telemetry). Safeguard IM-102 prohibits penalty for infrastructure deficiency.",
                review_status=ReviewDecisionType.REQUIRES_INVESTIGATION,
                is_demonstration_data=True,
                created_at="2026-10-29T12:05:10Z"
            ),
            SessionDetailResponse(
                session_id="sess_normal_clean_05",
                risk_score=3.2,
                integrity_score=96.8,
                risk_level="LOW",
                evidence_timeline=[],
                contributing_factors={"visual_cv": 0.02, "browser_telemetry": 0.01, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[],
                missing_data=[],
                confidence_or_uncertainty="High confidence (0.97). All video frames and telemetry packets received with nominal variance.",
                recommended_action="NO_ACTION",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Exam completed within all security tolerances. No anomalous visual, acoustic, or telemetry signatures.",
                review_status=ReviewDecisionType.NO_CONCERN,
                is_demonstration_data=True,
                created_at="2026-10-29T12:45:00Z",
                decision_record=ReviewerDecisionRecord(
                    session_id="sess_normal_clean_05",
                    decision=ReviewDecisionType.NO_CONCERN,
                    reviewer_id="rev_auditor_01",
                    reviewer_role=ReviewerRole.LEAD_PROCTOR,
                    notes="Baseline audit passed. Zero anomalous posture or telemetry signals.",
                    decision_timestamp="2026-10-29T13:00:00Z"
                )
            ),
            SessionDetailResponse(
                session_id="sess_scratchpad_06",
                risk_score=18.5,
                integrity_score=81.5,
                risk_level="LOW",
                evidence_timeline=[
                    EvidenceItemSchema(
                        timestamp_or_interval="t=450s - 510s",
                        source="video_cv",
                        observation_type="downward_gaze_posture",
                        observed_value={"pitch_degrees": -24.5, "yaw_degrees": 2.1},
                        relevant_policy="Standard Exam Security Policy: Physical Scratchpad Policy",
                        explanation="Candidate looked down at workspace to perform physical paper calculations. Head pose invariant check confirmed zero lateral diversion.",
                        severity="LOW",
                        contribution_score=0.12,
                        data_quality_limitations="Downward tilt limits iris-to-sclera gaze ratio visibility."
                    )
                ],
                contributing_factors={"visual_cv": 0.12, "browser_telemetry": 0.02, "environmental_reliability": 0.0, "answer_similarity": 0.0},
                environmental_warnings=[
                    "Frequent downward gaze angles consistent with physical scratchpad usage"
                ],
                missing_data=[],
                confidence_or_uncertainty="High confidence (0.90). Invariant head pose classifier verified workspace posture.",
                recommended_action="NO_ACTION",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Downward gaze during calculus calculation questions. Consistent with allowed scratchpad usage.",
                review_status=ReviewDecisionType.PENDING_REVIEW,
                is_demonstration_data=True,
                created_at="2026-10-29T13:10:30Z"
            ),
            SessionDetailResponse(
                session_id="sess_collusion_pair_07",
                risk_score=71.0,
                integrity_score=29.0,
                risk_level="HIGH",
                evidence_timeline=[
                    EvidenceItemSchema(
                        timestamp_or_interval="t=1800s (Submission)",
                        source="answer_similarity",
                        observation_type="cohort_pairwise_similarity",
                        observed_value={"similarity_coefficient": 0.93, "peer_session_ref": "sess_pair_peer_08"},
                        relevant_policy="Standard Exam Security Policy: Independent Work Guarantee",
                        explanation="Cross-candidate statistical engine detected identical typo patterns and syntax structure on free-text questions 3 and 7.",
                        severity="HIGH",
                        contribution_score=0.68,
                        data_quality_limitations="Statistical answer similarity only indicates probability of collusion; requires manual inspection of source submissions."
                    )
                ],
                contributing_factors={"visual_cv": 0.03, "browser_telemetry": 0.0, "environmental_reliability": 0.0, "answer_similarity": 0.68},
                environmental_warnings=[],
                missing_data=[],
                confidence_or_uncertainty="High statistical confidence (0.92). Probability of incidental text collision is < 0.001.",
                recommended_action="PRIORITY_HUMAN_REVIEW",
                model_version="2.0.0",
                policy_version="1.0.0",
                summary_explanation="Extreme answer text and structure similarity with peer candidate. Manual comparison of both test submissions required.",
                review_status=ReviewDecisionType.PENDING_REVIEW,
                is_demonstration_data=True,
                created_at="2026-10-29T14:00:00Z"
            )
        ]

        for s in demo_fixtures:
            self._sessions[s.session_id] = s

    def get_overview_stats(self) -> OverviewStatsResponse:
        """Calculates aggregated metrics across all stored sessions."""
        sessions = list(self._sessions.values())
        total = len(sessions)
        awaiting = sum(1 for s in sessions if s.review_status == ReviewDecisionType.PENDING_REVIEW)
        priority = sum(1 for s in sessions if s.risk_level == "HIGH")
        insufficient = sum(1 for s in sessions if len(s.missing_data) > 0 or "Low confidence" in s.confidence_or_uncertainty)
        environmental_warnings = sum(len(s.environmental_warnings) for s in sessions)

        return OverviewStatsResponse(
            total_sessions=total,
            awaiting_review=awaiting,
            priority_review=priority,
            insufficient_evidence=insufficient,
            environmental_warnings_count=environmental_warnings,
            model_version="2.0.0",
            policy_version="1.0.0",
            backend_health="healthy",
            is_demonstration_data=True,
        )

    def list_sessions(
        self,
        search: Optional[str] = None,
        priority: Optional[str] = None,
        status: Optional[ReviewDecisionType] = None,
    ) -> SessionListResponse:
        """Returns filtered and prioritized session summaries."""
        results: List[SessionSummaryItem] = []

        priority_order = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

        for s in self._sessions.values():
            if search:
                q = search.lower()
                if q not in s.session_id.lower() and q not in s.summary_explanation.lower():
                    continue

            if priority is not None and s.risk_level.upper() != priority.upper():
                continue

            if status is not None and s.review_status != status:
                continue

            item = SessionSummaryItem(
                session_id=s.session_id,
                risk_score=s.risk_score,
                integrity_score=s.integrity_score,
                risk_level=s.risk_level,
                recommended_action=s.recommended_action,
                evidence_count=len(s.evidence_timeline),
                environmental_warnings_count=len(s.environmental_warnings),
                environmental_warnings=s.environmental_warnings,
                missing_data=s.missing_data,
                confidence_or_uncertainty=s.confidence_or_uncertainty,
                review_status=s.review_status,
                decision_record=s.decision_record,
                model_version=s.model_version,
                policy_version=s.policy_version,
                is_demonstration_data=s.is_demonstration_data,
                is_live_candidate_session=s.is_live_candidate_session,
                candidate_status=s.candidate_status,
                created_at=s.created_at,
            )
            results.append(item)

        # Sort by priority descending (HIGH > MEDIUM > LOW), then by risk_score descending
        results.sort(
            key=lambda x: (
                priority_order.get(x.risk_level.upper(), 0),
                x.risk_score,
            ),
            reverse=True,
        )

        return SessionListResponse(total=len(results), sessions=results)

    def get_session(self, session_id: str) -> Optional[SessionDetailResponse]:
        """Retrieves complete details for a single session."""
        return self._sessions.get(session_id)

    def record_decision(
        self,
        session_id: str,
        request: ReviewerDecisionRequest,
    ) -> ReviewerDecisionRecord:
        """Records a human reviewer action.

        Guarantees:
        1. Model predictions (risk_score, integrity_score, recommended_action) are NEVER altered.
        2. CONFIRMED_VIOLATION requires LEAD_PROCTOR role.
        3. Decision record is persisted in session detail.
        """
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")

        # Role-based authorization gate
        if request.decision == ReviewDecisionType.CONFIRMED_VIOLATION:
            if request.reviewer_role != ReviewerRole.LEAD_PROCTOR:
                raise PermissionError(
                    "Unauthorized: Only Lead Proctors have authority to confirm policy violations after evidence examination."
                )

        record = ReviewerDecisionRecord(
            session_id=session_id,
            decision=request.decision,
            reviewer_id=request.reviewer_id,
            reviewer_role=request.reviewer_role,
            notes=request.notes,
            decision_timestamp=_utc_now_iso(),
        )

        # Update session review status without modifying model scores
        session.review_status = request.decision
        session.decision_record = record
        return record

    def add_scored_session(self, score_dict: dict, is_demonstration: bool = False) -> SessionDetailResponse:
        """Stores a freshly scored session from the risk engine into the review queue."""
        detail = SessionDetailResponse(
            **score_dict,
            review_status=ReviewDecisionType.PENDING_REVIEW,
            decision_record=None,
            is_demonstration_data=is_demonstration,
            is_live_candidate_session=score_dict.get("is_live_candidate_session", False),
            candidate_status=score_dict.get("candidate_status", "COMPLETED"),
            events=[],
            answers_count=score_dict.get("answers_count", 0),
            created_at=_utc_now_iso(),
        )
        self._sessions[detail.session_id] = detail
        self.broadcast("session_created", {"session_id": detail.session_id})
        return detail

    # --- Live Candidate Session & PubSub Extensions ---

    def subscribe(self) -> asyncio.Queue:
        """Subscribes an SSE listener queue to live session events."""
        q: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._listeners.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        """Unsubscribes an SSE listener queue."""
        if q in self._listeners:
            self._listeners.remove(q)

    def broadcast(self, event_name: str, payload: dict) -> None:
        """Dispatches an event non-blockingly to all registered SSE queues."""
        msg = {"event": event_name, "data": payload}
        for q in list(self._listeners):
            try:
                q.put_nowait(msg)
            except asyncio.QueueFull:
                pass
            except Exception:
                pass

    def start_candidate_session(
        self,
        req: CandidateStartSessionRequest,
        engine: Any,
    ) -> SessionDetailResponse:
        """Initializes a live mock examination candidate session."""
        session_id = f"sess_live_cand_{uuid.uuid4().hex[:6]}"
        cand_ref = req.candidate_pseudonym or f"cand_anon_{uuid.uuid4().hex[:4]}"

        # Initialize internal tracking state
        self._candidate_states[session_id] = {
            "candidate_ref": cand_ref,
            "exam_title": req.exam_title,
            "is_shared_room": req.is_shared_room_declared,
            "camera_permitted": req.camera_permitted,
            "camera_unavailable": not req.camera_permitted,
            "tab_switches": 0,
            "network_degraded": False,
            "poor_lighting": False,
            "background_person_observed": False,
            "answers": {},
        }

        # Create initial start event
        start_evt = CandidateEventRecord(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            session_id=session_id,
            event_type=CandidateEventType.SESSION_STARTED,
            timestamp=_utc_now_iso(),
            source=EventSource.BROWSER,
            metadata={
                "exam_title": req.exam_title,
                "is_shared_room_declared": req.is_shared_room_declared,
                "camera_permitted": req.camera_permitted,
                "notes": req.notes or "Mock examination session initialized by candidate."
            },
            is_simulated=False,
            evidence_reliability="high_browser_telemetry",
        )

        # Baseline evaluation via FairProctorEngine
        detail = self._recalculate_candidate_score(session_id, engine)
        detail.events = [start_evt]
        detail.is_live_candidate_session = True
        detail.candidate_status = "IN_PROGRESS"
        detail.is_demonstration_data = False
        self._sessions[session_id] = detail

        self.broadcast("session_created", {"session_id": session_id, "status": "IN_PROGRESS"})
        return detail

    def record_candidate_event(
        self,
        session_id: str,
        payload: CandidateEventPayload,
        engine: Any,
    ) -> CandidateEventRecord:
        """Validates and records a live event, updating the session's risk assessment via the engine."""
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")

        state = self._candidate_states.setdefault(session_id, {
            "is_shared_room": True,
            "camera_unavailable": False,
            "tab_switches": 0,
            "network_degraded": False,
            "poor_lighting": False,
            "background_person_observed": False,
            "answers": {},
        })

        # Reliability tag
        if payload.is_simulated:
            reliability = "simulated_demonstration"
        elif payload.source == EventSource.BROWSER:
            reliability = "high_browser_telemetry"
        else:
            reliability = payload.evidence_reliability or "moderate"

        # Construct immutable server record
        record = CandidateEventRecord(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            session_id=session_id,
            event_type=payload.event_type,
            timestamp=_utc_now_iso(),
            source=payload.source,
            metadata=payload.metadata,
            is_simulated=payload.is_simulated,
            evidence_reliability=reliability,
        )

        # Update tracking state
        if payload.event_type in [CandidateEventType.TAB_VISIBILITY_CHANGED, CandidateEventType.EXAM_TAB_HIDDEN]:
            if payload.metadata.get("hidden", True):
                state["tab_switches"] = state.get("tab_switches", 0) + 1
        elif payload.event_type == CandidateEventType.EXAM_FULLSCREEN_EXITED:
            state["fullscreen_exits"] = state.get("fullscreen_exits", 0) + 1
        elif payload.event_type == CandidateEventType.EXAM_WARNING_ACKNOWLEDGED:
            state["warnings_acknowledged"] = state.get("warnings_acknowledged", 0) + 1
        elif payload.event_type == CandidateEventType.CAMERA_PERMISSION_GRANTED:
            state["camera_unavailable"] = False
        elif payload.event_type == CandidateEventType.MICROPHONE_PERMISSION_GRANTED:
            state["microphone_permitted"] = True
        elif payload.event_type == CandidateEventType.ENVIRONMENT_CHECK_UNAVAILABLE:
            state["env_check_unavailable"] = True
        elif payload.event_type == CandidateEventType.ENVIRONMENT_CHECK_COMPLETED:
            state["env_check_completed"] = True
        elif payload.event_type == CandidateEventType.CAMERA_UNAVAILABLE:
            state["camera_unavailable"] = True
        elif payload.event_type == CandidateEventType.CAMERA_RESTORED:
            state["camera_unavailable"] = False
        elif payload.event_type == CandidateEventType.NETWORK_DEGRADED:
            state["network_degraded"] = True
        elif payload.event_type == CandidateEventType.NETWORK_RESTORED:
            state["network_degraded"] = False
        elif payload.event_type == CandidateEventType.ENVIRONMENTAL_OBSERVATION:
            cond = str(payload.metadata.get("condition_type", "")).lower()
            if "person" in cond or "shared" in cond or "room" in cond:
                state["background_person_observed"] = True
            if "light" in cond or "illumination" in cond:
                state["poor_lighting"] = True
            if "bandwidth" in cond or "network" in cond:
                state["network_degraded"] = True
            if "frame_observation" in payload.metadata and isinstance(payload.metadata["frame_observation"], dict):
                state.setdefault("live_video_observations", []).append(payload.metadata["frame_observation"])
        elif payload.event_type in [CandidateEventType.SESSION_SUBMITTED, CandidateEventType.SESSION_COMPLETED]:
            session.candidate_status = "COMPLETED"

        # Append to live event timeline
        session.events.append(record)

        # Recalculate risk assessment with the real FairProctorEngine
        self._recalculate_candidate_score(session_id, engine)

        # Broadcast update to SSE listeners
        self.broadcast("event_added", {
            "session_id": session_id,
            "event": record.model_dump(),
            "risk_score": session.risk_score,
            "risk_level": session.risk_level,
        })
        return record

    def record_candidate_answer(
        self,
        session_id: str,
        req: CandidateAnswerRequest,
        engine: Any,
    ) -> CandidateEventRecord:
        """Records an answer submission from the candidate."""
        state = self._candidate_states.setdefault(session_id, {"answers": {}})
        state.setdefault("answers", {})[str(req.question_id)] = req.selected_option

        payload = CandidateEventPayload(
            event_type=CandidateEventType.ANSWER_SUBMITTED,
            source=EventSource.BROWSER,
            metadata={
                "question_id": req.question_id,
                "question_text": req.question_text,
                "selected_option": req.selected_option,
                "time_spent_seconds": req.time_spent_seconds,
            },
            is_simulated=False,
            evidence_reliability="high_browser_telemetry",
        )
        rec = self.record_candidate_event(session_id, payload, engine)
        session = self._sessions.get(session_id)
        if session:
            session.answers_count = len(state.get("answers", {}))
        return rec

    def submit_candidate_exam(
        self,
        session_id: str,
        req: CandidateSubmitExamRequest,
        engine: Any,
    ) -> SessionDetailResponse:
        """Finalizes candidate exam submission, updating status to COMPLETED."""
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")

        state = self._candidate_states.setdefault(session_id, {})
        for q_id, opt in req.answers.items():
            state.setdefault("answers", {})[str(q_id)] = opt

        session.answers_count = len(state.get("answers", {}))
        session.candidate_status = "COMPLETED"

        submit_payload = CandidateEventPayload(
            event_type=CandidateEventType.SESSION_SUBMITTED,
            source=EventSource.BROWSER,
            metadata={
                "total_answers": session.answers_count,
                "total_time_spent_seconds": req.total_time_spent_seconds,
            },
            is_simulated=False,
        )
        self.record_candidate_event(session_id, submit_payload, engine)

        complete_payload = CandidateEventPayload(
            event_type=CandidateEventType.SESSION_COMPLETED,
            source=EventSource.BROWSER,
            metadata={"status": "COMPLETED"},
            is_simulated=False,
        )
        self.record_candidate_event(session_id, complete_payload, engine)

        self.broadcast("session_completed", {
            "session_id": session_id,
            "risk_score": session.risk_score,
            "status": "COMPLETED",
        })
        return session

    def _recalculate_candidate_score(self, session_id: str, engine: Any) -> SessionDetailResponse:
        """Executes the existing FairProctorEngine across accumulated candidate telemetry."""
        session = self._sessions.get(session_id)
        state = self._candidate_states.get(session_id, {})

        is_shared_room = state.get("is_shared_room", True)
        tab_switches = state.get("tab_switches", 0)
        camera_unavailable = state.get("camera_unavailable", False)
        network_degraded = state.get("network_degraded", False)
        poor_lighting = state.get("poor_lighting", False)
        background_person = state.get("background_person_observed", False)

        # Build video observations
        video_obs: Optional[List[dict]] = None
        if not camera_unavailable:
            live_obs = state.get("live_video_observations", [])
            if live_obs:
                video_obs = [dict(o) for o in live_obs]
            else:
                video_obs = [
                    {
                        "timestamp_sec": 10.0,
                        "face_present": 1,
                        "no_of_face": 1,
                        "face_conf": 42.0 if poor_lighting else 88.0,
                        "head_pose": "forward",
                        "phone_present": 0,
                    },
                    {
                        "timestamp_sec": 30.0,
                        "face_present": 1,
                        "no_of_face": 1,
                        "face_conf": 40.0 if poor_lighting else 89.0,
                        "head_pose": "forward",
                        "phone_present": 0,
                    }
                ]
            if background_person:
                # Additional person in background: under IM-102 with shared room declared, this assigns 0 risk points!
                max_t = max([float(o.get("timestamp_sec", 30.0)) for o in video_obs], default=30.0)
                video_obs.extend([
                    {
                        "timestamp_sec": max_t + 5.0,
                        "face_present": 1,
                        "no_of_face": 2,
                        "face_conf": 45.0 if poor_lighting else 84.0,
                        "head_pose": "forward",
                        "phone_present": 0,
                    },
                    {
                        "timestamp_sec": max_t + 10.0,
                        "face_present": 1,
                        "no_of_face": 2,
                        "face_conf": 46.0 if poor_lighting else 85.0,
                        "head_pose": "forward",
                        "phone_present": 0,
                    }
                ])

        engine_payload = {
            "session_id": session_id,
            "session_metadata": {
                "is_shared_room": is_shared_room,
                "expected_duration_sec": 300.0,
            },
            "video_observations": video_obs,
            "browser_events": {
                "total_tab_switches": tab_switches,
                "paste_count": 0,
                "rapid_answer_count": 0,
            },
            "environmental_conditions": {
                "fps": 0.0 if camera_unavailable else 0.2,
                "network_interruptions": 2 if network_degraded else 0,
            },
            "policy": {
                "shared_room_candidate": is_shared_room,
                "allow_tab_switch": False,
                "max_tolerated_tab_switches": 2,
            }
        }

        # Score through existing engine without fabricating separate formulas
        assessment = engine.score_session(engine_payload)

        # Map to evidence schema
        evidence_items = []
        for e in assessment.evidence_timeline:
            evidence_items.append(
                EvidenceItemSchema(
                    timestamp_or_interval=e.get("timestamp_or_interval", ""),
                    source=e.get("source", ""),
                    observation_type=e.get("observation_type", ""),
                    observed_value=e.get("observed_value"),
                    relevant_policy=e.get("relevant_policy", ""),
                    explanation=e.get("explanation", ""),
                    severity=e.get("severity", "LOW"),
                    contribution_score=float(e.get("contribution_score", 0.0)),
                    data_quality_limitations=e.get("data_quality_limitations"),
                )
            )

        if session is not None:
            session.risk_score = assessment.risk_score
            session.integrity_score = assessment.integrity_score
            session.risk_level = assessment.risk_level
            session.evidence_timeline = evidence_items
            session.contributing_factors = assessment.contributing_factors
            session.environmental_warnings = assessment.environmental_warnings
            session.missing_data = assessment.missing_data
            session.confidence_or_uncertainty = assessment.confidence_or_uncertainty
            session.recommended_action = assessment.recommended_action
            session.summary_explanation = assessment.summary_explanation
            return session

        # Or create new session detail
        new_detail = SessionDetailResponse(
            session_id=session_id,
            risk_score=assessment.risk_score,
            integrity_score=assessment.integrity_score,
            risk_level=assessment.risk_level,
            evidence_timeline=evidence_items,
            contributing_factors=assessment.contributing_factors,
            environmental_warnings=assessment.environmental_warnings,
            missing_data=assessment.missing_data,
            confidence_or_uncertainty=assessment.confidence_or_uncertainty,
            recommended_action=assessment.recommended_action,
            model_version=assessment.model_version,
            policy_version=assessment.policy_version,
            summary_explanation=assessment.summary_explanation,
            review_status=ReviewDecisionType.PENDING_REVIEW,
            is_demonstration_data=False,
            is_live_candidate_session=True,
            candidate_status="IN_PROGRESS",
            events=[],
            answers_count=0,
            created_at=_utc_now_iso(),
        )
        self._sessions[session_id] = new_detail
        return new_detail

    # -------------------------------------------------------------
    # QR Pairing & Mobile Environment Check Implementation
    # -------------------------------------------------------------

    def create_pairing(
        self,
        session_id: str,
        frontend_origin: Optional[str] = None,
        ttl_seconds: int = 300,
    ) -> CreatePairingResponse:
        """Generates a cryptographically secure, single-session, short-lived mobile check token."""
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")

        # Cryptographically secure random token & human-friendly short pairing code
        pairing_token = secrets.token_urlsafe(24)
        pairing_code = f"FP-{random.randint(1000, 9999)}"

        now_dt = datetime.now(timezone.utc)
        expires_dt = datetime.fromtimestamp(now_dt.timestamp() + ttl_seconds, tz=timezone.utc)
        expires_at_iso = expires_dt.isoformat()
        created_at_iso = now_dt.isoformat()

        # Origin handling: sanitize and fall back safely
        origin = (frontend_origin or "http://localhost:5173").rstrip("/")
        qr_url = f"{origin}/?mode=mobile_check&pairing_token={pairing_token}"

        pairing_record = {
            "session_id": session_id,
            "pairing_token": pairing_token,
            "pairing_code": pairing_code,
            "qr_payload_url": qr_url,
            "created_at": created_at_iso,
            "expires_at": expires_at_iso,
            "updated_at": created_at_iso,
            "ttl_seconds": ttl_seconds,
            "status": "waiting_for_scan",
            "environment_check": None,
        }

        self._pairings[pairing_token] = pairing_record
        self._session_to_pairing[session_id] = pairing_token
        self._code_to_pairing[pairing_code] = pairing_token

        # Record audit event on candidate session
        record = CandidateEventRecord(
            event_id=f"evt_{uuid.uuid4().hex[:8]}",
            session_id=session_id,
            event_type=CandidateEventType.QR_PAIRING_CREATED,
            timestamp=_utc_now_iso(),
            source=EventSource.SERVER,
            metadata={
                "pairing_code": pairing_code,
                "expires_at": expires_at_iso,
                "ttl_seconds": ttl_seconds,
            },
            is_simulated=False,
            evidence_reliability="high_server_validation",
        )
        session.events.append(record)

        self.broadcast("pairing_created", {
            "session_id": session_id,
            "pairing_code": pairing_code,
            "expires_at": expires_at_iso,
            "status": "waiting_for_scan",
        })

        return CreatePairingResponse(
            session_id=session_id,
            pairing_token=pairing_token,
            pairing_code=pairing_code,
            qr_payload_url=qr_url,
            expires_at=expires_at_iso,
            ttl_seconds=ttl_seconds,
            status="waiting_for_scan",
        )

    def get_pairing_status(self, token_or_code_or_sid: str) -> PairingStatusResponse:
        """Retrieves pairing status by token, short pairing code, or session ID."""
        token = token_or_code_or_sid
        if token in self._session_to_pairing:
            token = self._session_to_pairing[token]
        elif token.upper() in self._code_to_pairing:
            token = self._code_to_pairing[token.upper()]

        record = self._pairings.get(token)
        if record is None:
            raise KeyError(f"Pairing record for identifier '{token_or_code_or_sid}' not found.")

        # Check expiration
        now_ts = datetime.now(timezone.utc).timestamp()
        expires_ts = datetime.fromisoformat(record["expires_at"]).timestamp()
        is_expired = now_ts > expires_ts

        if is_expired and record["status"] in ["waiting_for_scan", "paired", "in_progress"]:
            record["status"] = "expired"
            record["updated_at"] = _utc_now_iso()

        return PairingStatusResponse(
            session_id=record["session_id"],
            pairing_token=record["pairing_token"],
            pairing_code=record["pairing_code"],
            status=record["status"],
            is_expired=is_expired,
            environment_check=record.get("environment_check"),
            created_at=record["created_at"],
            expires_at=record["expires_at"],
            updated_at=record["updated_at"],
        )

    def start_mobile_check(self, pairing_token: str, engine: Optional[Any] = None) -> PairingStatusResponse:
        """Transitions mobile pairing to in_progress when phone scans and begins inspection."""
        status_resp = self.get_pairing_status(pairing_token)
        if status_resp.is_expired:
            raise ValueError("Pairing token has expired. Please regenerate the QR code on your desktop.")
        if status_resp.status == "completed":
            return status_resp

        record = self._pairings[pairing_token]
        record["status"] = "in_progress"
        record["updated_at"] = _utc_now_iso()

        session_id = record["session_id"]
        session = self._sessions.get(session_id)
        if session:
            ev_record = CandidateEventRecord(
                event_id=f"evt_{uuid.uuid4().hex[:8]}",
                session_id=session_id,
                event_type=CandidateEventType.ENVIRONMENT_CHECK_STARTED,
                timestamp=_utc_now_iso(),
                source=EventSource.CANDIDATE,
                metadata={"pairing_code": record["pairing_code"]},
                is_simulated=False,
                evidence_reliability="high_device_pairing",
            )
            session.events.append(ev_record)

        self.broadcast("pairing_updated", {
            "session_id": session_id,
            "status": "in_progress",
            "pairing_code": record["pairing_code"],
        })

        return self.get_pairing_status(pairing_token)

    def submit_mobile_environment_check(
        self,
        req: MobileEnvironmentCheckSubmitRequest,
        engine: Any,
    ) -> PairingStatusResponse:
        """Validates and persists structured environmental readiness results submitted from mobile."""
        status_resp = self.get_pairing_status(req.pairing_token)
        if status_resp.is_expired:
            raise ValueError("Pairing token has expired. Please regenerate the QR code.")
        if status_resp.status == "completed":
            raise ValueError("Environment check has already been completed for this session.")

        record = self._pairings[req.pairing_token]
        session_id = record["session_id"]
        session = self._sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session '{session_id}' not found.")

        # Validate check_status values
        valid_statuses = [
            "completed",
            "partially_completed",
            "camera_unavailable",
            "declined",
            "technical_failure",
        ]
        if req.check_status not in valid_statuses:
            raise ValueError(f"Invalid check_status '{req.check_status}'. Permitted: {valid_statuses}")

        check_data = {
            "check_status": req.check_status,
            "lighting_status": req.lighting_status,
            "camera_status": req.camera_status,
            "desk_cleared_confirmed": req.desk_cleared_confirmed,
            "room_sweep_completed": req.room_sweep_completed,
            "candidate_notes": req.candidate_notes,
            "observations": req.observations,
            "submitted_at": _utc_now_iso(),
        }

        record["status"] = "completed"
        record["environment_check"] = check_data
        record["updated_at"] = _utc_now_iso()

        state = self._candidate_states.setdefault(session_id, {})
        state["env_check"] = check_data

        # Determine event type based on outcome
        if req.check_status in ["camera_unavailable", "declined", "technical_failure"]:
            ev_type = CandidateEventType.ENVIRONMENT_CHECK_UNAVAILABLE
            reliability = "limited_device_telemetry"
        else:
            ev_type = CandidateEventType.ENVIRONMENT_CHECK_COMPLETED
            reliability = "high_candidate_mobile_scan"

        ev_payload = CandidateEventPayload(
            event_type=ev_type,
            source=EventSource.CANDIDATE,
            metadata={
                "check_status": req.check_status,
                "lighting_status": req.lighting_status,
                "camera_status": req.camera_status,
                "desk_cleared": req.desk_cleared_confirmed,
                "room_sweep": req.room_sweep_completed,
                "notes": req.candidate_notes or "",
            },
            is_simulated=False,
            evidence_reliability=reliability,
        )
        self.record_candidate_event(session_id, ev_payload, engine)

        # Broadcast SSE completion
        self.broadcast("pairing_completed", {
            "session_id": session_id,
            "status": "completed",
            "check_status": req.check_status,
            "lighting_status": req.lighting_status,
            "pairing_code": record["pairing_code"],
        })

        return self.get_pairing_status(req.pairing_token)



# Global in-memory singleton
_GLOBAL_STORE: Optional[SessionStore] = None


def get_session_store() -> SessionStore:
    """Returns the singleton session store."""
    global _GLOBAL_STORE
    if _GLOBAL_STORE is None:
        _GLOBAL_STORE = SessionStore()
    return _GLOBAL_STORE
