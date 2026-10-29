import React from 'react';
import { Shield, GraduationCap, LayoutDashboard, Globe } from 'lucide-react';

interface Props {
  isBackendHealthy?: boolean;
  modelVersion?: string;
  onRefreshHealth?: () => void;
  appMode: 'landing' | 'reviewer' | 'candidate';
  onToggleAppMode: (mode: 'landing' | 'reviewer' | 'candidate') => void;
}

export const Navbar: React.FC<Props> = ({
  modelVersion = '2.0.0',
  appMode,
  onToggleAppMode,
}) => {

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div
          onClick={() => onToggleAppMode('landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Go to FairProctor AI Landing Page"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                FairProctor-AI
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-800 rounded border border-teal-200">
                v{modelVersion}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {appMode === 'candidate'
                ? 'Candidate Portal'
                : appMode === 'landing'
                ? 'Enterprise Overview'
                : 'Reviewer Dashboard'}
            </p>
          </div>
        </div>

        {/* Portal Switcher Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
          <button
            onClick={() => onToggleAppMode('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              appMode === 'landing'
                ? 'bg-white text-teal-600 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Landing</span>
          </button>

          <button
            onClick={() => onToggleAppMode('reviewer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              appMode === 'reviewer'
                ? 'bg-white text-teal-600 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Reviewer</span>
          </button>

          <button
            onClick={() => onToggleAppMode('candidate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              appMode === 'candidate'
                ? 'bg-white text-teal-600 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Candidate</span>
          </button>
        </div>
      </div>
    </header>
  );
};
