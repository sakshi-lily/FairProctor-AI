import React from 'react';
import { Shield, GraduationCap, LayoutDashboard, Globe } from 'lucide-react';

interface Props {
  isBackendHealthy?: boolean;
  modelVersion?: string;
  onRefreshHealth?: () => void;
  appMode: 'landing' | 'reviewer' | 'candidate';
  onToggleAppMode: (mode: 'landing' | 'reviewer' | 'candidate') => void;
  isExamActive?: boolean;
}

export const Navbar: React.FC<Props> = ({
  modelVersion = '2.0.0',
  appMode,
  onToggleAppMode,
  isExamActive = false,
}) => {
  return (
    <header className={`sticky top-0 z-40 w-full transition-colors ${
      isExamActive
        ? 'bg-transparent border-b border-slate-200/50'
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200'
    }`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 ${
        isExamActive ? 'h-11 sm:h-12' : 'h-16'
      }`}>
        
        {/* Brand */}
        <div
          onClick={() => {
            if (!isExamActive) {
              onToggleAppMode('landing');
            }
          }}
          className={`flex items-center gap-2.5 sm:gap-3 ${
            isExamActive ? 'cursor-default select-none' : 'cursor-pointer group'
          }`}
          title={isExamActive ? 'FairProctor-AI Live Examination' : 'Go to FairProctor AI Landing Page'}
        >
          <div className={`rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
            isExamActive ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
          }`}>
            <Shield className={`${isExamActive ? 'w-4 h-4' : 'w-5 h-5'} stroke-[2.5]`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`${isExamActive ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold tracking-tight text-slate-900 leading-none`}>
                FairProctor-AI
              </h1>
              {!isExamActive && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-800 rounded border border-teal-200">
                  v{modelVersion}
                </span>
              )}
            </div>
            {!isExamActive && (
              <p className="text-xs text-slate-500 mt-0.5">
                {appMode === 'candidate'
                  ? 'Candidate Portal'
                  : appMode === 'landing'
                  ? 'Enterprise Overview'
                  : 'Reviewer Dashboard'}
              </p>
            )}
          </div>
        </div>

        {/* Portal Switcher Pill */}
        {!isExamActive && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => onToggleAppMode('landing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                appMode === 'candidate'
                  ? 'bg-white text-teal-600 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Candidate</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
