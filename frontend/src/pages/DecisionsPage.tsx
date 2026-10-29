import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  Clock,
  UserCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Info,
} from 'lucide-react';
import { SessionSummaryItem, ReviewDecisionType } from '../types/proctoring';
import { StatusBadge } from '../components/StatusBadge';
import { useProctorRole } from '../context/ProctorRoleContext';

interface Props {
  sessions: SessionSummaryItem[];
  onSelectSession: (sessionId: string) => void;
}

export const DecisionsPage: React.FC<Props> = ({ sessions, onSelectSession }) => {
  const { activeRole, reviewerId, isLeadProctor } = useProctorRole();
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  // Find sessions that have a recorded decision or review status
  const adjudicatedSessions = sessions.filter(s => {
    if (filterDecision === 'ALL') {
      return s.decision_record !== null && s.decision_record !== undefined;
    }
    return s.decision_record?.decision === filterDecision;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Reviewer Decision Audit Log
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Traceable records of human proctor adjudications &middot; Strictly decoupled from model heuristics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Active Reviewer:</span>
          <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
            {reviewerId} ({activeRole})
          </span>
        </div>
      </div>

      {/* Disciplinary Separation & Storage Disclosure */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            Ethical Adjudication Guarantee: Model Independence
          </p>
          <p>
            Under the FairProctor-AI architecture, <strong>the machine learning engine never automatically disqualifies candidates</strong>. 
            All final determinations must be entered by human reviewers. Reviewer actions are stored via the backend 
            REST endpoint (<code>POST /api/v1/sessions/{'{session_id}'}/decisions</code>) in in-memory session persistence.
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            Confirmed Policy Violations are locked behind role-based authorization: only accounts with the <strong>Lead Proctor</strong> role 
            are authorized to confirm violations after verifying physical or telemetry evidence.
          </p>
        </div>
      </div>

      {/* Filter by Decision Outcome */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Determination:</span>
          <select
            value={filterDecision}
            onChange={e => setFilterDecision(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Recorded Decisions</option>
            <option value="NO_CONCERN">No Concern Identified</option>
            <option value="REQUIRES_INVESTIGATION">Requires Investigation</option>
            <option value="CONFIRMED_VIOLATION">Confirmed Violation</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{adjudicatedSessions.length}</strong> recorded audit entries
        </span>
      </div>

      {/* Decisions List / Audit Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {adjudicatedSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No Decisions Recorded for Filter</p>
            <p>Adjudicate sessions from the Review Queue or Session Details page to record decisions in this audit log.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {adjudicatedSessions.map(session => {
              const rec = session.decision_record;
              if (!rec) return null;
              return (
                <div
                  key={session.session_id}
                  className="p-5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {rec.session_id}
                      </span>
                      <StatusBadge status={rec.decision} size="sm" />
                      <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Reviewer: {rec.reviewer_id} ({rec.reviewer_role})
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-750 text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white block mb-0.5 text-[11px] uppercase tracking-wider">
                        Reviewer Justification Notes:
                      </span>
                      {rec.notes || 'No accompanying notes provided.'}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-500" />
                        Timestamp: {new Date(rec.decision_timestamp).toLocaleString()}
                      </span>
                      <span>Model Score Intact: {session.risk_score.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSession(session.session_id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-teal-600 dark:text-teal-400 self-start inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Session</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
