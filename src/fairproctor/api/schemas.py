"""Pydantic schemas for FairProctor-AI API requests and responses."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class VisualFrameInput(BaseModel):
    """Visual detection inputs for a single video frame."""
    timestamp_sec: float = 0.0
    face_present: int = Field(default=1, ge=0, le=1)
    no_of_face: int = Field(default=1, ge=0)
    face_conf: float = Field(default=85.0, ge=0.0, le=100.0)
    phone_present: int = Field(default=0, ge=0, le=1)
    phone_conf: float = Field(default=0.0, ge=0.0, le=1.0)
    head_pose: str = Field(default="forward")
    head_pitch: float = 0.0
    head_yaw: float = 0.0
    head_roll: float = 0.0
    gaze_on_script: int = Field(default=1, ge=0, le=1)
    gaze_direction: str = Field(default="center")


class BrowserEventsInput(BaseModel):
    """Browser interaction and telemetry inputs."""
    total_tab_switches: int = Field(default=0, ge=0)
    paste_count: int = Field(default=0, ge=0)
    rapid_answer_count: int = Field(default=0, ge=0)
    mean_response_time_sec: float = Field(default=30.0, ge=0.0)


class EnvironmentalConditionsInput(BaseModel):
    """Environmental capture conditions."""
    fps: float = Field(default=0.2, ge=0.01)
    network_interruptions: int = Field(default=0, ge=0)
    lighting_conf: Optional[float] = None


class ExamPolicyInput(BaseModel):
    """Exam policy configuration overrides."""
    exam_id: str = "default_exam"
    policy_version: str = "1.0.0"
    allow_copy_paste: bool = False
    allow_tab_switch: bool = False
    max_tolerated_tab_switches: int = 1
    max_tolerated_absence_seconds: float = 30.0
    shared_room_candidate: bool = True
    low_bandwidth_candidate: bool = True
    risk_threshold_low: float = 25.0
    risk_threshold_medium: float = 55.0


class ScoreSessionRequest(BaseModel):
    """Request payload for assessing an examination session."""
    session_id: str = Field(..., min_length=1, description="Unique examination session identifier")
    session_metadata: Dict[str, Any] = Field(default_factory=dict)
    video_observations: Optional[List[VisualFrameInput]] = None
    browser_events: Optional[BrowserEventsInput] = None
    environmental_conditions: Optional[EnvironmentalConditionsInput] = None
    similarity_findings: Optional[Dict[str, Any]] = None
    policy: Optional[ExamPolicyInput] = None


class EvidenceItemSchema(BaseModel):
    """Evidence item payload in response."""
    timestamp_or_interval: str
    source: str
    observation_type: str
    observed_value: Any
    relevant_policy: str
    explanation: str
    severity: str
    contribution_score: float
    data_quality_limitations: Optional[str] = None
    captured_frame: Optional[str] = None


class ScoreSessionResponse(BaseModel):
    """Response payload returned by FairProctor-AI engine."""
    session_id: str
    risk_score: float = Field(..., description="Review priority ranking score (0-100); NOT an empirical probability")
    integrity_score: float = Field(..., description="Calculated as 100 - risk_score")
    risk_level: str = Field(..., description="Review priority category: LOW, MEDIUM, HIGH")
    evidence_timeline: List[EvidenceItemSchema]
    contributing_factors: Dict[str, float]
    environmental_warnings: List[str]
    missing_data: List[str]
    confidence_or_uncertainty: str
    recommended_action: str = Field(..., description="Actionable guidance: NO_ACTION, SPOT_CHECK, PRIORITY_HUMAN_REVIEW")
    model_version: str = Field(..., description="Active visual model version (e.g. 2.0.0)")
    policy_version: str = Field(default="1.0.0", description="Active proctoring policy version")
    summary_explanation: str


class ReviewPriority(str, Enum):
    """Review priority levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ReviewDecisionType(str, Enum):
    """Standard human reviewer decision outcomes."""
    PENDING_REVIEW = "PENDING_REVIEW"
    NO_CONCERN = "NO_CONCERN"
    REQUIRES_INVESTIGATION = "REQUIRES_INVESTIGATION"
    CONFIRMED_VIOLATION = "CONFIRMED_VIOLATION"
    DISMISSED = "DISMISSED"


class ReviewerRole(str, Enum):
    """Role-based authorization for review workflows."""
    REVIEWER = "reviewer"
    AUDITOR = "auditor"
    LEAD_PROCTOR = "lead_proctor"


class ReviewerDecisionRequest(BaseModel):
    """Payload to record human reviewer judgment."""
    decision: ReviewDecisionType
    reviewer_id: str = Field(..., min_length=1, description="Pseudonymous reviewer ID (e.g. rev_409)")
    reviewer_role: ReviewerRole = Field(default=ReviewerRole.REVIEWER, description="Role of the reviewer")
    notes: str = Field(default="", description="Detailed reviewer notes justifying the determination")


class ReviewerDecisionRecord(BaseModel):
    """Persisted record of a human reviewer determination."""
    session_id: str
    decision: ReviewDecisionType
    reviewer_id: str
    reviewer_role: ReviewerRole
    notes: str
    decision_timestamp: str


class CandidateEventType(str, Enum):
    """Lifecycle and telemetry events recorded during examination sessions."""
    SESSION_STARTED = "SESSION_STARTED"
    ANSWER_SUBMITTED = "ANSWER_SUBMITTED"
    TAB_VISIBILITY_CHANGED = "TAB_VISIBILITY_CHANGED"
    CAMERA_UNAVAILABLE = "CAMERA_UNAVAILABLE"
    CAMERA_RESTORED = "CAMERA_RESTORED"
    NETWORK_DEGRADED = "NETWORK_DEGRADED"
    NETWORK_RESTORED = "NETWORK_RESTORED"
    ENVIRONMENTAL_OBSERVATION = "ENVIRONMENTAL_OBSERVATION"
    SESSION_SUBMITTED = "SESSION_SUBMITTED"
    SESSION_COMPLETED = "SESSION_COMPLETED"
    # QR Pairing & Mobile Environment Check
    QR_PAIRING_CREATED = "QR_PAIRING_CREATED"
    QR_PAIRING_COMPLETED = "QR_PAIRING_COMPLETED"
    ENVIRONMENT_CHECK_STARTED = "ENVIRONMENT_CHECK_STARTED"
    ENVIRONMENT_CHECK_COMPLETED = "ENVIRONMENT_CHECK_COMPLETED"
    ENVIRONMENT_CHECK_UNAVAILABLE = "ENVIRONMENT_CHECK_UNAVAILABLE"
    # Permissions & Restricted Exam Lockdown
    CAMERA_PERMISSION_GRANTED = "CAMERA_PERMISSION_GRANTED"
    MICROPHONE_PERMISSION_GRANTED = "MICROPHONE_PERMISSION_GRANTED"
    EXAM_FULLSCREEN_ENTERED = "EXAM_FULLSCREEN_ENTERED"
    EXAM_FULLSCREEN_EXITED = "EXAM_FULLSCREEN_EXITED"
    EXAM_TAB_HIDDEN = "EXAM_TAB_HIDDEN"
    EXAM_TAB_VISIBLE = "EXAM_TAB_VISIBLE"
    EXAM_WARNING_ACKNOWLEDGED = "EXAM_WARNING_ACKNOWLEDGED"
    POLICY_VIOLATION_RECORDED = "POLICY_VIOLATION_RECORDED"


class EventSource(str, Enum):
    """Source domain generating or observing an event."""
    BROWSER = "browser"
    MODEL = "model"
    SIMULATION = "simulation"
    CANDIDATE = "candidate"
    SERVER = "server"


class PairingStatus(str, Enum):
    """Lifecycle state of a QR mobile environment check pairing token."""
    WAITING_FOR_SCAN = "waiting_for_scan"
    PAIRED = "paired"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXPIRED = "expired"
    FAILED = "failed"


class CreatePairingRequest(BaseModel):
    """Optional configuration for generating pairing QR URL."""
    frontend_origin: Optional[str] = None


class CreatePairingResponse(BaseModel):
    """Cryptographically secure, short-lived mobile check pairing token."""
    session_id: str
    pairing_token: str
    pairing_code: str
    qr_payload_url: str
    expires_at: str
    ttl_seconds: int = 300
    status: str = "waiting_for_scan"


class PairingStatusResponse(BaseModel):
    """Current verification and completion status of mobile pairing."""
    session_id: str
    pairing_token: str
    pairing_code: str
    status: str
    is_expired: bool
    environment_check: Optional[Dict[str, Any]] = None
    created_at: str
    expires_at: str
    updated_at: str


class MobileEnvironmentCheckSubmitRequest(BaseModel):
    """Structured mobile environment verification results submitted from phone."""
    pairing_token: str
    check_status: str = "completed"  # completed, partially_completed, camera_unavailable, declined, technical_failure
    lighting_status: str = "adequate"  # adequate, low, glare, uncertain
    camera_status: str = "available"  # available, unavailable, declined
    desk_cleared_confirmed: bool = True
    room_sweep_completed: bool = True
    candidate_notes: Optional[str] = None
    captured_sides: Optional[Dict[str, str]] = None  # 4-side photos: desk_front, room_left, room_right, room_back
    observations: Dict[str, Any] = Field(default_factory=dict)


class CandidateEventPayload(BaseModel):
    """Client-submitted request payload to record a live session event."""
    event_type: CandidateEventType
    source: EventSource = EventSource.BROWSER
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_simulated: bool = False
    evidence_reliability: Optional[str] = None


class CandidateEventRecord(BaseModel):
    """Server-validated, immutable event record with generated ID and timestamp."""
    event_id: str
    session_id: str
    event_type: CandidateEventType
    timestamp: str  # Server-generated UTC ISO
    source: EventSource
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_simulated: bool = False
    evidence_reliability: str = "high"


class CandidateStartSessionRequest(BaseModel):
    """Request to initiate a live mock examination session."""
    candidate_pseudonym: Optional[str] = None
    exam_title: str = "Algorithms & Data Structures Integrity Assessment"
    is_shared_room_declared: bool = True
    camera_permitted: bool = False
    notes: Optional[str] = None


class CandidateAnswerRequest(BaseModel):
    """Submission of a single multiple-choice question answer."""
    question_id: int
    question_text: str
    selected_option: str
    time_spent_seconds: float


class CandidateSubmitExamRequest(BaseModel):
    """Final candidate submission payload."""
    answers: Dict[str, str] = Field(default_factory=dict)
    total_time_spent_seconds: float = 0.0


class SessionSummaryItem(BaseModel):
    """Summary record for review queue table."""
    session_id: str
    risk_score: float
    integrity_score: float
    risk_level: str
    recommended_action: str
    evidence_count: int
    environmental_warnings_count: int
    environmental_warnings: List[str]
    missing_data: List[str]
    confidence_or_uncertainty: str
    review_status: ReviewDecisionType
    decision_record: Optional[ReviewerDecisionRecord] = None
    model_version: str
    policy_version: str
    is_demonstration_data: bool = False
    is_live_candidate_session: bool = False
    candidate_status: str = "COMPLETED"
    created_at: str


class SessionDetailResponse(ScoreSessionResponse):
    """Detailed session evaluation with review status, decision history, and live event log."""
    review_status: ReviewDecisionType = ReviewDecisionType.PENDING_REVIEW
    decision_record: Optional[ReviewerDecisionRecord] = None
    is_demonstration_data: bool = False
    is_live_candidate_session: bool = False
    candidate_status: str = "COMPLETED"
    events: List[CandidateEventRecord] = Field(default_factory=list)
    captured_frames: List[Dict[str, Any]] = Field(default_factory=list)
    environment_check: Optional[Dict[str, Any]] = None
    captured_sides: Optional[Dict[str, str]] = None
    answers_count: int = 0
    created_at: str


class SessionListResponse(BaseModel):
    """Paginated or filtered session list response."""
    total: int
    sessions: List[SessionSummaryItem]


class OverviewStatsResponse(BaseModel):
    """Dashboard overview summary metrics."""
    total_sessions: int
    awaiting_review: int
    priority_review: int
    insufficient_evidence: int
    environmental_warnings_count: int
    model_version: str
    policy_version: str
    backend_health: str
    is_demonstration_data: bool = True



