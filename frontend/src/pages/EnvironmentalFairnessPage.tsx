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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Environmental Fairness</h2>
            <p className="text-xs text-slate-500">
              Policy IM-102 room-sharing &amp; resource disparity protections.
            </p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-sky-950 leading-normal">
          <strong>Policy IM-102:</strong> Environmental conditions (lighting, shared rooms, transient drops) carry zero risk penalties.
        </p>
      </div>

      {/* 4 Environmental Pillars Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Shared Room */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900">
              {sharedRoomSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900">Shared Rooms</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Background persons safely filtered.
          </p>
        </div>

        {/* Poor Lighting */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <SunDim className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900">
              {poorLightingSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900">Low Lighting</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Low lux lowers certainty; 0 penalty.
          </p>
        </div>

        {/* Bandwidth & Telemetry Drops */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <WifiOff className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900">
              {networkOrMissingSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900">Network Drops</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Treated as technical issues.
          </p>
        </div>

        {/* Insufficient Evidence */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileQuestion className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold font-mono text-slate-900">
              {insufficientEvidenceSessions.length}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-slate-900">Low Certainty</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Proctor review required.
          </p>
        </div>
      </div>

      {/* Categorized Sessions Display */}
      <div className="space-y-5">
        {/* Section 1: Shared Room & Multi-Person Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Shared Space Sessions ({sharedRoomSessions.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Zero Penalty (IM-102)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {sharedRoomSessions.map(session => (
              <div
                key={session.session_id}
                onClick={() => onSelectSession(session.session_id)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-500/50 hover:bg-slate-50/50 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {session.session_id}
                  </span>
                  <RiskBadge priority={session.risk_level} size="sm" />
                </div>

                <div className="space-y-1">
                  {session.environmental_warnings.map((warn, idx) => (
                    <p key={idx} className="text-xs text-sky-700 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                      <span>{warn}</span>
                    </p>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Integrity: {session.integrity_score.toFixed(1)}%</span>
                  <span className="text-teal-600 font-medium group-hover:underline flex items-center gap-1">
                    Inspect
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Adverse Lighting & Low Bandwidth Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunDim className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Lighting &amp; Network Sessions ({poorLightingSessions.length + networkOrMissingSessions.length})
              </h3>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Technical Re-Check
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[...poorLightingSessions, ...networkOrMissingSessions]
              .filter((s, idx, self) => self.findIndex(t => t.session_id === s.session_id) === idx)
              .map(session => (
                <div
                  key={session.session_id}
                  onClick={() => onSelectSession(session.session_id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-500/50 hover:bg-slate-50/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {session.session_id}
                    </span>
                    <StatusBadge status={session.review_status} size="sm" />
                  </div>

                  <div className="space-y-1">
                    {session.environmental_warnings.map((warn, idx) => (
                      <p key={idx} className="text-xs text-amber-700 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{warn}</span>
                      </p>
                    ))}
                    {session.missing_data.map((m, idx) => (
                      <p key={idx} className="text-xs text-rose-600 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        <span>Missing: {m}</span>
                      </p>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{session.recommended_action}</span>
                    <span className="text-teal-600 font-medium group-hover:underline flex items-center gap-1">
                      Inspect
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
