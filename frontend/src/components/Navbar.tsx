import React from 'react';
import { Shield, Sun, Moon, UserCheck, GraduationCap, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useProctorRole } from '../context/ProctorRoleContext';
import { ReviewerRole } from '../types/proctoring';

interface Props {
  isBackendHealthy: boolean;
  modelVersion?: string;
  onRefreshHealth: () => void;
  appMode: 'reviewer' | 'candidate';
  onToggleAppMode: (mode: 'reviewer' | 'candidate') => void;
}

export const Navbar: React.FC<Props> = ({
  isBackendHealthy,
  modelVersion = '2.0.0',
  onRefreshHealth,
  appMode,
  onToggleAppMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { activeRole, setActiveRole, setReviewerId, isLeadProctor } = useProctorRole();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as ReviewerRole;
    setActiveRole(role);
    if (role === 'lead_proctor') {
      setReviewerId('rev_lead_01');
    } else if (role === 'auditor') {
      setReviewerId('rev_auditor_02');
    } else {
      setReviewerId('rev_staff_409');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                FairProctor-AI
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded border border-teal-300 dark:border-teal-800">
                v{modelVersion}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {appMode === 'candidate' ? 'Candidate Examination Portal' : 'Examination Integrity & Fairness Reviewer'}
            </p>
          </div>
        </div>

        {/* Portal Switcher Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => onToggleAppMode('reviewer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              appMode === 'reviewer'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reviewer Dashboard</span>
            <span className="sm:hidden">Reviewer</span>
          </button>

          <button
            onClick={() => onToggleAppMode('candidate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              appMode === 'candidate'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Candidate Exam</span>
            <span className="sm:hidden">Exam</span>
          </button>
        </div>

        {/* Status, Role Selector, Theme */}
        <div className="flex items-center gap-3">
          
          {/* Backend Status indicator */}
          <button
            onClick={onRefreshHealth}
            title="Click to check backend connectivity (FastAPI :8000)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">
              {isBackendHealthy ? 'FastAPI Online' : 'Backend Offline'}
            </span>
          </button>

          {/* Active Reviewer Role Switcher (Visible in reviewer mode) */}
          {appMode === 'reviewer' && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-slate-500 dark:text-slate-400">Role:</span>
              <select
                value={activeRole}
                onChange={handleRoleChange}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="lead_proctor" className="bg-white dark:bg-slate-900">
                  Lead Proctor
                </option>
                <option value="reviewer" className="bg-white dark:bg-slate-900">
                  Reviewer
                </option>
                <option value="auditor" className="bg-white dark:bg-slate-900">
                  Auditor
                </option>
              </select>
              {isLeadProctor && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Auth
                </span>
              )}
            </div>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
