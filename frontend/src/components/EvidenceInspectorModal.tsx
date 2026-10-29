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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Evidence Details
              </h3>
              <p className="text-xs text-slate-500">
                Telemetry signal and explanation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Timing
              </span>
              <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                {evidence.timestamp_or_interval}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Source
              </span>
              <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                {evidence.source}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Severity
              </span>
              <span
                className={`font-semibold mt-0.5 inline-block ${
                  evidence.severity === 'HIGH'
                    ? 'text-rose-600'
                    : evidence.severity === 'MEDIUM'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {evidence.severity}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Weight
              </span>
              <span className="font-medium text-slate-800 mt-0.5 block">
                {(evidence.contribution_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              ML Context
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700">
              {evidence.explanation}
            </div>
          </div>

          {/* Relevant Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Policy Rule
            </h4>
            <p className="text-xs text-slate-700 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {evidence.relevant_policy}
            </p>
          </div>

          {/* Observed Value Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Raw Signal Data
            </h4>
            <div className="bg-slate-50 text-slate-800 rounded-xl p-3 font-mono text-xs overflow-x-auto border border-slate-200">
              <pre>{JSON.stringify(evidence.observed_value, null, 2)}</pre>
            </div>
          </div>

          {/* Sensor Limitations */}
          {evidence.data_quality_limitations && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <div>
                <strong className="block mb-0.5">Sensor Limitation:</strong>
                {evidence.data_quality_limitations}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex justify-end bg-slate-50/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
