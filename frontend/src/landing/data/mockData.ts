import type { CandidateSession } from '../types';

export const MOCK_SESSIONS: CandidateSession[] = [
  {
    id: 'SES-2026-IM102-884A',
    candidateName: 'Ananya Sharma',
    candidateInitials: 'AS',
    examTitle: 'Advanced Distributed Systems (CS-402)',
    examDate: 'Oct 29, 2026 · 14:00 - 16:30 UTC',
    connectionType: '4G Cellular',
    integrityRiskScore: 14,
    behaviouralRiskScore: 11,
    environmentalQualityScore: 38, // 38% network stability = severe degradation
    reviewStatus: 'Auto-Cleared',
    flagsCount: 1,
    environmentalIncidents: 4,
    summaryRationale:
      'Video and audio telemetry experienced 4 significant dropouts due to uplink cellular jitter (peak RTT 980ms, 41% packet loss). FairProctor AI decoupled these network faults from integrity calculations. Zero unauthorized software or multi-person vectors observed.',
    timeline: [
      {
        id: 'ev-1',
        timestamp: '14:08:15',
        category: 'client',
        title: 'Exam Window Initialized & Fullscreen Enforced',
        description: 'Single monitor confirmed. WebRTC media streams locked to candidate face mesh.',
        severity: 'info',
        metrics: [
          { label: 'Displays', value: '1 Active' },
          { label: 'Sandbox Mode', value: 'Strict WebRTC' }
        ],
        aiRationale: 'Baseline established with zero external peripherals detected.'
      },
      {
        id: 'ev-2',
        timestamp: '14:22:08',
        category: 'environmental',
        title: 'Video Frame Freeze & UDP Drop (Network Interruption)',
        description: 'Uplink socket dropped 41% packets for 18 seconds. Camera freeze occurred simultaneously with cellular tower handoff.',
        severity: 'medium',
        isSuppressed: true,
        suppressionReason: 'Isolated as Environmental Fault — Packet loss correlates with local round-trip delay spike (980ms). Behavioral score unaffected.',
        metrics: [
          { label: 'Packet Loss', value: '41.4%' },
          { label: 'RTT Latency', value: '980 ms' },
          { label: 'Audio Buffer', value: 'Locally Cached' }
        ],
        aiRationale: 'Conventional proctoring tools would fail this candidate for camera obstruction. FairProctor cross-referenced socket telemetry and confirmed zero user input anomaly during freeze duration.'
      },
      {
        id: 'ev-3',
        timestamp: '14:39:40',
        category: 'environmental',
        title: 'Ambient Lighting Shift (Sunset Dimming)',
        description: 'Face contour luminance dropped below 45 lux. Camera auto-gain adjusted.',
        severity: 'info',
        isSuppressed: true,
        suppressionReason: 'Pre-test baseline indicated ambient lighting transition; posture landmarks remained steady.',
        metrics: [
          { label: 'Face Visibility', value: '96.2%' },
          { label: 'Luminance', value: '38 Lux' }
        ],
        aiRationale: 'Candidate remained centered. Gradual solar transition rather than abrupt lighting cutoff.'
      },
      {
        id: 'ev-4',
        timestamp: '15:10:02',
        category: 'behavioural',
        title: 'Brief Gaze Deviation (Downward Left)',
        description: 'Gaze gaze vector moved downward toward desk surface for 4.2 seconds during rough-sheet calculation.',
        severity: 'low',
        metrics: [
          { label: 'Duration', value: '4.2s' },
          { label: 'Active Task', value: 'Question 14 (Math Proof)' }
        ],
        aiRationale: 'Physical scratchpad permitted in CS-402 protocol. Keystroke idle during calculation.'
      }
    ]
  },
  {
    id: 'SES-2026-IM102-912C',
    candidateName: 'Marcus Chen',
    candidateInitials: 'MC',
    examTitle: 'Advanced Distributed Systems (CS-402)',
    examDate: 'Oct 29, 2026 · 14:00 - 16:30 UTC',
    connectionType: 'Fiber',
    integrityRiskScore: 38,
    behaviouralRiskScore: 41,
    environmentalQualityScore: 98,
    reviewStatus: 'Requires Review',
    flagsCount: 2,
    environmentalIncidents: 0,
    summaryRationale:
      'High-bandwidth stable connection. Two window-blur events detected. Event 1 was an authorized formula reference modal; Event 2 was an unsanctioned browser tab activation lasting 6.8 seconds. Prioritized for contextual instructor evaluation.',
    timeline: [
      {
        id: 'ev-101',
        timestamp: '14:05:00',
        category: 'client',
        title: 'Session Secure Handshake Completed',
        description: 'Biometric face embedding matched pre-test verification with 99.4% confidence.',
        severity: 'info',
        metrics: [
          { label: 'Ping', value: '12 ms' },
          { label: 'Jitter', value: '0.8 ms' }
        ],
        aiRationale: 'Secure cryptographic session token generated. Local tamper verification intact.'
      },
      {
        id: 'ev-102',
        timestamp: '14:35:12',
        category: 'client',
        title: 'Browser Focus Lost (In-Platform Formula Sheet)',
        description: 'Focus switched to exam-embedded reference tab for 3.4 seconds. Authorized by exam configuration.',
        severity: 'info',
        isSuppressed: true,
        suppressionReason: 'DOM target matches permitted resource: "cs402_cheat_sheet_v2.pdf".',
        metrics: [
          { label: 'Blur Time', value: '3.4s' },
          { label: 'Allowed Target', value: 'Exam Appendix' }
        ],
        aiRationale: 'Standard proctors trigger false alarm on blur. FairProctor inspects document target context.'
      },
      {
        id: 'ev-103',
        timestamp: '15:02:44',
        category: 'behavioural',
        title: 'External Tab Focus & Rapid Window Switch',
        description: 'Window blur to unauthorized browser window. Candidate gaze focused on upper right monitor quadrant for 6.8 seconds.',
        severity: 'medium',
        metrics: [
          { label: 'Blur Duration', value: '6.8s' },
          { label: 'Key Events', value: '2 Alt+Tab Sequences' }
        ],
        aiRationale: 'Flagged for human review. Question 18 difficulty level: High. No copy-paste detected; human context required.'
      }
    ]
  },
  {
    id: 'SES-2026-IM102-404B',
    candidateName: 'David K.',
    candidateInitials: 'DK',
    examTitle: 'Advanced Distributed Systems (CS-402)',
    examDate: 'Oct 29, 2026 · 14:00 - 16:30 UTC',
    connectionType: 'Rural Broadband',
    integrityRiskScore: 84,
    behaviouralRiskScore: 88,
    environmentalQualityScore: 82,
    reviewStatus: 'Escalated',
    flagsCount: 3,
    environmentalIncidents: 1,
    summaryRationale:
      'High-severity synchronized clipboard paste detected (480 characters of complex algorithmic code in 0.12 seconds). Cross-candidate correlation matched an identical unusual variable naming structure with Session SES-2026-IM102-409F within 90 seconds.',
    timeline: [
      {
        id: 'ev-201',
        timestamp: '14:02:11',
        category: 'client',
        title: 'Proctor Session Verified',
        description: 'Hardware profile and peripheral audio checks passed with zero anomalies.',
        severity: 'info',
        metrics: [{ label: 'Audio Noise Floor', value: '28 dB' }],
        aiRationale: 'Candidate isolated in room at start.'
      },
      {
        id: 'ev-202',
        timestamp: '14:48:30',
        category: 'keystroke',
        title: 'High-Volume Unformatted Paste Event (480 chars)',
        description: '480 characters inserted in under 120ms without preceding drafting keystrokes.',
        severity: 'high',
        metrics: [
          { label: 'Insertion Speed', value: '4,000 WPM' },
          { label: 'Clipboard Origin', value: 'External Application' },
          { label: 'Draft Time', value: '0s' }
        ],
        aiRationale: 'Physical impossibility of human typing speed. Clipboard source originated outside sandboxed exam web context.'
      },
      {
        id: 'ev-203',
        timestamp: '14:50:04',
        category: 'behavioural',
        title: 'Cross-Candidate Response Cluster Matched',
        description: 'Syntax AST and typo pattern correlates with Session 409F with 94.7% similarity score.',
        severity: 'high',
        metrics: [
          { label: 'Similarity Index', value: '94.7%' },
          { label: 'Cluster Pair', value: 'SES-IM102-409F' }
        ],
        aiRationale: 'Multi-candidate collusion signal. Submitted to faculty honor board for human adjudication with full cryptographic audit trail.'
      }
    ]
  }
];

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Collect Assessment Signals',
    subtitle: 'Zero-Intrusion Multimodal Ingest',
    description:
      'Captures client-side window focus, typing cadence, audio decibel envelopes, and WebRTC video metrics entirely in-memory with local buffering.',
    tags: ['Local Buffer', 'WebRTC Streams', 'DOM Sandbox', 'Zero Raw Video Stored'],
    highlight: 'Privacy by design: video frames are analyzed client-side; raw video never leaves candidate memory unless a severe flag is confirmed.'
  },
  {
    step: '02',
    title: 'Separate Environmental Conditions',
    subtitle: 'Autonomous Network & Hardware Decoupling',
    description:
      'Continuous telemetry tracks packet loss, UDP socket stalls, Wi-Fi jitter, and camera auto-gain transitions. Network faults are permanently tagged as environmental.',
    tags: ['Jitter Compensation', 'Socket Heartbeat', 'ISP RTT Spikes', '4G Failover Awareness'],
    highlight: 'Zero penalty for poor bandwidth: poor connectivity is an infrastructure reality, never grounds for academic dishonor.'
  },
  {
    step: '03',
    title: 'Calculate & Explain Behavioural Risk',
    subtitle: 'Transparent Bayesian Multi-Signal Inference',
    description:
      'Correlates timing, keystrokes, and gaze deviation across question difficulty tiers. Every risk point carries an explainable mathematical formula and human-readable justification.',
    tags: ['Bayesian Prior', 'Cross-Signal Weighting', 'Question Context', 'Audit Graph'],
    highlight: 'No black box: reviewers can trace exactly why a score was calculated and inspect the mathematical weights.'
  },
  {
    step: '04',
    title: 'Prioritize Sessions for Human Review',
    subtitle: 'Ranked Triage Queue (Never Auto-Fail)',
    description:
      'AI scores are strictly advisory triage filters. High-confidence genuine sessions are auto-cleared, while anomalous clusters are presented to human educators in a clear dashboard.',
    tags: ['Human-in-the-Loop', 'Triage Hierarchy', 'Anomaly Clustering', 'False-Positive Guard'],
    highlight: 'The system has no authority to fail a candidate. Only certified faculty and human proctors deliver verdicts.'
  },
  {
    step: '05',
    title: 'Candidate Response & Two-Way Appeal',
    subtitle: 'Radical Transparency & Due Process',
    description:
      'Flagged candidates receive a plain-language summary of flagged timestamps and have a 48-hour window to submit an explanation or local connectivity logs before decisions finalize.',
    tags: ['48-Hour Window', 'Plain-Language Audit', 'Student Agency', 'Cryptographic Proof'],
    highlight: 'Restoring student dignity: candidates are treated as respected scholars, not potential criminals.'
  }
];

export const PRETEST_METRICS = [
  {
    id: 'cam',
    name: 'Camera & Field of View',
    status: 'passed' as const,
    value: '1080p @ 30fps · Face Centered (98% FOV)',
    details: 'Single occupant detected, head pitch 4° within nominal 15° corridor'
  },
  {
    id: 'light',
    name: 'Ambient Lighting & Glare',
    status: 'passed' as const,
    value: '58 Lux · Balanced Key Light',
    details: 'Facial landmark contrast ratio 4.2:1 (exceeds 3.0:1 threshold)'
  },
  {
    id: 'net',
    name: 'Connection Latency & Jitter',
    status: 'warning' as const,
    value: 'RTT 142ms · Jitter 18ms (Cellular 4G)',
    details: 'Degraded uplink baseline recorded. FairProctor adaptive buffering activated.'
  },
  {
    id: 'sandbox',
    name: 'Secure Environment Lock',
    status: 'passed' as const,
    value: 'Single Monitor · WebRTC Protected',
    details: 'Zero unauthorized peripheral display drivers detected'
  }
];
