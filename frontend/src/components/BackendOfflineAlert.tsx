import React from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

interface Props {
  onRetry: () => void;
  isRetrying: boolean;
}

export const BackendOfflineAlert: React.FC<Props> = ({ onRetry, isRetrying }) => {
  return (
    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 shadow-sm animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              FastAPI Intelligence Backend Offline
            </h4>
            <p className="text-rose-700 dark:text-rose-300">
              Unable to reach local FastAPI service at <code>http://localhost:8000</code>. Demonstration fixtures are active locally.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-rose-100/70 dark:bg-rose-950 px-2.5 py-1 rounded text-rose-800 dark:text-rose-300 w-fit mt-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>&amp; &quot;.\.venv\Scripts\python.exe&quot; -m uvicorn fairproctor.api.service:create_app --factory --port 8000</span>
            </div>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium self-start sm:self-center transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Connecting...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
};
