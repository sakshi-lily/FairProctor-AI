import React from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  onRetry: () => void;
  isRetrying: boolean;
}

export const BackendOfflineAlert: React.FC<Props> = ({ onRetry, isRetrying }) => {
  return (
    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 shadow-sm animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-rose-900">
              Backend Offline (Port 8000)
            </h4>
            <p className="text-[11px] text-rose-700">
              Using seeded fixtures. Start local FastAPI to enable live scoring.
            </p>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs self-start sm:self-center transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
};
