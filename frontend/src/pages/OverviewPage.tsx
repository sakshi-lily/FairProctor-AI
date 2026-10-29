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
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-teal-900 leading-normal">
          <strong>Review Heuristics:</strong> Demonstration fixtures active. Scores rank reviewer priority, not cheating probabilities.
        </p>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Processed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">
              {stats?.total_sessions ?? sessions.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded</p>
          </div>
        </div>

        {/* Awaiting Review */}
        <div
          onClick={onNavigateToQueue}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Awaiting Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-600 flex items-center justify-between">
              <span>{stats?.awaiting_review ?? 0}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Pending evaluation</p>
          </div>
        </div>

        {/* Priority Review */}
        <div
          onClick={onNavigateToQueue}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-rose-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">High Priority</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-600 flex items-center justify-between">
              <span>{stats?.priority_review ?? highPriority}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Score &ge; 70</p>
          </div>
        </div>

        {/* Insufficient Evidence */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Certainty</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-sky-600">
              {stats?.insufficient_evidence ?? 0}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Missing data</p>
          </div>
        </div>

        {/* Environmental Warnings */}
        <div
          onClick={onNavigateToFairness}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Environment Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <CloudSun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-teal-600 flex items-center justify-between">
              <span>{stats?.environmental_warnings_count ?? 0}</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero penalty</p>
          </div>
        </div>
      </div>

      {/* Engine Status & Safeguards */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Engine Status &amp; Policy Safeguards
              </h2>
              <p className="text-xs text-slate-500">
                Model v{stats?.model_version || '2.0.0'} &middot; Deterministic Safeguards
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            FastAPI {isBackendHealthy ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Shared Room Protection</span>
              Background persons never trigger penalties.
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Invariant Features</span>
              Resilient head pose &amp; symmetry metrics.
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-slate-800">Human Adjudication</span>
              Decisions recorded without mutating heuristics.
            </div>
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Priority Breakdown Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Priority Breakdown</h3>
            <p className="text-xs text-slate-500">Heuristic distribution across sessions</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs mt-1">
            {priorityData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium">
                  {item.name.split(' ')[0]} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Adjudication Status Bar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Adjudication Status</h3>
            <p className="text-xs text-slate-500">Proctor review determinations</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
