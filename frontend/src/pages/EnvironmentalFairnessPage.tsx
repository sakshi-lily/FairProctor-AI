import React from 'react';
import {
  Scale,
  Users,
  SunDim,
  WifiOff,
  FileQuestion,
  ShieldCheck,
  Info,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { SessionSummaryItem } from '../types/proctoring';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  sessions: SessionSummaryItem[];
  onSelectSession: (sessionId: string) => void;
}

export const EnvironmentalFairnessPage: React.FC<Props> = ({ sessions, onSelectSession }) => {
  // Filter sessions by environmental criteria
  const sharedRoomSessions = sessions.filter(s =>
    s.environmental_warnings.some(w => w.toLowerCase().includes('shared') || w.toLowerCase().includes('person'))
  );

  const poorLightingSessions = sessions.filter(s =>
    s.environmental_warnings.some(w => w.toLowerCase().includes('lighting') || w.toLowerCase().includes('illumination'))
  );

  const networkOrMissingSessions = sessions.filter(
    s => s.missing_data.length > 0 || s.environmental_warnings.some(w => w.toLowerCase().includes('bandwidth') || w.toLowerCase().includes('loss'))
  );

  const insufficientEvidenceSessions = sessions.filter(
    s => s.missing_data.length > 0 || s.confidence_or_uncertainty.toLowerCase().includes('low confidence')
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Environmental Fairness & Safeguards
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Challenge IM-102: Proctoring That Does Not Punish a Shared Room or Resource Disparity
            </p>
          </div>
        </div>
      </div>

      {/* Critical Scientific Fairness Notice */}
      <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-sky-950 dark:text-sky-200 space-y-1 leading-relaxed">
          <p className="font-semibold text-sm">
            Deterministic Environmental Policy Safeguards Active
          </p>
          <p>
            FairProctor-AI explicitly separates <strong>environmental conditions</strong> (ambient lighting, shared living spaces, transient bandwidth drops) from <strong>misconduct indicators</strong>. 
            Under policy IM-102, environmental alerts never add penalty points to a candidate&rsquo;s risk score.
          </p>
          <p className="text-[11px] text-sky-800 dark:text-sky-300 pt-0.5">
            <em>Empirical Audit Notice:</em> In accordance with our independent ML audit, claims of overall false-positive rates (FPR) 
            are strictly omitted for multi-face scenarios because the public benchmark datasets lack verified ground-truth multi-person annotations. 
            Protection is instead guaranteed deterministically through feature-invariance and zero-contribution weight bounds.
          </p>
        </div>
      </div>

      {/* 4 Environmental Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Shared Room */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {sharedRoomSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Shared Room Observations
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Secondary persons in background without candidate collusion are safely filtered.
          </p>
        </div>

        {/* Poor Lighting */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <SunDim className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {poorLightingSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Adverse Lighting Sessions
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Illuminance index &lt;0.20 lowers visual landmark certainty without adding risk points.
          </p>
        </div>

        {/* Bandwidth & Telemetry Drops */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <WifiOff className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {networkOrMissingSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Low Bandwidth / Packet Loss
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Packet drops or missing browser telemetry trigger technical re-checks rather than penalties.
          </p>
        </div>

        {/* Insufficient Evidence */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {insufficientEvidenceSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Requires More Evidence
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Sessions with low confidence bounds cannot be classified without proctor review.
          </p>
        </div>

      </div>

      {/* Categorized Sessions Display */}
      <div className="space-y-6">
        
        {/* Section 1: Shared Room & Multi-Person Sessions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Shared Space & Secondary Person Sessions ({sharedRoomSessions.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              IM-102 Applied (0 Risk Penalty)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sharedRoomSessions.map(session => (
              <div
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {session.session_id}
                  </span>
                  <RiskBadge priority={session.risk_level} size="sm" />
                </div>

                <div className="space-y-1">
                  {session.environmental_warnings.map((warn, idx) => (
                    <p key={idx} className="text-xs text-sky-700 dark:text-sky-300 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                      <span>{warn}</span>
                    </p>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Integrity: {session.integrity_score.toFixed(1)}%</span>
                  <span className="text-teal-600 dark:text-teal-400 font-medium group-hover:underline flex items-center gap-1">
                    Inspect Session
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Adverse Lighting & Low Bandwidth Sessions */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunDim className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Adverse Lighting & Low Bandwidth Sessions ({poorLightingSessions.length + networkOrMissingSessions.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
              Technical Re-Check Guidance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...poorLightingSessions, ...networkOrMissingSessions]
              .filter((s, idx, self) => self.findIndex(t => t.session_id === s.session_id) === idx)
              .map(session => (
                <div
                  key={session.session_id}
                  onClick={() => onSelectSession(session.session_id)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {session.session_id}
                    </span>
                    <StatusBadge status={session.review_status} size="sm" />
                  </div>

                  <div className="space-y-1">
                    {session.environmental_warnings.map((warn, idx) => (
                      <p key={idx} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{warn}</span>
                      </p>
                    ))}
                    {session.missing_data.map((m, idx) => (
                      <p key={idx} className="text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>Missing Modality: {m}</span>
                      </p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Guidance: {session.recommended_action}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-medium group-hover:underline flex items-center gap-1">
                      Inspect Session
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>

    </div>
  );
};
