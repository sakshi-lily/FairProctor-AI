import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Layers,
  Clock,
  Copy,
  Check,
  FileText,
  Code,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface ParsedExplanation {
  isStructured: boolean;
  sessionId?: string;
  reviewPriority?: string;
  riskScore?: string;
  integrityScore?: string;
  engineVersion?: string;
  operationalPrinciple?: string;
  riskFactors: Array<{ name: string; points: string }>;
  missingModalities?: string;
  environmentalSafeguards: string[];
  evidenceTimelineCount?: number;
  evidenceItems: Array<{
    timeOrInterval: string;
    source: string;
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    explanation: string;
  }>;
  fallbackText: string;
}

export function parseMLExplanation(rawText: string): ParsedExplanation {
  if (!rawText) {
    return {
      isStructured: false,
      riskFactors: [],
      environmentalSafeguards: [],
      evidenceItems: [],
      fallbackText: 'No explanation provided.',
    };
  }

  const isStructured =
    rawText.includes('=== FairProctor-AI Reviewer Summary') ||
    rawText.includes('Review Priority:') ||
    rawText.includes('Operational Principle:') ||
    rawText.includes('Risk Breakdown by Factor:');

  if (!isStructured) {
    return {
      isStructured: false,
      riskFactors: [],
      environmentalSafeguards: [],
      evidenceItems: [],
      fallbackText: rawText,
    };
  }

  // 1. Session ID
  const sessionMatch = rawText.match(/Session:\s*([a-zA-Z0-9_-]+)/);
  const sessionId = sessionMatch ? sessionMatch[1] : undefined;

  // 2. Review Priority & Scores
  const priorityMatch = rawText.match(/Review Priority:\s*([A-Za-z]+)/i);
  const reviewPriority = priorityMatch ? priorityMatch[1].toUpperCase() : undefined;

  const riskScoreMatch = rawText.match(/Risk Score:\s*([\d.]+)\/100/i);
  const riskScore = riskScoreMatch ? riskScoreMatch[1] : undefined;

  const integrityScoreMatch = rawText.match(/Integrity Score:\s*([\d.]+)\/100/i);
  const integrityScore = integrityScoreMatch ? integrityScoreMatch[1] : undefined;

  const engineVersionMatch = rawText.match(/Engine Version:\s*([^=\n]+)/i);
  const engineVersion = engineVersionMatch ? engineVersionMatch[1].trim() : undefined;

  // 3. Operational Principle
  let operationalPrinciple: string | undefined;
  const opMatch = rawText.match(/Operational Principle:\s*([\s\S]*?)(?=(Risk Breakdown by Factor:|Missing Modalities:|Environmental Safeguards|Evidence Timeline|$))/i);
  if (opMatch && opMatch[1]) {
    operationalPrinciple = opMatch[1].trim();
  }

  // 4. Risk Breakdown by Factor
  const riskFactors: Array<{ name: string; points: string }> = [];
  const rbMatch = rawText.match(/Risk Breakdown by Factor:\s*([\s\S]*?)(?=(Missing Modalities:|Environmental Safeguards|Evidence Timeline|$))/i);
  if (rbMatch && rbMatch[1]) {
    const factorLines = rbMatch[1].split(/(?=- )/);
    factorLines.forEach((fl) => {
      const lineMatch = fl.match(/-\s*([A-Za-z0-9_ ]+):\s*([+-]?[\d.]+\s*pts)/i);
      if (lineMatch) {
        riskFactors.push({
          name: lineMatch[1].trim(),
          points: lineMatch[2].trim(),
        });
      }
    });
  }

  // 5. Missing Modalities
  let missingModalities: string | undefined;
  const mmMatch = rawText.match(/Missing Modalities:\s*([^\n(]+)/i);
  if (mmMatch && mmMatch[1]) {
    missingModalities = mmMatch[1].trim();
  }

  // 6. Environmental Safeguards
  const environmentalSafeguards: string[] = [];
  const envMatch = rawText.match(/Environmental Safeguards & Mitigations:\s*([\s\S]*?)(?=(Evidence Timeline|$))/i);
  if (envMatch && envMatch[1]) {
    const parts = envMatch[1].split(/\[Context\]/i);
    parts.forEach((p) => {
      const clean = p.trim();
      if (clean) environmentalSafeguards.push(clean);
    });
  }

  // 7. Evidence Timeline
  const evidenceItems: Array<{
    timeOrInterval: string;
    source: string;
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    explanation: string;
  }> = [];

  const evidenceTimelineCountMatch = rawText.match(/Evidence Timeline\s*\(([0-9]+)\s*traceable flags?\):/i);
  const evidenceTimelineCount = evidenceTimelineCountMatch ? parseInt(evidenceTimelineCountMatch[1], 10) : undefined;

  const evSectionMatch = rawText.match(/Evidence Timeline[^\n:]*:\s*([\s\S]*)$/i);
  if (evSectionMatch && evSectionMatch[1]) {
    const evText = evSectionMatch[1].trim();
    const itemRegex = /\[([^\]]+)\]\s*\(([^)]+)\)\s*([A-Za-z0-9_]+)\s*\[([A-Za-z]+)\]:\s*([\s\S]*?)(?=\[[^\]]+\]\s*\([^)]+\)|$)/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(evText)) !== null) {
      const sev = match[4].toUpperCase();
      evidenceItems.push({
        timeOrInterval: match[1].trim(),
        source: match[2].trim(),
        type: match[3].trim(),
        severity: (['HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(sev) ? sev : 'INFO') as any,
        explanation: match[5].trim(),
      });
    }
  }

  return {
    isStructured: true,
    sessionId,
    reviewPriority,
    riskScore,
    integrityScore,
    engineVersion,
    operationalPrinciple,
    riskFactors,
    missingModalities,
    environmentalSafeguards,
    evidenceTimelineCount,
    evidenceItems,
    fallbackText: rawText,
  };
}

interface Props {
  explanation: string;
  modelVersion?: string;
  policyVersion?: string;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export const FormattedMLExplanation: React.FC<Props> = ({
  explanation,
  modelVersion = '2.0.0',
  policyVersion = '1.0.0',
  onToggleExpand,
  isExpanded = false,
}) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = parseMLExplanation(explanation);

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" />
          <span>ML Explanation &amp; Reviewer Briefing</span>
        </h3>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
            <button
              onClick={() => setViewMode('formatted')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'formatted'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Formatted</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'raw'
                  ? 'bg-white text-teal-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Raw Text</span>
            </button>
          </div>

          {/* Expand/Collapse Toggle Button */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              title={isExpanded ? 'Collapse to standard view' : 'Expand full width'}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors hidden sm:inline-flex"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-indigo-600" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy explanation briefing to clipboard"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {viewMode === 'raw' || !parsed.isStructured ? (
        /* Raw Preformatted View or Fallback */
        <div className="space-y-3">
          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96">
            {parsed.fallbackText}
          </pre>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Model: <strong>v{modelVersion}</strong></span>
            <span>Policy: <strong>{policyVersion}</strong></span>
          </div>
        </div>
      ) : (
        /* Structured Formatted View */
        <div className="space-y-4">
          {/* Priority & Scores Card Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-teal-50/40 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border shadow-2xs ${
                  parsed.reviewPriority === 'HIGH'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : parsed.reviewPriority === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {parsed.reviewPriority === 'HIGH' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                ) : parsed.reviewPriority === 'MEDIUM' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Review Priority: {parsed.reviewPriority || 'LOW'}</span>
              </span>

              {parsed.sessionId && (
                <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {parsed.sessionId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              {parsed.riskScore && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Risk: <strong className="text-slate-900">{parsed.riskScore}</strong> / 100
                </span>
              )}
              {parsed.integrityScore && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                  Integrity: <strong className="text-teal-700">{parsed.integrityScore}</strong> / 100
                </span>
              )}
            </div>
          </div>

          {/* Operational Principle Callout */}
          {parsed.operationalPrinciple && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>Operational Principle</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-600 pl-5">
                {parsed.operationalPrinciple}
              </p>
            </div>
          )}

          {/* Risk Breakdown by Factor */}
          {parsed.riskFactors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Risk Breakdown by Factor</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {parsed.riskFactors.map((rf, idx) => {
                  const pointsNum = parseFloat(rf.points.replace(/[^0-9.-]/g, '')) || 0;
                  const isElevated = pointsNum > 0;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isElevated
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <span className="font-medium text-slate-700 text-[11px] truncate pr-2">
                        {rf.name}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isElevated
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {rf.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Environmental Safeguards & Mitigations (Policy IM-102) */}
          {parsed.environmentalSafeguards.length > 0 && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Environmental Safeguards &amp; Mitigations (Policy IM-102)</span>
              </div>
              <div className="space-y-1.5 pl-5">
                {parsed.environmentalSafeguards.map((w, idx) => (
                  <div key={idx} className="text-[11px] text-emerald-900 leading-relaxed flex items-start gap-1.5">
                    <span className="font-bold text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800 mt-0.5 shrink-0 font-mono">
                      Safe
                    </span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Timeline Traceable Flags */}
          {parsed.evidenceItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Evidence Timeline</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {parsed.evidenceItems.length} Traceable Flags
                </span>
              </div>

              <div className="space-y-2">
                {parsed.evidenceItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700">
                          ⏱️ {item.timeOrInterval}
                        </span>
                        <span className="font-mono text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold">
                          {item.source}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase font-mono ${
                            item.severity === 'HIGH'
                              ? 'bg-rose-100 text-rose-900 border-rose-300'
                              : item.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-sky-100 text-sky-900 border-sky-300'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <span className="font-bold text-[11px] text-slate-900">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-1">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card Footer */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span>Model: <strong className="text-slate-700 font-mono">v{modelVersion}</strong></span>
              <span>Policy: <strong className="text-slate-700 font-mono">{policyVersion}</strong></span>
              {parsed.engineVersion && (
                <span className="text-slate-400">({parsed.engineVersion})</span>
              )}
            </div>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
              Deterministic Explainability Audit Trail
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
