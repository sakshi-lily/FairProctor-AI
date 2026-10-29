import React from 'react';
import { ReviewDecisionType } from '../types/proctoring';
import { Clock, CheckCheck, HelpCircle, ShieldAlert, XCircle } from 'lucide-react';

interface Props {
  status: ReviewDecisionType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Clock;
  let text = 'Pending';

  switch (status) {
    case 'NO_CONCERN':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCheck;
      text = 'No Concern';
      break;
    case 'REQUIRES_INVESTIGATION':
      color = 'bg-sky-50 text-sky-800 border-sky-200';
      Icon = HelpCircle;
      text = 'Investigation';
      break;
    case 'CONFIRMED_VIOLATION':
      color = 'bg-rose-50 text-rose-800 border-rose-200';
      Icon = ShieldAlert;
      text = 'Violation';
      break;
    case 'DISMISSED':
      color = 'bg-slate-100 text-slate-600 border-slate-200';
      Icon = XCircle;
      text = 'Dismissed';
      break;
    case 'PENDING_REVIEW':
    default:
      color = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Clock;
      text = 'Pending';
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${color} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{text}</span>
    </span>
  );
};
