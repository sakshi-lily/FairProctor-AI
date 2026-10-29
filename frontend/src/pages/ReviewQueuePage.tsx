import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  CloudSun,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SessionSummaryItem, RiskPriority, ReviewDecisionType } from '../types/proctoring';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  sessions: SessionSummaryItem[];
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
  onRefresh: () => void;
}

export const ReviewQueuePage: React.FC<Props> = ({
  sessions,
  isLoading,
  onSelectSession,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter sessions client-side (or using loaded session state)
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter (session_id)
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesId = session.session_id.toLowerCase().includes(q);
        const matchesAction = session.recommended_action.toLowerCase().includes(q);
        if (!matchesId && !matchesAction) return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && session.risk_level !== priorityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && session.review_status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [sessions, searchTerm, priorityFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Session Review Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritized examination sessions awaiting proctor adjudication &middot; Sorted by priority heuristic
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-500' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Critical Heuristic Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold">Review Priority Disclosure:</strong> Risk scores displayed in this queue 
          are provisional review-priority heuristics designed solely to sort and optimize reviewer attention. 
          They are <em>not empirical probabilities of cheating</em> and must never be used to automatically disqualify candidates.
        </p>
      </div>

      {/* Controls: Search, Priority filter, Status filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pseudonymous session ref (e.g. sess_phone_det_02)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Awaiting Review</option>
              <option value="NO_CONCERN">No Concern</option>
              <option value="REQUIRES_INVESTIGATION">Requires Investigation</option>
              <option value="CONFIRMED_VIOLATION">Confirmed Violation</option>
            </select>
          </div>

        </div>

      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
            <span>Loading examination review queue...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <FileQuestion className="w-6 h-6 text-slate-400" />
            <p className="font-medium text-sm text-slate-700 dark:text-slate-300">No sessions match active criteria</p>
            <p className="text-xs">Adjust your search query or clear priority/status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Session Reference</th>
                  <th className="py-3 px-4">Review Priority</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Environmental Warnings</th>
                  <th className="py-3 px-4">Missing Modalities</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredSessions.map(session => (
                  <tr
                    key={session.session_id}
                    onClick={() => onSelectSession(session.session_id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    
                    {/* Session Reference (pseudonymous) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                          {session.session_id}
                        </span>
                        {session.is_live_candidate_session && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                            {session.candidate_status === 'IN_PROGRESS' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                            <span>LIVE EXAM</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Recorded: {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Review Priority */}
                    <td className="py-3.5 px-4">
                      <RiskBadge priority={session.risk_level} size="sm" />
                    </td>

                    {/* Risk Score (provisional heuristic) */}
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      <span
                        className={
                          session.risk_score >= 70
                            ? 'text-rose-600 dark:text-rose-400'
                            : session.risk_score >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {session.risk_score.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                    </td>

                    {/* Evidence count */}
                    <td className="py-3.5 px-4">
                      {session.evidence_count > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full text-[11px] border border-rose-200 dark:border-rose-900">
                          <AlertCircle className="w-3 h-3" />
                          {session.evidence_count} item{session.evidence_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0 items</span>
                      )}
                    </td>

                    {/* Environmental Warnings */}
                    <td className="py-3.5 px-4">
                      {session.environmental_warnings_count > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full text-[11px] border border-sky-200 dark:border-sky-800">
                          <CloudSun className="w-3 h-3 text-sky-500" />
                          {session.environmental_warnings_count} notice{session.environmental_warnings_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Missing Data Indicators */}
                    <td className="py-3.5 px-4">
                      {session.missing_data && session.missing_data.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          <FileQuestion className="w-3 h-3" />
                          {session.missing_data.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Full telemetry</span>
                      )}
                    </td>

                    {/* Review Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={session.review_status} size="sm" />
                    </td>

                    {/* Action link */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium hover:underline text-xs">
                        Inspect
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
