import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../services/auditService.js';

export const candidateRouter = Router();

// All candidate routes require authentication
candidateRouter.use(authenticateToken);

// -----------------------------------------------------------------------------
// GET /api/candidate/overview - Active examination and readiness status
// -----------------------------------------------------------------------------
candidateRouter.get('/overview', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    candidate: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    activeExam: {
      id: 'EXAM-CS401-2026',
      title: 'CS-401 Advanced Distributed Systems Final',
      durationMinutes: 120,
      scheduledStart: new Date(Date.now() + 3600000).toISOString(),
      proctoringMode: 'Connectivity-Decoupled AI Proctoring',
      preTestRequired: true,
      preTestStatus: 'Pending Verification',
      allowedWindowMinutes: 30,
    },
    systemRequirements: [
      { id: 'cam', name: 'Webcam FOV & Head Pose Alignment', status: 'ready', details: 'WebRTC stream active, single face detected' },
      { id: 'mic', name: 'Ambient Audio & Lux Normalization', status: 'ready', details: 'Background noise < 42dB, lighting adequate' },
      { id: 'net', name: 'Bandwidth & Jitter Tolerance Buffer', status: 'ready', details: 'Decoupled buffer: 4G cellular & rural broadband supported' },
      { id: 'sandbox', name: 'Secure Browser Sandbox & Focus Telemetry', status: 'ready', details: 'DOM focus lock active, clipboard entropy monitor engaged' },
    ],
    dueProcessCharter: {
      appealsAllowed: true,
      retentionPolicy: 'RAM vectors expunged post-session. Zero permanent biometric storage.',
      rebuttalWindowHours: 48,
    },
  });
});

// -----------------------------------------------------------------------------
// POST /api/candidate/pretest-submit - Record Candidate Diagnostic Results
// -----------------------------------------------------------------------------
candidateRouter.post('/pretest-submit', (req: AuthenticatedRequest, res: Response): void => {
  const { metrics, browserInfo } = req.body;

  if (!metrics || !Array.isArray(metrics)) {
    res.status(400).json({
      success: false,
      message: 'Invalid diagnostics payload. Array of verified metrics expected.',
    });
    return;
  }

  logAuditEvent({
    eventType: 'SESSION_REFRESHED',
    userId: req.user!._id.toString(),
    email: req.user!.email,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] as string,
    details: `Pre-test diagnostics submitted: ${metrics.length} checks completed.`,
  });

  res.json({
    success: true,
    message: 'Pre-test hardware & environmental telemetry verified successfully.',
    readinessScore: 100,
    timestamp: new Date().toISOString(),
    browserInfo,
  });
});

// -----------------------------------------------------------------------------
// POST /api/candidate/appeal-submit - Submit Student Rebuttal & Statement
// -----------------------------------------------------------------------------
candidateRouter.post('/appeal-submit', (req: AuthenticatedRequest, res: Response): void => {
  const { sessionId, explanation, attachTelemetry } = req.body;

  if (!explanation || typeof explanation !== 'string' || explanation.trim().length < 10) {
    res.status(400).json({
      success: false,
      message: 'Please provide a clear written statement explaining the circumstances (min 10 characters).',
    });
    return;
  }

  logAuditEvent({
    eventType: 'SESSION_REFRESHED',
    userId: req.user!._id.toString(),
    email: req.user!.email,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] as string,
    details: `Appeal statement submitted for session ${sessionId || 'SES-CURRENT'} (Telemetry attached: ${Boolean(attachTelemetry)}).`,
  });

  res.json({
    success: true,
    message: 'Your statement and diagnostic logs have been submitted to the integrity review board for due process examination.',
    appealId: `APP-${Date.now().toString().slice(-6)}`,
    submittedAt: new Date().toISOString(),
    guaranteedReviewWindowHours: 48,
  });
});
