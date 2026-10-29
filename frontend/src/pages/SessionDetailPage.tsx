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
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <FileQuestion className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Session Selected
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Please select an examination session from the Review Queue or Environmental Fairness page to inspect details.
        </p>
        <button
          onClick={onBackToQueue}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go to Review Queue
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
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Session Queue</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-500 dark:text-slate-400">
            Session ID: <strong className="text-slate-800 dark:text-slate-200">{session.session_id}</strong>
          </span>
          {session.is_demonstration_data && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              Demo Fixture
            </span>
          )}
          {session.is_live_candidate_session && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
              {session.candidate_status === 'IN_PROGRESS' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <span>Live Candidate Exam ({session.candidate_status})</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Score & Decision Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Risk Score */}
        <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
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
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {session.risk_score.toFixed(0)}
              </span>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">Risk</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Review Priority Heuristic
            </div>
            <div className="mt-1">
              <RiskBadge priority={session.risk_level} showHeuristicNote />
            </div>
          </div>
        </div>

        {/* Integrity Score */}
        <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
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
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {session.integrity_score.toFixed(0)}
              </span>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">Integrity</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Integrity Index
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {session.integrity_score.toFixed(1)} / 100
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Derived as 100 - Risk Score
            </div>
          </div>
        </div>

        {/* Recommended Action & Status */}
        <div className="flex flex-col justify-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Engine Recommended Guidance
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {session.recommended_action}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <StatusBadge status={session.review_status} size="sm" />
          </div>
        </div>

      </div>

      {/* Summary Explanation & Confidence Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Explanation Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Machine Learning Summary Explanation
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {session.summary_explanation}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Model: <strong>v{session.model_version}</strong></span>
            <span>Policy: <strong>{session.policy_version}</strong></span>
          </div>
        </div>

        {/* Limitations & Uncertainty Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            Confidence & Uncertainty Limitations
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {session.confidence_or_uncertainty}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {session.missing_data && session.missing_data.length > 0 ? (
              session.missing_data.map(m => (
                <span
                  key={m}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1"
                >
                  <FileQuestion className="w-3 h-3" />
                  Missing modality: {m}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                All 4 modalities available and verified
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Visual Separation: Contributing Factors & Environmental Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contributing Factors by Evidence Source */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Contributing Factors by Evidence Source
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportional attribution contributing to the review priority heuristic
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Visual CV */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Visual CV Model (v2.0.0)</span>
                <span className="font-mono text-slate-500">{((cf.visual_cv || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.visual_cv || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Browser Telemetry */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Browser Focus & Telemetry</span>
                <span className="font-mono text-slate-500">{((cf.browser_telemetry || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.browser_telemetry || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Answer Similarity */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Cohort Answer Similarity</span>
                <span className="font-mono text-slate-500">{((cf.answer_similarity || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.answer_similarity || 0) * 100)}%` }}
                />
              </div>
            </div>

            {/* Environmental Reliability */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Environmental Reliability Safeguard</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">Non-Penalizing</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cf.environmental_reliability || 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Warnings (Strictly Separated from Misconduct) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <CloudSun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Environmental & Accessibility Notices
              </h3>
              <p className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                Protected Conditions &middot; Zero Score Penalization (IM-102)
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {session.environmental_warnings && session.environmental_warnings.length > 0 ? (
              session.environmental_warnings.map((warn, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2.5"
                >
                  <CloudSun className="w-4 h-4 mt-0.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                  <span className="leading-relaxed">{warn}</span>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-center">
                No adverse environmental conditions (lighting, bandwidth, or shared room) recorded for this session.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Candidate Telemetry & Lifecycle Stream (If Candidate Session or Events Exist) */}
      {(session.is_live_candidate_session || (session.events && session.events.length > 0)) && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Live Candidate Telemetry &amp; Event Stream ({session.events?.length || 0} Events)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 uppercase">
                  Candidate Session
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time browser-observed telemetry and simulated environmental conditions with server UTC timestamps
              </p>
            </div>

            {/* Candidate Session Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                Status: <strong className="font-semibold text-slate-900 dark:text-white">{session.candidate_status || 'COMPLETED'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                Answers: <strong className="font-semibold text-slate-900 dark:text-white">{session.answers_count ?? 0}/5</strong>
              </span>
            </div>
          </div>

          {/* Privacy & Fairness Guarantee Ribbon */}
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/50 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Policy IM-102 Safeguard Enforced: </strong>
              Environmental observations (background persons in shared rooms, low light) and technical interruptions 
              (camera drops, network degradation) are recorded as contextual evidence. Per policy IM-102, they produce 
              <strong className="underline decoration-teal-500 underline-offset-2 ml-1">0 misconduct penalty points</strong> and cannot independently increase review risk score.
            </div>
          </div>

          {/* Events Stream List */}
          {(!session.events || session.events.length === 0) ? (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Waiting for candidate telemetry events... (SSE stream active)
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {session.events.map((evt, idx) => (
                <div
                  key={evt.event_id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Event Type Badge */}
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {evt.event_type}
                      </span>

                      {/* Source Badge */}
                      {evt.source === 'simulation' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>SIMULATED</span>
                        </span>
                      ) : evt.source === 'browser' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                          <Laptop className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>BROWSER NATIVE</span>
                        </span>
                      ) : evt.source === 'candidate' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>CANDIDATE CONFIRMATION</span>
                        </span>
                      ) : evt.source === 'server' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                          <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span>SERVER VALIDATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                          <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>MODEL SCORING</span>
                        </span>
                      )}

                      {/* Reliability Badge */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          evt.evidence_reliability === 'HIGH'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : evt.evidence_reliability === 'MEDIUM'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                            : evt.evidence_reliability === 'LOW'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Reliability: {evt.evidence_reliability}
                      </span>
                    </div>

                    {/* Server Timestamp */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(evt.timestamp || evt.server_timestamp || Date.now()).toLocaleTimeString()} ({((evt.timestamp || evt.server_timestamp || '').slice(11, 19)) || 'UTC'})
                      </span>
                    </div>
                  </div>

                  {/* Explanation text */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {evt.explanation || evt.metadata?.reason || evt.metadata?.notes || `Observed candidate lifecycle event: ${evt.event_type}`}
                  </p>

                  {/* Metadata preview if exists */}
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-slate-400">Validated Metadata:</span>
                      {Object.entries(evt.metadata).map(([key, val]) => (
                        <span key={key} className="inline-flex items-center gap-1">
                          <strong className="text-slate-700 dark:text-slate-300">{key}:</strong>
                          <span>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamped Evidence Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Timestamped Evidence Timeline ({session.evidence_timeline.length} items)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any evidence row to inspect granular telemetry signals and machine learning explanations
            </p>
          </div>
        </div>

        {session.evidence_timeline.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Zero anomalous evidence items detected. Examination completed within nominal thresholds.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {session.evidence_timeline.map((ev, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEvidence(ev)}
                className="py-3.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {ev.timestamp_or_interval}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {ev.source}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          ev.severity === 'HIGH'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : ev.severity === 'MEDIUM'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {ev.severity} SEVERITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                      {ev.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <span>Inspect</span>
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Human Reviewer Decision Submission Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Human Review Adjudication
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit your formal human review determination for this examination session
            </p>
          </div>

          <div className="text-xs">
            <span className="text-slate-400">Reviewing as: </span>
            <strong className="text-slate-800 dark:text-slate-200 font-mono">
              {reviewerId} ({activeRole})
            </strong>
          </div>
        </div>

        {/* Existing Decision Alert if already reviewed */}
        {session.decision_record && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Prior Reviewer Determination on File:
              </span>
              <StatusBadge status={session.decision_record.decision} size="sm" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 pt-1">
              &ldquo;{session.decision_record.notes}&rdquo;
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Adjudicated by {session.decision_record.reviewer_id} ({session.decision_record.reviewer_role}) on{' '}
              {new Date(session.decision_record.decision_timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {decisionFeedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              decisionFeedback.isError
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            {decisionFeedback.isError ? (
              <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            )}
            <p className="leading-relaxed">{decisionFeedback.msg}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleDecisionSubmit} className="space-y-4 pt-1">
          
          {/* Decision options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* No Concern */}
            <label
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'NO_CONCERN'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold">No Concern Identified</span>
                <input
                  type="radio"
                  name="decisionChoice"
                  value="NO_CONCERN"
                  checked={decisionChoice === 'NO_CONCERN'}
                  onChange={() => setDecisionChoice('NO_CONCERN')}
                  className="accent-emerald-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Candidate cleared. Behavior or environmental movement deemed benign.
              </p>
            </label>

            {/* Requires Investigation */}
            <label
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                decisionChoice === 'REQUIRES_INVESTIGATION'
                  ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold">Requires Investigation</span>
                <input
                  type="radio"
                  name="decisionChoice"
                  value="REQUIRES_INVESTIGATION"
                  checked={decisionChoice === 'REQUIRES_INVESTIGATION'}
                  onChange={() => setDecisionChoice('REQUIRES_INVESTIGATION')}
                  className="accent-sky-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Insufficient evidence or technical ambiguity. Candidate must not be penalized.
              </p>
            </label>

            {/* Confirmed Policy Violation (Role Gated) */}
            <label
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between relative ${
                decisionChoice === 'CONFIRMED_VIOLATION'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">Confirmed Policy Violation</span>
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
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Authorized Lead Proctor determination after examining tangible evidence.
              </p>
            </label>

          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Notes & Justification:
            </label>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
              placeholder="Record contextual observations, frame numbers inspected, or reason for determination..."
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Recorded in audit log &middot; Model predictions remain strictly immutable.
            </span>
            <button
              type="submit"
              disabled={isSubmittingDecision}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
