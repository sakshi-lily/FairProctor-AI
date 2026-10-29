import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

export const reviewerRouter = Router();

// Enforce Reviewer or Admin authentication on all reviewer routes
reviewerRouter.use(authenticateToken);
reviewerRouter.use(requireRole('reviewer', 'admin'));

// Mock queue data representing server-side proctoring engine sessions
const mockSessions = [
  {
    id: 'SES-884A',
    candidateName: 'Elena Rostova',
    candidateInitials: 'ER',
    examTitle: 'Advanced Distributed Systems (CS-401)',
    examDate: 'Oct 29, 2026',
    connectionType: '4G Cellular',
    integrityRiskScore: 14,
    behaviouralRiskScore: 18,
    environmentalQualityScore: 28,
    reviewStatus: 'Auto-Cleared',
    flagsCount: 1,
    environmentalIncidents: 3,
    summaryRationale:
      'Isolated frame drops correlate with 4G cellular tower handover (34% packet drop). Gaze cadence was maintained; keystroke frequency remained stable during disconnection window.',
  },
  {
    id: 'SES-912C',
    candidateName: 'Marcus Vance',
    candidateInitials: 'MV',
    examTitle: 'Distributed Systems (CS-401)',
    examDate: 'Oct 29, 2026',
    connectionType: 'Rural Broadband',
    integrityRiskScore: 42,
    behaviouralRiskScore: 48,
    environmentalQualityScore: 36,
    reviewStatus: 'Requires Review',
    flagsCount: 3,
    environmentalIncidents: 2,
    summaryRationale:
      'Candidate experienced intermittent video freeze during Question 14. Keystroke telemetry showed continuous typing without browser DOM focus loss.',
  },
  {
    id: 'SES-404B',
    candidateName: 'Aisha Patel',
    candidateInitials: 'AP',
    examTitle: 'Distributed Systems (CS-401)',
    examDate: 'Oct 29, 2026',
    connectionType: 'Fiber',
    integrityRiskScore: 8,
    behaviouralRiskScore: 9,
    environmentalQualityScore: 96,
    reviewStatus: 'Auto-Cleared',
    flagsCount: 0,
    environmentalIncidents: 0,
    summaryRationale:
      'Optimal fiber connectivity with pristine video fidelity. All metrics verified within normal operational distribution bounds.',
  },
];

// -----------------------------------------------------------------------------
// GET /api/reviewer/sessions - Retrieve Reviewer Triage Queue
// -----------------------------------------------------------------------------
reviewerRouter.get('/sessions', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    totalSessions: mockSessions.length,
    sessions: mockSessions,
    reviewer: {
      id: req.user!._id.toString(),
      name: req.user!.name,
      role: req.user!.role,
    },
  });
});

// -----------------------------------------------------------------------------
// GET /api/reviewer/sessions/:id - Retrieve Session Detail & Evidence Tree
// -----------------------------------------------------------------------------
reviewerRouter.get('/sessions/:id', (req: AuthenticatedRequest, res: Response): void => {
  const session = mockSessions.find((s) => s.id === req.params.id);
  if (!session) {
    res.status(404).json({
      success: false,
      message: `Session '${req.params.id}' not found.`,
    });
    return;
  }

  res.json({
    success: true,
    session,
    evidenceTimeline: [
      {
        id: 'EV-01',
        timestamp: '14:22:04 UTC',
        category: 'environmental',
        title: 'Cellular Handover Packet Drop',
        description: 'Network uplink throttled to 28kbps for 4.2 seconds during cell mast switch.',
        severity: 'low',
        aiRationale: 'Classified as benign environmental interference; candidate typing cadence persisted uninterrupted.',
      },
      {
        id: 'EV-02',
        timestamp: '14:38:19 UTC',
        category: 'client',
        title: 'DOM Blur Event (Operating System Prompt)',
        description: 'Browser lost focus for 1.8s due to background OS software update dialog.',
        severity: 'medium',
        aiRationale: 'Clipboard entropy remained constant (0 characters copied). No suspicious secondary window opened.',
      },
    ],
  });
});

// -----------------------------------------------------------------------------
// POST /api/reviewer/verdict - Submit Reviewer Triage Determination
// -----------------------------------------------------------------------------
reviewerRouter.post('/verdict', (req: AuthenticatedRequest, res: Response): void => {
  const { sessionId, decision, justificationNotes } = req.body;

  const validDecisions = ['NO_CONCERN', 'REQUIRES_INVESTIGATION', 'CONFIRMED_VIOLATION'];
  if (!validDecisions.includes(decision)) {
    res.status(400).json({
      success: false,
      message: `Invalid decision. Must be one of: ${validDecisions.join(', ')}`,
    });
    return;
  }

  logAuditEvent({
    eventType: 'SESSION_REFRESHED',
    userId: req.user!._id.toString(),
    email: req.user!.email,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] as string,
    details: `Reviewer verdict recorded: Session ${sessionId || 'SES-CURRENT'} marked as '${decision}'. Notes: ${justificationNotes || 'None'}`,
  });

  res.json({
    success: true,
    message: `Review determination '${decision}' recorded and sealed in immutable audit trail.`,
    verdictId: `VER-${Date.now().toString().slice(-6)}`,
    recordedBy: req.user!.name,
    timestamp: new Date().toISOString(),
  });
});
