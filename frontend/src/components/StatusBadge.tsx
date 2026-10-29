import React from 'react';
import { ReviewDecisionType } from '../types/proctoring';
import { Clock, CheckCheck, HelpCircle, ShieldAlert, XCircle } from 'lucide-react';

interface Props {
  status: ReviewDecisionType;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let Icon = Clock;
  let text = 'Pending Review';

  switch (status) {
    case 'NO_CONCERN':
      color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      Icon = CheckCheck;
      text = 'No Concern Identified';
      break;
    case 'REQUIRES_INVESTIGATION':
      color = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      Icon = HelpCircle;
      text = 'Requires Investigation';
      break;
    case 'CONFIRMED_VIOLATION':
      color = 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-400 dark:border-red-800';
      Icon = ShieldAlert;
      text = 'Confirmed Policy Violation';
      break;
    case 'DISMISSED':
      color = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-750';
      Icon = XCircle;
      text = 'Dismissed';
      break;
    case 'PENDING_REVIEW':
    default:
      color = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      Icon = Clock;
      text = 'Awaiting Review';
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
