export type RiskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReviewPriority = RiskPriority;

export type ReviewDecisionType = 
  | 'PENDING_REVIEW'
  | 'NO_CONCERN'
  | 'REQUIRES_INVESTIGATION'
  | 'CONFIRMED_VIOLATION'
  | 'DISMISSED';

export type ReviewerRole = 'reviewer' | 'auditor' | 'lead_proctor';

export type CandidateEventType =
  | 'SESSION_STARTED'
  | 'ANSWER_SUBMITTED'
  | 'TAB_VISIBILITY_CHANGED'
  | 'CAMERA_UNAVAILABLE'
  | 'CAMERA_RESTORED'
  | 'NETWORK_DEGRADED'
  | 'NETWORK_RESTORED'
  | 'ENVIRONMENTAL_OBSERVATION'
  | 'SESSION_SUBMITTED'
  | 'SESSION_COMPLETED'
  | 'QR_PAIRING_CREATED'
  | 'QR_PAIRING_COMPLETED'
  | 'ENVIRONMENT_CHECK_STARTED'
  | 'ENVIRONMENT_CHECK_COMPLETED'
  | 'ENVIRONMENT_CHECK_UNAVAILABLE'
  | 'CAMERA_PERMISSION_GRANTED'
  | 'MICROPHONE_PERMISSION_GRANTED'
  | 'EXAM_FULLSCREEN_ENTERED'
  | 'EXAM_FULLSCREEN_EXITED'
  | 'EXAM_TAB_HIDDEN'
  | 'EXAM_TAB_VISIBLE'
  | 'EXAM_WARNING_ACKNOWLEDGED';

export type EventSource = 'browser' | 'model' | 'simulation' | 'candidate' | 'server';

export type PairingStatus =
  | 'waiting_for_scan'
  | 'paired'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'failed';

export type EnvironmentCheckStatus =
  | 'completed'
  | 'partially_completed'
  | 'camera_unavailable'
  | 'declined'
  | 'technical_failure';

export interface CreatePairingResponse {
  session_id: string;
  pairing_token: string;
  pairing_code: string;
  qr_payload_url: string;
  expires_at: string;
  ttl_seconds: number;
  status: PairingStatus;
}

export interface PairingStatusResponse {
  session_id: string;
  pairing_token: string;
  pairing_code: string;
  status: PairingStatus;
  is_expired: boolean;
  environment_check?: {
    check_status: EnvironmentCheckStatus;
    lighting_status: string;
    camera_status: string;
    desk_cleared_confirmed: boolean;
    room_sweep_completed: boolean;
    candidate_notes?: string;
    observations?: Record<string, any>;
    submitted_at: string;
  } | null;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface MobileEnvironmentCheckSubmitRequest {
  pairing_token: string;
  check_status: EnvironmentCheckStatus;
  lighting_status: 'adequate' | 'low' | 'glare' | 'uncertain';
  camera_status: 'available' | 'unavailable' | 'declined';
  desk_cleared_confirmed: boolean;
  room_sweep_completed: boolean;
  candidate_notes?: string;
  observations?: Record<string, any>;
}

export interface CandidateEventRecord {
  event_id: string;
  session_id: string;
  event_type: CandidateEventType;
  timestamp: string;
  server_timestamp?: string;
  source: EventSource;
  metadata: Record<string, any>;
  is_simulated: boolean;
  evidence_reliability: string;
  explanation?: string;
}

export interface CandidateEventPayload {
  event_type: CandidateEventType;
  source?: EventSource;
  metadata?: Record<string, any>;
  is_simulated?: boolean;
  evidence_reliability?: string;
}

export interface CandidateStartSessionRequest {
  candidate_pseudonym?: string;
  exam_title?: string;
  is_shared_room_declared?: boolean;
  camera_permitted?: boolean;
  notes?: string;
}

export interface CandidateAnswerRequest {
  question_id: number;
  question_text: string;
  selected_option: string;
  time_spent_seconds: number;
}

export interface CandidateSubmitExamRequest {
  answers: Record<string, string>;
  total_time_spent_seconds: number;
}

export interface QuestionItem {
  id: number;
  text: string;
  options: { key: string; label: string }[];
  category: string;
}

export interface EvidenceItem {
  timestamp_or_interval: string;
  source: string;
  observation_type: string;
  observed_value: any;
  relevant_policy: string;
  explanation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  contribution_score: number;
  data_quality_limitations?: string | null;
}

export interface ContributingFactors {
  visual_cv?: number;
  browser_telemetry?: number;
  environmental_reliability?: number;
  answer_similarity?: number;
  [key: string]: number | undefined;
}

export interface ReviewerDecisionRecord {
  session_id: string;
  decision: ReviewDecisionType;
  reviewer_id: string;
  reviewer_role: ReviewerRole;
  notes: string;
  decision_timestamp: string;
}

export interface SessionSummaryItem {
  session_id: string;
  risk_score: number;
  integrity_score: number;
  risk_level: RiskPriority;
  recommended_action: string;
  evidence_count: number;
  environmental_warnings_count: number;
  environmental_warnings: string[];
  missing_data: string[];
  confidence_or_uncertainty: string;
  review_status: ReviewDecisionType;
  decision_record?: ReviewerDecisionRecord | null;
  model_version: string;
  policy_version: string;
  is_demonstration_data: boolean;
  is_live_candidate_session?: boolean;
  candidate_status?: string;
  created_at: string;
}

export interface SessionDetail {
  session_id: string;
  risk_score: number;
  integrity_score: number;
  risk_level: RiskPriority;
  evidence_timeline: EvidenceItem[];
  contributing_factors: ContributingFactors;
  environmental_warnings: string[];
  missing_data: string[];
  confidence_or_uncertainty: string;
  recommended_action: string;
  model_version: string;
  policy_version: string;
  summary_explanation: string;
  review_status: ReviewDecisionType;
  decision_record?: ReviewerDecisionRecord | null;
  is_demonstration_data: boolean;
  is_live_candidate_session?: boolean;
  candidate_status?: string;
  events?: CandidateEventRecord[];
  answers_count?: number;
  created_at: string;
}

export interface OverviewStats {
  total_sessions: number;
  awaiting_review: number;
  priority_review: number;
  insufficient_evidence: number;
  environmental_warnings_count: number;
  model_version: string;
  policy_version: string;
  backend_health: string;
  is_demonstration_data: boolean;
}

export interface ReviewerDecisionRequest {
  reviewer_id: string;
  reviewer_role: ReviewerRole;
  decision: ReviewDecisionType;
  notes: string;
}

export interface SystemHealthStatus {
  status: string;
  service: string;
  engine_version: string;
  visual_model_loaded: boolean;
  behavioral_model_loaded: boolean;
}
