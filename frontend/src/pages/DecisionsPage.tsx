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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Decision Audit Log</h2>
            <p className="text-xs text-slate-500">
              Proctor adjudications decoupled from model heuristics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Reviewer:</span>
          <span className="font-mono font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
            {reviewerId} ({activeRole})
          </span>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-700 leading-normal">
          <strong>Adjudication Policy:</strong> The engine never disqualifies candidates. All determinations are human-made. Violations require Lead Proctor authorization.
        </p>
      </div>

      {/* Filter by Decision Outcome */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter:</span>
          <select
            value={filterDecision}
            onChange={e => setFilterDecision(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Recorded</option>
            <option value="NO_CONCERN">No Concern</option>
            <option value="REQUIRES_INVESTIGATION">Investigation</option>
            <option value="CONFIRMED_VIOLATION">Violation</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          <strong>{adjudicatedSessions.length}</strong> audit records
        </span>
      </div>

      {/* Decisions List / Audit Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {adjudicatedSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-1">
            <CheckSquare className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No recorded decisions</p>
            <p>Adjudicate sessions from the Review Queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adjudicatedSessions.map(session => {
              const rec = session.decision_record;
              if (!rec) return null;
              return (
                <div
                  key={session.session_id}
                  className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {rec.session_id}
                      </span>
                      <StatusBadge status={rec.decision} size="sm" />
                      <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
                        {rec.reviewer_id} ({rec.reviewer_role})
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      {rec.notes || 'No accompanying notes.'}
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-600" />
                        {new Date(rec.decision_timestamp).toLocaleString()}
                      </span>
                      <span>Score: {session.risk_score.toFixed(1)} / 100</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSession(session.session_id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-medium text-teal-600 self-start inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>Inspect</span>
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
