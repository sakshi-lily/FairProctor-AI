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

  let colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;
  let label = 'Low';

  if (norm === 'HIGH') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = AlertCircle;
    label = 'High';
  } else if (norm === 'MEDIUM') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
    label = 'Medium';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses}`}
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{label}</span>
      </span>
      {showHeuristicNote && (
        <span className="text-[10px] text-slate-500 mt-0.5">
          Priority Score
        </span>
      )}
    </div>
  );
};
