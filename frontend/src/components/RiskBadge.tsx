import React from 'react';
import { RiskPriority } from '../types/proctoring';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  priority: RiskPriority | string;
  showHeuristicNote?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ priority, showHeuristicNote = false, size = 'md' }) => {
  const norm = String(priority).toUpperCase();

  let colorClasses = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  let Icon = CheckCircle2;
  let label = 'Low Priority';

  if (norm === 'HIGH') {
    colorClasses = 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    Icon = AlertCircle;
    label = 'High Priority';
  } else if (norm === 'MEDIUM') {
    colorClasses = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    Icon = AlertTriangle;
    label = 'Medium Priority';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses}`}
        title="Provisional review-priority heuristic; not an empirical probability of cheating"
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{label}</span>
      </span>
      {showHeuristicNote && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          Review-Priority Heuristic
        </span>
      )}
    </div>
  );
};
