import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Layers,
  AlertTriangle,
  CloudSun,
  FileQuestion,
  HelpCircle,
  Eye,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Send,
  Lock,
  Info,
  Activity,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  Sparkles,
  Laptop,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import {
  SessionDetail,
  EvidenceItem,
  ReviewDecisionType,
  ReviewerRole,
} from '../types/proctoring';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceInspectorModal } from '../components/EvidenceInspectorModal';
import { useProctorRole } from '../context/ProctorRoleContext';

interface Props {
  session: SessionDetail | null;
  onBackToQueue: () => void;
  onSubmitDecision: (decision: ReviewDecisionType, notes: string) => Promise<{ success: boolean; error?: string }>;
  isSubmittingDecision: boolean;
}

export const SessionDetailPage: React.FC<Props> = ({
  session,
  onBackToQueue,
  onSubmitDecision,
  isSubmittingDecision,
}) => {
  const { activeRole, reviewerId, isLeadProctor } = useProctorRole();
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  
  // Decision Form State
  const [decisionChoice, setDecisionChoice] = useState<ReviewDecisionType>('NO_CONCERN');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [decisionFeedback, setDecisionFeedback] = useState<{ msg: string; isError: boolean } | null>(null);

  if (!session) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-800">
          No Session Selected
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Select a session from the Review Queue to inspect details.
        </p>
        <button
          onClick={onBackToQueue}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Review Queue
        </button>
      </div>
    );
  }

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDecisionFeedback(null);

    // Frontend validation for role
    if (decisionChoice === 'CONFIRMED_VIOLATION' && !isLeadProctor) {
      setDecisionFeedback({
        msg: 'Unauthorized: Only Lead Proctors have authority to confirm policy violations after examining evidence.',
        isError: true,
      });
      return;
    }

    const res = await onSubmitDecision(decisionChoice, reviewerNotes);
    if (res.success) {
      setDecisionFeedback({
        msg: `Decision recorded successfully. Review status updated to "${decisionChoice}". Model scores remain untouched.`,
        isError: false,
      });
      setReviewerNotes('');
    } else {
      setDecisionFeedback({
        msg: res.error || 'Failed to submit decision',
        isError: true,
      });
    }
  };

  const cf = session.contributing_factors || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Queue</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-500">
            Session: <strong className="text-slate-800">{session.session_id}</strong>
          </span>
          {session.is_demonstration_data && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 text-teal-800 border border-teal-300">
              Demo
            </span>
          )}
          {session.is_live_candidate_session && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
              {session.candidate_status === 'IN_PROGRESS' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span>Live Exam ({session.candidate_status})</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Score & Decision Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Risk Score */}
        <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  session.risk_score >= 70
                    ? 'text-rose-500'
                    : session.risk_score >= 40
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }
                strokeDasharray={`${session.risk_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-bold font-mono text-slate-900">
                {session.risk_score.toFixed(0)}
              </span>
              <span className="block text-[8px] text-slate-400 uppercase font-semibold">Risk</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Priority Score</div>
            <div className="mt-1">
              <RiskBadge priority={session.risk_level} showHeuristicNote />
            </div>
          </div>
        </div>

        {/* Integrity Score */}
        <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
          <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-teal-500"
                strokeDasharray={`${session.integrity_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-lg font-bold font-mono text-slate-900">
                {session.integrity_score.toFixed(0)}
              </span>
              <span className="block text-[8px] text-slate-400 uppercase font-semibold">Score</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Integrity Index</div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {session.integrity_score.toFixed(1)} / 100
            </div>
            <div className="text-[10px] text-slate-400">100 - Risk Score</div>
          </div>
        </div>

        {/* Recommended Action & Status */}
        <div className="flex flex-col justify-center">
          <div className="text-xs text-slate-500 font-medium">Recommendation</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            {session.recommended_action}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <StatusBadge status={session.review_status} size="sm" />
          </div>
        </div>
      </div>

      {/* Summary Explanation & Confidence Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Explanation Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            ML Explanation
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            {session.summary_explanation}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-500">
            <span>Model: <strong>v{session.model_version}</strong></span>
            <span>Policy: <strong>{session.policy_version}</strong></span>
          </div>
        </div>

        {/* Limitations & Uncertainty Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Confidence &amp; Limitations
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            {session.confidence_or_uncertainty}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            {session.missing_data && session.missing_data.length > 0 ? (
              session.missing_data.map(m => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"
                >
                  <FileQuestion className="w-3 h-3" />
                  Missing: {m}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All 4 modalities verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Separation: Contributing Factors & Environmental Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Contributing Factors by Evidence Source */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contributing Factors</h3>
            <p className="text-xs text-slate-500">Attribution across evidence sources</p>
          </div>

          <div className="space-y-3 pt-1">
            {/* Visual CV */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Visual CV</span>
                <span className="font-mono text-slate-500">{((cf.visual_cv || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.visual_cv || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Browser Telemetry */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Browser Focus</span>
                <span className="font-mono text-slate-500">{((cf.browser_telemetry || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.browser_telemetry || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Answer Similarity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Answer Similarity</span>
                <span className="font-mono text-slate-500">{((cf.answer_similarity || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.answer_similarity || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Environmental Reliability */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Environmental Guard</span>
                <span className="font-mono text-teal-600 font-semibold">Zero Penalty</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.environmental_reliability || 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Warnings */}
        <div className="p-5 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Environmental Notices</h3>
              <p className="text-xs text-sky-700 font-medium">Policy IM-102: Zero penalty points</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {session.environmental_warnings && session.environmental_warnings.length > 0 ? (
              session.environmental_warnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5"
                >
                  <CloudSun className="w-4 h-4 mt-0.5 text-sky-600 flex-shrink-0" />
                  <span className="leading-relaxed">{warn}</span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                No adverse environmental conditions recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Candidate Telemetry & Lifecycle Stream */}
      {(session.is_live_candidate_session || (session.events && session.events.length > 0)) && (
        <div className="p-5 rounded-2xl bg-white border border-teal-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Live Telemetry ({session.events?.length || 0} Events)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time candidate telemetry stream.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                Status: <strong className="font-semibold text-slate-900">{session.candidate_status || 'COMPLETED'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                Answers: <strong className="font-semibold text-slate-900">{session.answers_count ?? 0}/5</strong>
              </span>
            </div>
          </div>

          {/* Privacy & Fairness Guarantee Ribbon */}
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
            <Shield className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
            <p className="leading-normal">
              <strong>Policy IM-102:</strong> Environmental conditions carry 0 penalty points.
            </p>
          </div>

          {/* Events Stream List */}
          {(!session.events || session.events.length === 0) ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              Waiting for candidate telemetry...
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {session.events.map((evt, idx) => (
                <div
                  key={evt.event_id || idx}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 transition-colors space-y-1.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 text-slate-800">
                        {evt.event_type}
                      </span>

                      {evt.source === 'simulation' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>SIMULATED</span>
                        </span>
                      ) : evt.source === 'browser' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                          <Laptop className="w-3 h-3 text-indigo-600" />
                          <span>BROWSER</span>
                        </span>
                      ) : evt.source === 'candidate' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>CANDIDATE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                          <Shield className="w-3 h-3 text-teal-600" />
                          <span>ENGINE</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          evt.evidence_reliability === 'HIGH'
                            ? 'bg-emerald-100 text-emerald-700'
                            : evt.evidence_reliability === 'MEDIUM'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        Reliability: {evt.evidence_reliability}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(evt.timestamp || evt.server_timestamp || Date.now()).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-normal">
                    {evt.explanation || evt.metadata?.reason || evt.metadata?.notes || `Observed: ${evt.event_type}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamped Evidence Timeline */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Evidence Timeline ({session.evidence_timeline.length})
            </h3>
            <p className="text-xs text-slate-500">Click row to inspect details.</p>
          </div>
        </div>

        {session.evidence_timeline.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
            Zero anomalous evidence items detected.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {session.evidence_timeline.map((ev, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEvidence(ev)}
                className="py-3 px-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:text-teal-600 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        {ev.timestamp_or_interval}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 uppercase">
                        {ev.source}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          ev.severity === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : ev.severity === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {ev.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs text-teal-600 font-medium">
                  <span>Inspect</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human Reviewer Decision Submission Form */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Adjudication</h3>
            <p className="text-xs text-slate-500">Submit human proctor determination.</p>
          </div>

          <div className="text-xs">
            <span className="text-slate-400">Reviewer: </span>
            <strong className="text-slate-800 font-mono">
              {reviewerId} ({activeRole})
            </strong>
          </div>
        </div>

        {/* Existing Decision Alert if already reviewed */}
        {session.decision_record && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Prior Determination:</span>
              <StatusBadge status={session.decision_record.decision} size="sm" />
            </div>
            <p className="text-slate-600 pt-0.5">&ldquo;{session.decision_record.notes}&rdquo;</p>
            <div className="text-[10px] text-slate-400 pt-0.5">
              By {session.decision_record.reviewer_id} ({session.decision_record.reviewer_role}) on{' '}
              {new Date(session.decision_record.decision_timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {decisionFeedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              decisionFeedback.isError
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {decisionFeedback.isError ? (
              <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="leading-normal">{decisionFeedback.msg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-1">
          {/* Decision options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* No Concern */}
            <label
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'NO_CONCERN'
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">No Concern</span>
                <input
                  type="radio"
                  name="decisionChoice"
                  value="NO_CONCERN"
                  checked={decisionChoice === 'NO_CONCERN'}
                  onChange={() => setDecisionChoice('NO_CONCERN')}
                  className="accent-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Cleared. Environmental movement deemed benign.
              </p>
            </label>

            {/* Requires Investigation */}
            <label
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'REQUIRES_INVESTIGATION'
                  ? 'border-sky-500 bg-sky-50/50 text-sky-900 ring-2 ring-sky-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">Investigation</span>
                <input
                  type="radio"
                  name="decisionChoice"
                  value="REQUIRES_INVESTIGATION"
                  checked={decisionChoice === 'REQUIRES_INVESTIGATION'}
                  onChange={() => setDecisionChoice('REQUIRES_INVESTIGATION')}
                  className="accent-sky-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Ambiguous telemetry. Candidate protected.
              </p>
            </label>

            {/* Confirmed Policy Violation (Role Gated) */}
            <label
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between relative ${
                decisionChoice === 'CONFIRMED_VIOLATION'
                  ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Violation</span>
                  {!isLeadProctor && (
                    <span title="Requires Lead Proctor role">
                      <Lock className="w-3 h-3 text-amber-500" />
                    </span>
                  )}
                </div>
                <input
                  type="radio"
                  name="decisionChoice"
                  value="CONFIRMED_VIOLATION"
                  checked={decisionChoice === 'CONFIRMED_VIOLATION'}
                  onChange={() => setDecisionChoice('CONFIRMED_VIOLATION')}
                  className="accent-rose-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Lead Proctor determination based on direct evidence.
              </p>
            </label>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Reviewer Notes:
            </label>
            <textarea
              rows={2}
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
              placeholder="Enter notes or justification..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Audit logged &middot; Immutable engine records.
            </span>
            <button
              type="submit"
              disabled={isSubmittingDecision}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmittingDecision ? 'Submitting...' : 'Submit Decision'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Evidence Modal */}
      <EvidenceInspectorModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />

    </div>
  );
};
