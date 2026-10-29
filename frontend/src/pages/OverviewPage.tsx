import React from 'react';
import {
  Users,
  Clock,
  AlertOctagon,
  FileQuestion,
  CloudSun,
  Cpu,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { OverviewStats, SessionSummaryItem } from '../types/proctoring';

interface Props {
  stats: OverviewStats | null;
  sessions: SessionSummaryItem[];
  isBackendHealthy: boolean;
  onNavigateToQueue: () => void;
  onNavigateToFairness: () => void;
}

export const OverviewPage: React.FC<Props> = ({
  stats,
  sessions,
  isBackendHealthy,
  onNavigateToQueue,
  onNavigateToFairness,
}) => {
  // Priority breakdown for chart
  const highPriority = sessions.filter(s => s.risk_level === 'HIGH').length;
  const mediumPriority = sessions.filter(s => s.risk_level === 'MEDIUM').length;
  const lowPriority = sessions.filter(s => s.risk_level === 'LOW').length;

  const priorityData = [
    { name: 'High Priority (Review First)', value: highPriority, color: '#ef4444' },
    { name: 'Medium Priority (Spot Check)', value: mediumPriority, color: '#f59e0b' },
    { name: 'Low Priority (Nominal)', value: lowPriority, color: '#10b981' },
  ];

  const statusData = [
    {
      status: 'Awaiting Review',
      count: sessions.filter(s => s.review_status === 'PENDING_REVIEW').length,
    },
    {
      status: 'No Concern',
      count: sessions.filter(s => s.review_status === 'NO_CONCERN').length,
    },
    {
      status: 'Investigation',
      count: sessions.filter(s => s.review_status === 'REQUIRES_INVESTIGATION').length,
    },
    {
      status: 'Violation Confirmed',
      count: sessions.filter(s => s.review_status === 'CONFIRMED_VIOLATION').length,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Explicit Demonstration Label Banner */}
      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-teal-900 dark:text-teal-200 space-y-1">
          <p className="font-semibold text-sm">
            Demonstration Environment & Evaluation Fixtures Active
          </p>
          <p>
            All statistics and session records below represent explicitly labelled demonstration fixtures and local engine scores. 
            Risk scores represent <strong>provisional review-priority heuristics</strong> designed to rank reviewer attention, 
            not probabilities of cheating.
          </p>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Processed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Processed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.total_sessions ?? sessions.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-modal sessions recorded
            </p>
          </div>
        </div>

        {/* Awaiting Review */}
        <div
          onClick={onNavigateToQueue}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Awaiting Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>{stats?.awaiting_review ?? 0}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Requires human evaluation
            </p>
          </div>
        </div>

        {/* Priority Review */}
        <div
          onClick={onNavigateToQueue}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-400 dark:hover:border-rose-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Priority Review</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>{stats?.priority_review ?? highPriority}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Top priority triage queue
            </p>
          </div>
        </div>

        {/* Insufficient Evidence */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Insufficient Evidence</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {stats?.insufficient_evidence ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Missing telemetry / low certainty
            </p>
          </div>
        </div>

        {/* Environmental Warnings */}
        <div
          onClick={onNavigateToFairness}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Environmental Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 flex items-center justify-between">
              <span>{stats?.environmental_warnings_count ?? 0}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Shared room / lighting alerts
            </p>
          </div>
        </div>

      </div>

      {/* Engine Status & System Safeguards Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Core Engine & Intelligence Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual Model v{stats?.model_version || '2.0.0'} &middot; Deterministic Environmental Safeguards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isBackendHealthy
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              FastAPI {isBackendHealthy ? 'Online & Responsive' : 'Service Offline'}
            </span>
          </div>
        </div>

        {/* Safeguard summary bullets */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750">
            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-100">
                IM-102 Shared Room Non-Penalization
              </span>
              Background family members or room-sharers do not trigger score deductions.
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750">
            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-100">
                6 Invariant Visual Features
              </span>
              Yaw, pitch, face symmetry & aspect ratios resilient to camera orientation.
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750">
            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-100">
                Independent Reviewer Adjudication
              </span>
              Human decisions are recorded separately without mutating model heuristics.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts: Priority Distribution & Review Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Priority Breakdown Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Review Priority Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prioritization heuristic distribution across active examination sessions
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs mt-2">
            {priorityData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {item.name.split(' ')[0]} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjudication Status Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Human Review Adjudication Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current progress of proctor reviews across flagged sessions
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-10} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            Click &ldquo;Session Review Queue&rdquo; to begin evaluating pending candidate sessions.
          </div>
        </div>

      </div>

    </div>
  );
};
