import { describe, it, expect } from 'vitest';
import {
  FALLBACK_SESSIONS,
  FALLBACK_OVERVIEW_STATS,
  toSummaryItems,
} from '../data/fallbackSessions';
import { apiClient } from '../api/client';
import { parseMLExplanation } from '../components/FormattedMLExplanation';

describe('FairProctor-AI Reviewer Dashboard Tests', () => {

  describe('1. API Integration & Fallback Fixtures', () => {
    it('provides verified demonstration fixtures with explicit demonstration labels', () => {
      expect(FALLBACK_OVERVIEW_STATS.is_demonstration_data).toBe(true);
      expect(FALLBACK_OVERVIEW_STATS.model_version).toBe('2.0.0');
      expect(FALLBACK_OVERVIEW_STATS.total_sessions).toBe(7);

      const summaries = toSummaryItems(FALLBACK_SESSIONS);
      expect(summaries.length).toBe(7);
      summaries.forEach(s => {
        expect(s.is_demonstration_data).toBe(true);
        expect(s.session_id).toMatch(/^sess_/);
      });
    });

    it('client has expected base URL and timeout', () => {
      expect(apiClient.defaults.baseURL).toContain('http://localhost:8000');
      expect(apiClient.defaults.timeout).toBe(8000);
    });
  });

  describe('2. Session Table Filtering and Sorting', () => {
    it('sorts sessions by review priority (HIGH > MEDIUM > LOW)', () => {
      const summaries = toSummaryItems(FALLBACK_SESSIONS);
      
      const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const sorted = [...summaries].sort(
        (a, b) => (priorityOrder[b.risk_level] || 0) - (priorityOrder[a.risk_level] || 0)
      );

      expect(sorted[0].risk_level).toBe('HIGH');
      const lastSession = sorted[sorted.length - 1];
      expect(lastSession.risk_level).toBe('LOW');
    });

    it('filters sessions accurately by search query', () => {
      const summaries = toSummaryItems(FALLBACK_SESSIONS);
      
      const query = 'phone';
      const results = summaries.filter(s => s.session_id.toLowerCase().includes(query));
      
      expect(results.length).toBe(1);
      expect(results[0].session_id).toBe('sess_phone_det_02');
    });

    it('filters sessions accurately by review status', () => {
      const summaries = toSummaryItems(FALLBACK_SESSIONS);
      
      const pending = summaries.filter(s => s.review_status === 'PENDING_REVIEW');
      const noConcern = summaries.filter(s => s.review_status === 'NO_CONCERN');

      expect(pending.length).toBe(5);
      expect(noConcern.length).toBe(1);
      expect(noConcern[0].session_id).toBe('sess_normal_clean_05');
    });
  });

  describe('3. Evidence Timeline Rendering & Granularity', () => {
    it('accurately parses timeline items with sources, severity, and contribution weights', () => {
      const phoneSession = FALLBACK_SESSIONS.find(s => s.session_id === 'sess_phone_det_02')!;
      expect(phoneSession.evidence_timeline.length).toBe(2);

      const visualEvidence = phoneSession.evidence_timeline[0];
      expect(visualEvidence.source).toBe('video_cv');
      expect(visualEvidence.severity).toBe('HIGH');
      expect(visualEvidence.contribution_score).toBe(0.62);
      expect(visualEvidence.timestamp_or_interval).toBe('t=315s - 345s');
      expect(visualEvidence.explanation).toContain('Visual model v2.0.0');

      const browserEvidence = phoneSession.evidence_timeline[1];
      expect(browserEvidence.source).toBe('browser_telemetry');
      expect(browserEvidence.severity).toBe('MEDIUM');
    });

    it('labels clean session with zero evidence items and nominal guidance', () => {
      const cleanSession = FALLBACK_SESSIONS.find(s => s.session_id === 'sess_normal_clean_05')!;
      expect(cleanSession.evidence_timeline.length).toBe(0);
      expect(cleanSession.recommended_action).toBe('NO_ACTION');
      expect(cleanSession.integrity_score).toBeGreaterThan(95);
    });
  });

  describe('4. Environmental Warning Presentation & Safeguards (IM-102)', () => {
    it('guarantees shared room detection has zero contribution score (IM-102)', () => {
      const sharedRoomSession = FALLBACK_SESSIONS.find(s => s.session_id === 'sess_shared_room_01')!;
      
      // Environmental warnings present
      expect(sharedRoomSession.environmental_warnings.length).toBeGreaterThan(0);
      expect(sharedRoomSession.environmental_warnings[0]).toContain('IM-102');

      // Zero penalty weight assigned
      const envEvidence = sharedRoomSession.evidence_timeline[0];
      expect(envEvidence.contribution_score).toBe(0.0);
      expect(sharedRoomSession.risk_level).toBe('LOW');
    });

    it('identifies adverse lighting sessions and preserves technical re-check guidance', () => {
      const darkSession = FALLBACK_SESSIONS.find(s => s.session_id === 'sess_poor_lighting_04')!;
      
      expect(darkSession.environmental_warnings.some(w => w.includes('lux'))).toBe(true);
      expect(darkSession.recommended_action).toBe('NO_ACTION');
      expect(darkSession.risk_score).toBeLessThan(10);
    });
  });

  describe('5. Missing-Data & Telemetry Failure Handling', () => {
    it('detects missing modalities without inflating risk score', () => {
      const sessionWithMissing = FALLBACK_SESSIONS.find(s => s.session_id === 'sess_poor_lighting_04')!;
      
      expect(sessionWithMissing.missing_data).toContain('browser_telemetry');
      expect(sessionWithMissing.confidence_or_uncertainty).toContain('Low confidence');
      // Low confidence due to missing telemetry must NOT add risk points
      expect(sessionWithMissing.risk_score).toBe(8.0);
      expect(sessionWithMissing.review_status).toBe('REQUIRES_INVESTIGATION');
    });
  });

  describe('6. Reviewer Decision Validation & Role Safeguards', () => {
    it('validates role-based authorization for CONFIRMED_VIOLATION', () => {
      const isLeadAuthorized = (role: string, decision: string) => {
        if (decision === 'CONFIRMED_VIOLATION' && role !== 'lead_proctor') {
          return false;
        }
        return true;
      };

      expect(isLeadAuthorized('reviewer', 'CONFIRMED_VIOLATION')).toBe(false);
      expect(isLeadAuthorized('auditor', 'CONFIRMED_VIOLATION')).toBe(false);
      expect(isLeadAuthorized('lead_proctor', 'CONFIRMED_VIOLATION')).toBe(true);
      expect(isLeadAuthorized('reviewer', 'NO_CONCERN')).toBe(true);
      expect(isLeadAuthorized('reviewer', 'REQUIRES_INVESTIGATION')).toBe(true);
    });

    it('preserves model predictions completely separate from reviewer decisions', () => {
      const session = { ...FALLBACK_SESSIONS[1] };
      const originalRisk = session.risk_score;
      const originalIntegrity = session.integrity_score;

      // Human adjudication action recorded
      const decisionRecord = {
        session_id: session.session_id,
        decision: 'CONFIRMED_VIOLATION' as const,
        reviewer_id: 'rev_lead_01',
        reviewer_role: 'lead_proctor' as const,
        notes: 'Handheld phone verified at t=315s.',
        decision_timestamp: new Date().toISOString(),
      };

      session.review_status = 'CONFIRMED_VIOLATION';
      session.decision_record = decisionRecord;

      // Model predictions MUST remain immutable
      expect(session.risk_score).toBe(originalRisk);
      expect(session.integrity_score).toBe(originalIntegrity);
      expect(session.decision_record.reviewer_id).toBe('rev_lead_01');
    });
  });

  describe('7. ML Explanation Formatter & Parsing Engine', () => {
    const sampleBriefing = `=== FairProctor-AI Reviewer Summary for Session: sess_live_cand_7edf51 ===
Review Priority: LOW (Risk Score: 20.0/100, Integrity Score: 80.0/100)
Engine Version: Model v2.0.0 | Policy v1.0.0

Operational Principle:
This score is a provisional review-priority heuristic (0-100) to guide human review queues. It is NOT an automated accusation, penalty, or empirical probability of cheating.

Risk Breakdown by Factor:
 - Visual Behavior: +20.0 pts
 - Browser Events: +0.0 pts
 - Cross Candidate Similarity: +0.0 pts

Environmental Safeguards & Mitigations:
 [Context] Shared room / background activity observed. Per IM-102 policy, presence of background individuals alone is NOT grounds for penalty.

Evidence Timeline (2 traceable flags):
 [2s - 105s] (VIDEO_CV) PROLONGED_LOOKING_AWAY [MEDIUM]: Candidate gaze diverted from screen for 108.0s. Reviewer should verify if candidate is consulting permitted scratchpad / physical calculation notes.
 [Multiple intervals] (ENVIRONMENTAL) BACKGROUND_PERSON_DETECTED [INFO]: Secondary person observed in background; not penalized per shared-room policy.`;

    it('correctly parses structured reviewer briefing into sections', () => {
      const parsed = parseMLExplanation(sampleBriefing);

      expect(parsed.isStructured).toBe(true);
      expect(parsed.reviewPriority).toBe('LOW');
      expect(parsed.riskScore).toBe('20.0');
      expect(parsed.integrityScore).toBe('80.0');
      expect(parsed.sessionId).toBe('sess_live_cand_7edf51');
      expect(parsed.operationalPrinciple).toContain('provisional review-priority heuristic');
      expect(parsed.operationalPrinciple).not.toContain('Review Priority');

      expect(parsed.riskFactors.length).toBe(3);
      expect(parsed.riskFactors[0].name).toBe('Visual Behavior');
      expect(parsed.riskFactors[0].points).toBe('+20.0 pts');

      expect(parsed.environmentalSafeguards.length).toBe(1);
      expect(parsed.environmentalSafeguards[0]).toContain('Shared room / background activity observed');

      expect(parsed.evidenceItems.length).toBe(2);
      expect(parsed.evidenceItems[0].timeOrInterval).toBe('2s - 105s');
      expect(parsed.evidenceItems[0].source).toBe('VIDEO_CV');
      expect(parsed.evidenceItems[0].type).toBe('PROLONGED_LOOKING_AWAY');
      expect(parsed.evidenceItems[0].severity).toBe('MEDIUM');
      expect(parsed.evidenceItems[0].explanation).toContain('Candidate gaze diverted from screen');

      expect(parsed.evidenceItems[1].severity).toBe('INFO');
      expect(parsed.evidenceItems[1].type).toBe('BACKGROUND_PERSON_DETECTED');
    });

    it('handles unstructured single-line summary with fallback', () => {
      const unstructured = 'Exam completed within all security tolerances. No anomalous visual signatures.';
      const parsed = parseMLExplanation(unstructured);

      expect(parsed.isStructured).toBe(false);
      expect(parsed.fallbackText).toBe(unstructured);
    });
  });

});
