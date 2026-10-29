import React from 'react';
import { X, Shield, Clock, Layers, AlertCircle, FileText } from 'lucide-react';
import { EvidenceItem } from '../types/proctoring';

interface Props {
  evidence: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceInspectorModal: React.FC<Props> = ({ evidence, onClose }) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Evidence Item Inspection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited telemetry signal details & explanation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Timing
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                {evidence.timestamp_or_interval}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Modality
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                {evidence.source}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Severity
              </span>
              <span
                className={`font-medium mt-0.5 inline-block ${
                  evidence.severity === 'HIGH'
                    ? 'text-rose-600 dark:text-rose-400'
                    : evidence.severity === 'MEDIUM'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {evidence.severity}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Contribution
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                {(evidence.contribution_score * 100).toFixed(0)}% weight
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Machine Learning Explanation & Context
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {evidence.explanation}
            </div>
          </div>

          {/* Relevant Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Governing Proctoring Policy
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {evidence.relevant_policy}
            </p>
          </div>

          {/* Observed Value Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Observed Telemetry Signal Data
            </h4>
            <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto border border-slate-800">
              <pre>{JSON.stringify(evidence.observed_value, null, 2)}</pre>
            </div>
          </div>

          {/* Sensor Limitations */}
          {evidence.data_quality_limitations && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-semibold block mb-0.5">Sensor & Environmental Limitation:</span>
                {evidence.data_quality_limitations}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
