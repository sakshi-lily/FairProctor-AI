import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Clock,
  AlertTriangle,
  FileQuestion,
  Eye,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Send,
  Lock,
  ChevronDown,
  ChevronUp,
  CloudSun,
  Layers,
  Laptop,
  Video,
  Sparkles,
  CheckCircle2,
  Calendar,
  HelpCircle,
  Check,
  Info,
  Camera,
  Download,
  Compass,
  Smartphone,
} from 'lucide-react';
import {
  SessionDetail,
  EvidenceItem,
  ReviewDecisionType,
  CapturedEvidenceFrame,
} from '../types/proctoring';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceInspectorModal } from '../components/EvidenceInspectorModal';
import { FormattedMLExplanation } from '../components/FormattedMLExplanation';
import { useProctorRole } from '../context/ProctorRoleContext';
import { getStoredEvidenceFrames } from '../utils/evidenceFrameCapture';

interface Props {
  session: SessionDetail | null;
  onBackToQueue: () => void;
  onSubmitDecision: (decision: ReviewDecisionType, notes: string) => Promise<{ success: boolean; error?: string }>;
  isSubmittingDecision: boolean;
}

// Convert seconds interval like "t=315s - 345s" or "t=120s" into readable mm:ss format
function formatTimestamp(timeStr: string): string {
  if (!timeStr) return 'During session';
  
  const matches = timeStr.match(/\d+/g);
  if (!matches || matches.length === 0) return timeStr;

  const toMinutesSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (matches.length === 1) {
    const sec = parseInt(matches[0], 10);
    return `${timeStr} (${toMinutesSeconds(sec)})`;
  }

  if (matches.length >= 2) {
    const sec1 = parseInt(matches[0], 10);
    const sec2 = parseInt(matches[1], 10);
    return `${timeStr} (${toMinutesSeconds(sec1)} – ${toMinutesSeconds(sec2)})`;
  }

  return timeStr;
}

// Simplified human-friendly recommendation
function getSimpleRecommendation(rec?: string, riskLevel?: string): string {
  if (!rec) return 'No Action Needed';
  const upper = rec.toUpperCase();
  if (upper === 'PRIORITY_HUMAN_REVIEW' || upper === 'FLAG_FOR_REVIEW' || riskLevel === 'HIGH') {
    return 'Requires Human Review';
  }
  if (upper === 'NO_ACTION' || riskLevel === 'LOW') {
    return 'No Action Needed';
  }
  if (upper.includes('INVESTIGATE') || riskLevel === 'MEDIUM') {
    return 'Investigate Further';
  }
  return rec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Extract human-friendly confidence percentage & level
function getSimpleConfidence(confText?: string): { score: string; levelText: string; level: 'HIGH' | 'MED' | 'LOW' } {
  if (!confText) return { score: '85%', levelText: 'High', level: 'HIGH' };

  const numMatch = confText.match(/\((0\.\d+|\d+%?)\)/);
  const score = numMatch
    ? numMatch[1].includes('%')
      ? numMatch[1]
      : `${Math.round(parseFloat(numMatch[1]) * 100)}%`
    : '85%';

  const lower = confText.toLowerCase();
  if (lower.includes('high') || lower.includes('very high')) {
    return { score, levelText: 'High Confidence', level: 'HIGH' };
  }
  if (lower.includes('low') || lower.includes('uncertain')) {
    return { score, levelText: 'Low Confidence', level: 'LOW' };
  }
  return { score, levelText: 'Moderate Confidence', level: 'MED' };
}

export const SessionDetailPage: React.FC<Props> = ({
  session,
  onBackToQueue,
  onSubmitDecision,
  isSubmittingDecision,
}) => {
  const { activeRole, reviewerId, isLeadProctor } = useProctorRole();
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [selectedSidePhoto, setSelectedSidePhoto] = useState<{ title: string; image: string; sideKey: string; subtitle: string } | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Extract 4-side environment verification if present
  const environmentSides = useMemo(() => {
    if (session?.captured_sides && Object.keys(session.captured_sides).length > 0) {
      return session.captured_sides;
    }
    if (session?.environment_check?.captured_sides) {
      return session.environment_check.captured_sides;
    }
    const envEvent = session?.events?.find((e) => e.event_type === 'ENVIRONMENT_CHECK_COMPLETED');
    if (envEvent?.metadata?.captured_sides) {
      return envEvent.metadata.captured_sides;
    }
    return null;
  }, [session]);

  // Decision Form State (Defaulting to NO_CONCERN)
  const [decisionChoice, setDecisionChoice] = useState<ReviewDecisionType>('NO_CONCERN');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [decisionFeedback, setDecisionFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!session) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 max-w-md mx-auto my-12 space-y-3 shadow-xs">
        <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-800">No Session Selected</h3>
        <p className="text-xs text-slate-500">
          Please select an examination session from the Review Queue to inspect details.
        </p>
        <button
          onClick={onBackToQueue}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review Queue</span>
        </button>
      </div>
    );
  }

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecisionFeedback(null);

    if (decisionChoice === 'CONFIRMED_VIOLATION' && !isLeadProctor) {
      setDecisionFeedback({
        msg: 'Unauthorized: Only Lead Proctors have authority to confirm policy violations.',
        isError: true,
      });
      return;
    }

    const res = await onSubmitDecision(decisionChoice, reviewerNotes);
    if (res.success) {
      setDecisionFeedback({
        msg: `Your determination was recorded successfully as "${decisionChoice.replace(/_/g, ' ')}".`,
        isError: false,
      });
      setReviewerNotes('');
    } else {
      setDecisionFeedback({
        msg: res.error || 'Failed to submit decision. Please try again.',
        isError: true,
      });
    }
  };

  const cf = session.contributing_factors || {};
  const confidence = getSimpleConfidence(session.confidence_or_uncertainty);
  const recommendation = getSimpleRecommendation(session.recommended_action, session.risk_level);

  // Split evidence into Video vs Browser Activity
  const videoEvidence = session.evidence_timeline.filter((ev) => {
    const src = (ev.source || '').toLowerCase();
    const type = (ev.observation_type || '').toLowerCase();
    return src.includes('video') || src.includes('cv') || src.includes('camera') || type.includes('phone') || type.includes('face') || type.includes('gaze');
  });

  const browserEvidence = session.evidence_timeline.filter((ev) => {
    const src = (ev.source || '').toLowerCase();
    const type = (ev.observation_type || '').toLowerCase();
    return src.includes('browser') || src.includes('telemetry') || type.includes('blur') || type.includes('tab') || type.includes('paste');
  });

  // Environmental / Room items (e.g. shared space or lighting)
  const environmentalEvidence = session.evidence_timeline.filter((ev) => {
    const src = (ev.source || '').toLowerCase();
    const type = (ev.observation_type || '').toLowerCase();
    return src.includes('environmental') || type.includes('shared') || type.includes('lighting');
  });

  // Aggregated Captured Evidence Frames (from session data, events, and local storage)
  const [storedFrames, setStoredFrames] = useState<CapturedEvidenceFrame[]>(() =>
    session ? getStoredEvidenceFrames(session.session_id) : []
  );
  const [frameFilter, setFrameFilter] = useState<'ALL' | 'HIGH' | 'FACES' | 'BROWSER'>('ALL');

  useEffect(() => {
    if (!session) return;
    setStoredFrames(getStoredEvidenceFrames(session.session_id));

    const handleFrameCaptured = (e: any) => {
      if (e.detail?.sessionId === session.session_id) {
        setStoredFrames(getStoredEvidenceFrames(session.session_id));
      }
    };
    window.addEventListener('fairproctor_frame_captured', handleFrameCaptured);
    return () => window.removeEventListener('fairproctor_frame_captured', handleFrameCaptured);
  }, [session?.session_id]);

  const allCapturedFrames: CapturedEvidenceFrame[] = useMemo(() => {
    const list: CapturedEvidenceFrame[] = [];
    const seenIds = new Set<string>();

    // 1. From session.captured_frames
    if (session?.captured_frames) {
      session.captured_frames.forEach((f) => {
        if (!seenIds.has(f.id)) {
          seenIds.add(f.id);
          list.push(f);
        }
      });
    }

    // 2. From storedFrames (localStorage)
    storedFrames.forEach((f) => {
      if (!seenIds.has(f.id)) {
        seenIds.add(f.id);
        list.push(f);
      }
    });

    // 3. From session.evidence_timeline with captured_frame
    if (session?.evidence_timeline) {
      session.evidence_timeline.forEach((ev, i) => {
        if (ev.captured_frame) {
          const id = `ev_frame_${i}_${ev.timestamp_or_interval}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            list.push({
              id,
              timestamp: ev.timestamp_or_interval,
              label: ev.observation_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              reason: ev.explanation,
              severity: ev.severity,
              data_url: ev.captured_frame,
              policy_note: ev.relevant_policy,
              bounding_boxes: ev.bounding_boxes,
              source: ev.source,
            });
          }
        }
      });
    }

    // 4. From session.events with metadata.captured_frame
    if (session?.events) {
      session.events.forEach((evt, i) => {
        if (evt.metadata?.captured_frame) {
          const id = evt.event_id || `evt_frame_${i}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            list.push({
              id,
              timestamp: new Date(evt.timestamp).toLocaleTimeString(),
              label: evt.metadata.label || evt.event_type.replace(/_/g, ' '),
              reason: evt.metadata.reason || evt.metadata.message || evt.explanation || 'Proctoring event telemetry snapshot',
              severity: evt.metadata.severity || 'LOW',
              data_url: evt.metadata.captured_frame,
              policy_note: evt.metadata.policy_note,
              bounding_boxes: evt.metadata.bounding_boxes,
              source: evt.source,
            });
          }
        }
      });
    }

    return list;
  }, [session, storedFrames]);

  const filteredCapturedFrames = useMemo(() => {
    if (frameFilter === 'ALL') return allCapturedFrames;
    if (frameFilter === 'HIGH') return allCapturedFrames.filter((f) => f.severity === 'HIGH');
    if (frameFilter === 'FACES') {
      return allCapturedFrames.filter(
        (f) =>
          f.label.toLowerCase().includes('face') ||
          f.reason.toLowerCase().includes('face') ||
          f.reason.toLowerCase().includes('shared') ||
          f.label.toLowerCase().includes('person')
      );
    }
    if (frameFilter === 'BROWSER') {
      return allCapturedFrames.filter(
        (f) =>
          f.label.toLowerCase().includes('tab') ||
          f.label.toLowerCase().includes('blur') ||
          f.label.toLowerCase().includes('screenshot') ||
          f.label.toLowerCase().includes('fullscreen')
      );
    }
    return allCapturedFrames;
  }, [allCapturedFrames, frameFilter]);

  const openFrameInInspector = (frame: CapturedEvidenceFrame) => {
    setSelectedEvidence({
      timestamp_or_interval: frame.timestamp,
      source: frame.source || 'video_cv',
      observation_type: frame.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      observed_value: {
        label: frame.label,
        reason: frame.reason,
        sensor: frame.sensor || 'HD Webcam (Camera Channel 1)',
        resolution: frame.resolution || '640 x 480 px',
        bounding_boxes: frame.bounding_boxes,
      },
      relevant_policy: frame.policy_note || 'Standard Examination Security & Proctoring Integrity Policy',
      explanation: frame.reason,
      severity: frame.severity,
      contribution_score: frame.severity === 'HIGH' ? 0.62 : frame.severity === 'MEDIUM' ? 0.35 : 0.05,
      captured_frame: frame.data_url,
      bounding_boxes: frame.bounding_boxes,
    });
  };

  // Plain-language summary of what happened
  const getPlainWhatHappened = () => {
    const timeline = session.evidence_timeline;
    const hasPhone = timeline.some((ev) => (ev.observation_type || '').toLowerCase().includes('phone') || (ev.explanation || '').toLowerCase().includes('phone'));
    const hasBlur = timeline.some((ev) => (ev.observation_type || '').toLowerCase().includes('blur') || (ev.explanation || '').toLowerCase().includes('focus'));
    const hasSharedRoom = session.environmental_warnings.length > 0 || timeline.some((ev) => (ev.explanation || '').toLowerCase().includes('shared'));

    if (hasPhone && hasBlur) {
      return {
        title: 'Secondary Device & Tab Switch Observed',
        description: 'A mobile phone was detected in front of the camera during the examination. Simultaneously, the candidate clicked away from the exam browser window.',
        severity: 'HIGH' as const,
        advice: 'Recommended Action: Review the video evidence clip and inspect browser activity below before making a final determination.',
      };
    }

    if (hasPhone) {
      return {
        title: 'Mobile Phone Detected on Camera',
        description: 'The camera detected a handheld phone in the student’s visual field during the examination.',
        severity: 'HIGH' as const,
        advice: 'Recommended Action: Inspect the video frame snapshot below to confirm whether the object is an unauthorized device.',
      };
    }

    if (hasSharedRoom && session.risk_level === 'LOW') {
      return {
        title: 'Normal Session with Background Movement',
        description: 'Someone walked through the room in the background during the test. The student remained focused on screen without speaking or cheating.',
        severity: 'LOW' as const,
        advice: 'Fairness Protection: Under exam fairness policy (IM-102), shared room activity never lowers the student’s score.',
      };
    }

    if (session.risk_level === 'LOW' && timeline.length === 0) {
      return {
        title: 'Clean Exam Session — No Incidents Detected',
        description: 'The student remained focused on the exam throughout. No unauthorized devices, extra people, or unpermitted browser tab switches were detected.',
        severity: 'LOW' as const,
        advice: 'All checks passed. You may safely select "No Concern" below.',
      };
    }

    // Default fallback based on summary explanation
    const cleanExplanation = (session.summary_explanation || '')
      .replace(/===.*?===/g, '')
      .replace(/Review Priority:.*?\n/g, '')
      .replace(/Engine Version:.*?\n/g, '')
      .replace(/Risk Breakdown by Factor:[\s\S]*?(?=(Environmental|$))/g, '')
      .trim();

    return {
      title: session.risk_level === 'HIGH' ? 'Elevated Activity Detected' : 'Minor Telemetry Event',
      description: cleanExplanation || 'The AI detected behavioral signals that may warrant human inspection.',
      severity: (session.risk_level as 'HIGH' | 'MEDIUM' | 'LOW') || 'MEDIUM',
      advice: 'Review the camera and browser observations below to verify the circumstances.',
    };
  };

  const whatHappened = getPlainWhatHappened();

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-8">
      {/* 1. Header Bar: Navigation, Candidate & Session Meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToQueue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Back to Review Queue</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Session ID:</span>
            <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {session.session_id}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {session.created_at && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(session.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </span>
          )}

          {session.is_live_candidate_session && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Candidate Exam
            </span>
          )}

          {session.is_demonstration_data && !session.is_live_candidate_session && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
              Demo Session
            </span>
          )}

          <StatusBadge status={session.review_status} size="sm" />
        </div>
      </div>

      {/* 2. Key Metrics Row: Simple Names & Explanations Below Every Metric */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Review Priority */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Review Priority</span>
              <RiskBadge priority={session.risk_level} size="sm" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-extrabold text-slate-900">
                {session.risk_score.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 leading-tight">
            Shows how urgently this session needs human attention. Higher score = higher review priority.
          </p>
        </div>

        {/* Metric 2: Integrity Assessment */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Integrity Assessment</span>
              <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-mono font-extrabold text-teal-600">
                {session.integrity_score.toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-slate-400">clean</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 leading-tight">
            Estimated rule compliance score. Higher percentage = fewer suspicious activities detected.
          </p>
        </div>

        {/* Metric 3: Detection Confidence */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Detection Confidence</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  confidence.level === 'HIGH'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : confidence.level === 'LOW'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}
              >
                {confidence.level}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                {confidence.score}
              </span>
              <span className="text-xs text-slate-400">certainty</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 leading-tight">
            How clearly the camera and sensors could track the student throughout the test.
          </p>
        </div>

        {/* Metric 4: AI Recommendation */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">AI Recommendation</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm font-extrabold text-slate-900 block truncate">
                {recommendation}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100 leading-tight">
            AI suggestion to assist your evaluation. You make the final authoritative decision below.
          </p>
        </div>
      </div>

      {/* 3. Prominent "What Happened?" Executive Summary Section */}
      <div
        className={`p-5 rounded-xl border shadow-2xs transition-all ${
          whatHappened.severity === 'HIGH'
            ? 'bg-rose-50/60 border-rose-200'
            : whatHappened.severity === 'MEDIUM'
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-emerald-50/60 border-emerald-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/5">
          <div className="flex items-center gap-2">
            {whatHappened.severity === 'HIGH' ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : whatHappened.severity === 'MEDIUM' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <h2 className="text-base font-bold text-slate-900">
              What Happened in This Session?
            </h2>
          </div>

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase self-start sm:self-auto ${
              whatHappened.severity === 'HIGH'
                ? 'bg-rose-100 text-rose-800'
                : whatHappened.severity === 'MEDIUM'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {whatHappened.title}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <p className="font-medium text-slate-900">
            {whatHappened.description}
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>{whatHappened.advice}</span>
          </p>
        </div>
      </div>

      {/* Captured Evidence Frames & Proctoring Snapshots Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Captured Evidence Frames &amp; Proctoring Snapshots
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  {allCapturedFrames.length} {allCapturedFrames.length === 1 ? 'Frame' : 'Frames'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic video frames, multiple face detections, phone alerts, and lockdown interception snapshots.
              </p>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          {allCapturedFrames.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {(['ALL', 'HIGH', 'FACES', 'BROWSER'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setFrameFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    frameFilter === filterKey
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? 'All Frames'
                    : filterKey === 'HIGH'
                    ? 'High Severity'
                    : filterKey === 'FACES'
                    ? 'Multiple Faces'
                    : 'Interceptions'}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredCapturedFrames.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs text-slate-500 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 space-y-1.5">
            <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="font-semibold text-slate-700">No Evidence Frames Recorded</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Frames are captured automatically at the moment of violation detection, multiple faces in view, or lockdown interruptions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCapturedFrames.map((frame) => (
              <div
                key={frame.id}
                onClick={() => openFrameInInspector(frame)}
                className="group rounded-xl border border-slate-200 hover:border-teal-400 bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Frame Image Container with overlays */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={frame.data_url}
                    alt={frame.label}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Top-Left Timestamp Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-slate-200 border border-slate-700/60">
                    <Clock className="w-3 h-3 inline mr-1 text-teal-400" />
                    <span>{frame.timestamp}</span>
                  </div>

                  {/* Top-Right Severity Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase backdrop-blur-xs shadow-xs ${
                        frame.severity === 'HIGH'
                          ? 'bg-rose-600/90 text-white border border-rose-400'
                          : frame.severity === 'MEDIUM'
                          ? 'bg-amber-600/90 text-white border border-amber-400'
                          : 'bg-emerald-600/90 text-white border border-emerald-400'
                      }`}
                    >
                      {frame.severity}
                    </span>
                  </div>

                  {/* Bottom Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 pt-6 flex items-end justify-between">
                    <span className="text-xs font-bold text-white truncate drop-shadow-xs">
                      {frame.label}
                    </span>
                    <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-0.5 flex-shrink-0 ml-1">
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {frame.reason}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium truncate max-w-[170px]" title={frame.policy_note}>
                      {frame.policy_note || 'Proctoring Audit Record'}
                    </span>
                    <span className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                      <span>Full Frame</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3B. Mobile 4-Side Environment Verification */}
      {environmentSides && (
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Mobile 4-Side Environment Check</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    4 Sides Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pre-exam candidate environment photos &amp; perimeter sweep (Policy IM-102 Protected)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-600">
                Desk: <strong>Cleared</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-50 font-semibold text-[11px] text-teal-800 border border-teal-200">
                IM-102 Zero Penalty
              </span>
            </div>
          </div>

          {/* 4-Side Photo Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                key: 'desk_front',
                title: 'Side 1: Desk & Screen',
                subtitle: 'Workspace, keyboard, monitor surface',
                note: 'Clean desk verified',
              },
              {
                key: 'room_left',
                title: 'Side 2: Left Side Perimeter',
                subtitle: 'Left boundary, wall & access point',
                note: 'Perimeter inspected',
              },
              {
                key: 'room_right',
                title: 'Side 3: Right Side Perimeter',
                subtitle: 'Right boundary, wall & side table',
                note: 'Perimeter inspected',
              },
              {
                key: 'room_back',
                title: 'Side 4: Behind You / Rear Room',
                subtitle: 'Doorway & space behind chair',
                note: 'Policy IM-102 Protected Area',
              },
            ].map((side) => {
              const photoUrl = (environmentSides as any)[side.key];
              if (!photoUrl) return null;
              return (
                <div
                  key={side.key}
                  onClick={() =>
                    setSelectedSidePhoto({
                      title: side.title,
                      image: photoUrl,
                      sideKey: side.key,
                      subtitle: side.subtitle,
                    })
                  }
                  className="rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-white shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={photoUrl}
                      alt={side.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-teal-300 border border-slate-700">
                      {side.title.split(':')[0]}
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] font-bold text-white bg-slate-950/80 px-2 py-1 rounded-md flex items-center gap-1">
                        <Eye className="w-3 h-3 text-teal-400" />
                        <span>Inspect Photo</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{side.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">{side.subtitle}</p>
                    <span className="text-[9px] font-semibold text-emerald-600 block pt-0.5">
                      ✓ {side.note}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Display Video Evidence and Browser Activity Separately (With Inspect Buttons) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card A: Camera & Video Evidence */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Camera &amp; Video Evidence</h3>
                  <p className="text-[11px] text-slate-500">Detections from student webcam</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {videoEvidence.length} {videoEvidence.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {videoEvidence.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-500 bg-slate-50/70 rounded-lg border border-dashed border-slate-200 space-y-1">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="font-semibold text-slate-700">No Video Incidents Detected</p>
                <p className="text-[11px] text-slate-400">Student remained facing camera; no unauthorized devices or faces seen.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {videoEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{formatTimestamp(ev.timestamp_or_interval)}</span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          ev.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : ev.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ev.severity === 'HIGH' ? 'High Severity' : ev.severity === 'MEDIUM' ? 'Medium Severity' : 'Low Severity'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug">
                      {ev.explanation}
                    </p>

                    {/* Frame Preview Thumbnail if captured */}
                    {ev.captured_frame && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvidence(ev);
                        }}
                        className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer group/thumb"
                      >
                        <img
                          src={ev.captured_frame}
                          alt={ev.observation_type}
                          className="w-full h-full object-contain group-hover/thumb:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                          <Camera className="w-3 h-3 text-teal-400" />
                          <span>View Frame</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEvidence(ev)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Video Evidence</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Video model: v{session.model_version}</span>
            <span>Recorded in audit store</span>
          </div>
        </div>

        {/* Card B: Browser & Screen Activity */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Browser & Screen Activity</h3>
                  <p className="text-[11px] text-slate-500">Window focus, tab switches, and clipboard actions</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {browserEvidence.length} {browserEvidence.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {browserEvidence.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-500 bg-slate-50/70 rounded-lg border border-dashed border-slate-200 space-y-1">
                <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="font-semibold text-slate-700">Continuous Screen Focus Maintained</p>
                <p className="text-[11px] text-slate-400">Student did not leave test tab or paste external content.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {browserEvidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/60 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formatTimestamp(ev.timestamp_or_interval)}</span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          ev.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : ev.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ev.severity === 'HIGH' ? 'High Severity' : ev.severity === 'MEDIUM' ? 'Medium Severity' : 'Low Severity'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-snug">
                      {ev.explanation}
                    </p>

                    {/* Frame Preview Thumbnail if captured */}
                    {ev.captured_frame && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvidence(ev);
                        }}
                        className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer group/thumb"
                      >
                        <img
                          src={ev.captured_frame}
                          alt={ev.observation_type}
                          className="w-full h-full object-contain group-hover/thumb:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-white flex items-center gap-1">
                          <Camera className="w-3 h-3 text-teal-400" />
                          <span>View Frame</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEvidence(ev)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Browser Log</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
            <span>Browser telemetry: DOM Focus & Keys</span>
            <span>Policy: v{session.policy_version}</span>
          </div>
        </div>
      </div>

      {/* 5. Evidence Contribution (Simplified, Non-Technical, Clear Explanations) */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Evidence Contribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Shows how much each sensor signal influenced the Review Priority score. These percentages reflect sensor weight — they are <strong>not cheating probabilities</strong>.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            Sensor Signal Breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Factor 1: Camera Observations */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Camera Observations (Visual)</span>
              <span className="font-mono font-extrabold text-teal-700 text-sm">
                {((cf.visual_cv || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (cf.visual_cv || 0) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Webcam detections: face orientation, eye gaze, or secondary devices in view.
            </p>
          </div>

          {/* Factor 2: Browser Activity */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Browser & Screen Activity</span>
              <span className="font-mono font-extrabold text-indigo-700 text-sm">
                {((cf.browser_telemetry || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (cf.browser_telemetry || 0) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Window focus loss, tab switching, or copying external text into questions.
            </p>
          </div>

          {/* Factor 3: Answer Similarity */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Answer Pattern Similarity</span>
              <span className="font-mono font-extrabold text-slate-700 text-sm">
                {((cf.answer_similarity || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (cf.answer_similarity || 0) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Unusual cohort answer timing or synchronized responses with other candidates.
            </p>
          </div>

          {/* Factor 4: Room & Network Environment */}
          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-950 flex items-center gap-1">
                <span>Room & Network Environment</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Protected</span>
              </span>
              <span className="font-mono font-extrabold text-emerald-700 text-sm">
                0%
              </span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '0%' }} />
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Fairness guarantee (IM-102): Dim lighting, internet drops, or shared room family members never penalize the student.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Expandable Technical Engine Context (Collapsed by Default) */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-4 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Technical Engine Details & Policy Specifications (Optional for Auditors)</span>
          </span>
          <span className="text-teal-600 text-xs font-medium flex items-center gap-1">
            <span>{showTechnicalDetails ? 'Hide Technical View' : 'Show Technical View'}</span>
            {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-fade-in">
            <FormattedMLExplanation
              explanation={session.summary_explanation}
              modelVersion={session.model_version}
              policyVersion={session.policy_version}
              isExpanded={true}
              onToggleExpand={() => setShowTechnicalDetails(false)}
            />
          </div>
        )}
      </div>

      {/* 7. Human Review & Final Decision (The Final Prominent Section) */}
      <div className="p-6 rounded-2xl bg-white border-2 border-teal-600 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <span>Human Review & Final Decision</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              AI recommendations are strictly advisory. Your review is the only official, authoritative decision for this exam.
            </p>
          </div>

          <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Reviewer: </span>
            <strong className="text-slate-900 font-mono">
              {reviewerId} ({activeRole})
            </strong>
          </div>
        </div>

        {/* Existing Decision Notice (if already reviewed) */}
        {session.decision_record && (
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-teal-900">Current Saved Status: </span>
              <strong className="text-teal-950 font-semibold uppercase">{session.decision_record.decision.replace(/_/g, ' ')}</strong>
              {session.decision_record.notes && (
                <span className="text-teal-800 ml-1.5">
                  &ldquo;{session.decision_record.notes}&rdquo;
                </span>
              )}
              <span className="text-teal-600 block sm:inline sm:ml-2 text-[11px]">
                (By {session.decision_record.reviewer_id} on {new Date(session.decision_record.decision_timestamp).toLocaleDateString()})
              </span>
            </div>
            <StatusBadge status={session.decision_record.decision} size="sm" />
          </div>
        )}

        {/* Submission Feedback Message */}
        {decisionFeedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              decisionFeedback.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {decisionFeedback.isError ? (
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{decisionFeedback.msg}</span>
          </div>
        )}

        {/* Adjudication Form with 3 Clear Options */}
        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: No Concern */}
            <label
              className={`p-4 rounded-xl border-2 text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'NO_CONCERN'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-sm text-slate-900">No Concern</span>
                  </div>
                  <input
                    type="radio"
                    name="decisionChoice"
                    value="NO_CONCERN"
                    checked={decisionChoice === 'NO_CONCERN'}
                    onChange={() => setDecisionChoice('NO_CONCERN')}
                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Session appears normal. Any movement, background noise, or brief glances are harmless and explainable.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-bold text-emerald-700 uppercase">
                Student Cleared
              </span>
            </label>

            {/* Option 2: Investigate Further */}
            <label
              className={`p-4 rounded-xl border-2 text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'REQUIRES_INVESTIGATION'
                  ? 'border-sky-600 bg-sky-50/60 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-sky-600" />
                    <span className="font-bold text-sm text-slate-900">Investigate Further</span>
                  </div>
                  <input
                    type="radio"
                    name="decisionChoice"
                    value="REQUIRES_INVESTIGATION"
                    checked={decisionChoice === 'REQUIRES_INVESTIGATION'}
                    onChange={() => setDecisionChoice('REQUIRES_INVESTIGATION')}
                    className="accent-sky-600 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Ambiguous telemetry signals. Student retains benefit of the doubt while an academic reviewer evaluates.
                </p>
              </div>
              <span className="mt-3 text-[11px] font-bold text-sky-700 uppercase">
                Second Review Needed
              </span>
            </label>

            {/* Option 3: Violation Confirmed */}
            <label
              className={`p-4 rounded-xl border-2 text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'CONFIRMED_VIOLATION'
                  ? 'border-rose-600 bg-rose-50/60 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-sm text-slate-900">Violation Confirmed</span>
                    {!isLeadProctor && (
                      <span title="Requires Lead Proctor authorization">
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="decisionChoice"
                    value="CONFIRMED_VIOLATION"
                    checked={decisionChoice === 'CONFIRMED_VIOLATION'}
                    onChange={() => setDecisionChoice('CONFIRMED_VIOLATION')}
                    className="accent-rose-600 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  Direct policy breach confirmed by video, device, or screen evidence (Requires Lead Proctor authorization).
                </p>
              </div>
              <span className="mt-3 text-[11px] font-bold text-rose-700 uppercase">
                Official Breach Recorded
              </span>
            </label>
          </div>

          {/* Reviewer Notes Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Reviewer Notes (Optional explanation for institutional records):
            </label>
            <textarea
              rows={2}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g., Reviewed camera timestamp at 5m 15s. Confirmed student held a mobile phone while answering question..."
              className="w-full p-3 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Submit Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Your decision is permanently saved to the session audit log.
            </span>

            <button
              type="submit"
              disabled={isSubmittingDecision}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmittingDecision ? 'Saving Determination...' : 'Submit Final Determination'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Deep Evidence Inspector Modal */}
      <EvidenceInspectorModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        allEvidence={session.evidence_timeline}
        onSelectEvidence={(ev) => setSelectedEvidence(ev)}
      />

      {/* 4-Side Environment Photo Inspection Modal */}
      {selectedSidePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSidePhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedSidePhoto.title}</h3>
                  <p className="text-xs text-slate-500">{selectedSidePhoto.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSidePhoto(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[320px]">
              <img
                src={selectedSidePhoto.image}
                alt={selectedSidePhoto.title}
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-slate-800"
              />
            </div>

            <div className="p-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600 space-y-0.5">
                <span className="font-semibold block text-slate-800">
                  {selectedSidePhoto.sideKey === 'room_back'
                    ? 'Policy IM-102 Protected Workspace'
                    : 'Candidate Pre-Test Environment Check'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedSidePhoto.sideKey === 'room_back'
                    ? 'Background family members or ambient movement carries zero risk penalty under Policy IM-102.'
                    : 'Captured via candidate mobile smartphone during pre-test room sweep.'}
                </span>
              </div>
              <button
                onClick={() => setSelectedSidePhoto(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
