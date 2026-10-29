import { OverviewStats, SessionDetail, SessionSummaryItem } from '../types/proctoring';

export const FALLBACK_OVERVIEW_STATS: OverviewStats = {
  total_sessions: 7,
  awaiting_review: 5,
  priority_review: 2,
  insufficient_evidence: 1,
  environmental_warnings_count: 5,
  model_version: '2.0.0',
  policy_version: '1.0.0',
  backend_health: 'offline',
  is_demonstration_data: true,
};

export const FALLBACK_SESSIONS: SessionDetail[] = [
  {
    session_id: 'sess_shared_room_01',
    risk_score: 12.0,
    integrity_score: 88.0,
    risk_level: 'LOW',
    evidence_timeline: [
      {
        timestamp_or_interval: 't=120s - 128s',
        source: 'environmental_conditions',
        observation_type: 'shared_space_detection',
        observed_value: { secondary_person_detected: true, sustained_conversation: false },
        relevant_policy: 'IM-102: Proctoring That Does Not Punish a Shared Room',
        explanation: 'Secondary person walked through background. Candidate maintained forward screen attention without auditory collusion.',
        severity: 'LOW',
        contribution_score: 0.0,
        data_quality_limitations: 'Single webcam sensor without depth map.'
      }
    ],
    contributing_factors: { visual_cv: 0.05, browser_telemetry: 0.0, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [
      'Shared room observation: Secondary person in background (IM-102 policy applied: 0 penalty assigned)'
    ],
    missing_data: [],
    confidence_or_uncertainty: 'Moderate confidence (0.86). Background movement did not interrupt test-taker interaction.',
    recommended_action: 'NO_ACTION',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Candidate worked in shared living quarters. Passive background individual detected; zero penalty assessed.',
    review_status: 'PENDING_REVIEW',
    is_demonstration_data: true,
    created_at: '2026-10-29T09:15:00Z'
  },
  {
    session_id: 'sess_phone_det_02',
    risk_score: 78.5,
    integrity_score: 21.5,
    risk_level: 'HIGH',
    evidence_timeline: [
      {
        timestamp_or_interval: 't=315s - 345s',
        source: 'video_cv',
        observation_type: 'secondary_device_detected',
        observed_value: { device_type: 'mobile_phone', consecutive_frames: 24 },
        relevant_policy: 'Standard Exam Security Policy: Unauthorized Electronic Devices',
        explanation: 'Visual model v2.0.0 confirmed handheld phone in candidate primary visual field over 24 consecutive frames.',
        severity: 'HIGH',
        contribution_score: 0.62,
        data_quality_limitations: 'Candidate hand partially occludes bottom edge of screen.'
      },
      {
        timestamp_or_interval: 't=320s',
        source: 'browser_telemetry',
        observation_type: 'window_blur',
        observed_value: { blur_duration_sec: 4.2 },
        relevant_policy: 'Standard Exam Security Policy: Continuous Browser Focus',
        explanation: 'DOM window focus lost concurrently with secondary device appearance.',
        severity: 'MEDIUM',
        contribution_score: 0.15,
        data_quality_limitations: null
      }
    ],
    contributing_factors: { visual_cv: 0.62, browser_telemetry: 0.15, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [],
    missing_data: [],
    confidence_or_uncertainty: 'High confidence (0.94). Clear object boundary and temporal stability across video frames.',
    recommended_action: 'PRIORITY_HUMAN_REVIEW',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Sustained mobile phone detection accompanied by browser focus loss. Manual verification of frames 315-345 strongly advised.',
    review_status: 'PENDING_REVIEW',
    is_demonstration_data: true,
    created_at: '2026-10-29T10:02:15Z'
  },
  {
    session_id: 'sess_tab_switching_03',
    risk_score: 56.0,
    integrity_score: 44.0,
    risk_level: 'MEDIUM',
    evidence_timeline: [
      {
        timestamp_or_interval: 't=640s - 780s',
        source: 'browser_telemetry',
        observation_type: 'excessive_tab_switching',
        observed_value: { blur_events: 14, paste_events: 4 },
        relevant_policy: 'Standard Exam Security Policy: Browser Navigation',
        explanation: 'Candidate exited examination tab 14 times during coding questions 8-12 with external clipboard paste operations.',
        severity: 'MEDIUM',
        contribution_score: 0.56,
        data_quality_limitations: null
      }
    ],
    contributing_factors: { visual_cv: 0.04, browser_telemetry: 0.52, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [],
    missing_data: [],
    confidence_or_uncertainty: 'High confidence (0.91). DOM telemetry events recorded client-side with cryptographic sequence IDs.',
    recommended_action: 'SPOT_CHECK',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Excessive loss of DOM focus during problem solving. Reviewer should inspect copied text snippets.',
    review_status: 'PENDING_REVIEW',
    is_demonstration_data: true,
    created_at: '2026-10-29T11:20:45Z'
  },
  {
    session_id: 'sess_poor_lighting_04',
    risk_score: 8.0,
    integrity_score: 92.0,
    risk_level: 'LOW',
    evidence_timeline: [],
    contributing_factors: { visual_cv: 0.02, browser_telemetry: 0.0, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [
      'Adverse ambient illumination (<0.18 lux index)',
      'Missing browser telemetry stream',
      'Network packet loss (>12%)'
    ],
    missing_data: ['browser_telemetry'],
    confidence_or_uncertainty: 'Low confidence (0.38) due to dim environment and partial sensor outage. Insufficient evidence to evaluate integrity.',
    recommended_action: 'NO_ACTION',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Environmental degradation (poor lighting and missing telemetry). Safeguard IM-102 prohibits penalty for infrastructure deficiency.',
    review_status: 'REQUIRES_INVESTIGATION',
    is_demonstration_data: true,
    created_at: '2026-10-29T12:05:10Z'
  },
  {
    session_id: 'sess_normal_clean_05',
    risk_score: 3.2,
    integrity_score: 96.8,
    risk_level: 'LOW',
    evidence_timeline: [],
    contributing_factors: { visual_cv: 0.02, browser_telemetry: 0.01, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [],
    missing_data: [],
    confidence_or_uncertainty: 'High confidence (0.97). All video frames and telemetry packets received with nominal variance.',
    recommended_action: 'NO_ACTION',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Exam completed within all security tolerances. No anomalous visual, acoustic, or telemetry signatures.',
    review_status: 'NO_CONCERN',
    is_demonstration_data: true,
    created_at: '2026-10-29T12:45:00Z',
    decision_record: {
      session_id: 'sess_normal_clean_05',
      decision: 'NO_CONCERN',
      reviewer_id: 'rev_auditor_01',
      reviewer_role: 'lead_proctor',
      notes: 'Baseline audit passed. Zero anomalous posture or telemetry signals.',
      decision_timestamp: '2026-10-29T13:00:00Z'
    }
  },
  {
    session_id: 'sess_scratchpad_06',
    risk_score: 18.5,
    integrity_score: 81.5,
    risk_level: 'LOW',
    evidence_timeline: [
      {
        timestamp_or_interval: 't=450s - 510s',
        source: 'video_cv',
        observation_type: 'downward_gaze_posture',
        observed_value: { pitch_degrees: -24.5, yaw_degrees: 2.1 },
        relevant_policy: 'Standard Exam Security Policy: Physical Scratchpad Policy',
        explanation: 'Candidate looked down at workspace to perform physical paper calculations. Head pose invariant check confirmed zero lateral diversion.',
        severity: 'LOW',
        contribution_score: 0.12,
        data_quality_limitations: 'Downward tilt limits iris-to-sclera gaze ratio visibility.'
      }
    ],
    contributing_factors: { visual_cv: 0.12, browser_telemetry: 0.02, environmental_reliability: 0.0, answer_similarity: 0.0 },
    environmental_warnings: [
      'Frequent downward gaze angles consistent with physical scratchpad usage'
    ],
    missing_data: [],
    confidence_or_uncertainty: 'High confidence (0.90). Invariant head pose classifier verified workspace posture.',
    recommended_action: 'NO_ACTION',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Downward gaze during calculus calculation questions. Consistent with allowed scratchpad usage.',
    review_status: 'PENDING_REVIEW',
    is_demonstration_data: true,
    created_at: '2026-10-29T13:10:30Z'
  },
  {
    session_id: 'sess_collusion_pair_07',
    risk_score: 71.0,
    integrity_score: 29.0,
    risk_level: 'HIGH',
    evidence_timeline: [
      {
        timestamp_or_interval: 't=1800s (Submission)',
        source: 'answer_similarity',
        observation_type: 'cohort_pairwise_similarity',
        observed_value: { similarity_coefficient: 0.93, peer_session_ref: 'sess_pair_peer_08' },
        relevant_policy: 'Standard Exam Security Policy: Independent Work Guarantee',
        explanation: 'Cross-candidate statistical engine detected identical typo patterns and syntax structure on free-text questions 3 and 7.',
        severity: 'HIGH',
        contribution_score: 0.68,
        data_quality_limitations: 'Statistical answer similarity only indicates probability of collusion; requires manual inspection of source submissions.'
      }
    ],
    contributing_factors: { visual_cv: 0.03, browser_telemetry: 0.0, environmental_reliability: 0.0, answer_similarity: 0.68 },
    environmental_warnings: [],
    missing_data: [],
    confidence_or_uncertainty: 'High statistical confidence (0.92). Probability of incidental text collision is < 0.001.',
    recommended_action: 'PRIORITY_HUMAN_REVIEW',
    model_version: '2.0.0',
    policy_version: '1.0.0',
    summary_explanation: 'Extreme answer text and structure similarity with peer candidate. Manual comparison of both test submissions required.',
    review_status: 'PENDING_REVIEW',
    is_demonstration_data: true,
    created_at: '2026-10-29T14:00:00Z'
  }
];

export function toSummaryItems(details: SessionDetail[]): SessionSummaryItem[] {
  return details.map(d => ({
    session_id: d.session_id,
    risk_score: d.risk_score,
    integrity_score: d.integrity_score,
    risk_level: d.risk_level,
    recommended_action: d.recommended_action,
    evidence_count: d.evidence_timeline.length,
    environmental_warnings_count: d.environmental_warnings.length,
    environmental_warnings: d.environmental_warnings,
    missing_data: d.missing_data,
    confidence_or_uncertainty: d.confidence_or_uncertainty,
    review_status: d.review_status,
    decision_record: d.decision_record,
    model_version: d.model_version,
    policy_version: d.policy_version,
    is_demonstration_data: d.is_demonstration_data,
    created_at: d.created_at,
  }));
}
