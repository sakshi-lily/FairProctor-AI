import React, { useState } from 'react';
import {
  Wifi,
  UserCheck,
  Filter,
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { MOCK_SESSIONS } from '../data/mockData';
import type { CandidateSession } from '../types';

interface InteractiveDashboardProps {
  onOpenAppealModal?: (session: CandidateSession) => void;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ onOpenAppealModal }) => {
  const [selectedSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_SESSIONS[0].timeline[1].id);
  const [verdicts, setVerdicts] = useState<Record<string, string>>({
    [MOCK_SESSIONS[0].id]: 'Auto-Cleared',
    [MOCK_SESSIONS[1].id]: 'Review Required',
    [MOCK_SESSIONS[2].id]: 'Escalated'
  });

  const currentSession =
    MOCK_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_SESSIONS[0];

  const filteredEvents = currentSession.timeline.filter((event) => {
    if (activeCategoryFilter === 'all') return true;
    return event.category === activeCategoryFilter;
  });

  const handleApplyVerdict = (verdictText: string) => {
    setVerdicts((prev) => ({
      ...prev,
      [currentSession.id]: verdictText
    }));
  };

  return (
    <section
      id="interactive-demo"
      style={{
        padding: '85px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E4E7EC'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em',
              color: '#101828'
            }}
          >
            Reviewer triage dashboard.
          </h2>
          <p style={{ fontSize: '1rem', color: '#475467', lineHeight: 1.55, margin: 0 }}>
            Audit multi-signal telemetry with explainable reasoning. Select a candidate to inspect events.
          </p>
        </div>

        {/* Dashboard Shell Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            boxShadow: '0 4px 20px -2px rgba(16, 24, 40, 0.05)',
            overflow: 'hidden'
          }}
        >
          {/* Top Bar: Candidate Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #E4E7EC',
              backgroundColor: '#F7F9FC',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Candidate Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#E8F8EF',
                  border: '1px solid rgba(22, 167, 101, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#16A765',
                  fontSize: '0.8125rem'
                }}
              >
                {currentSession.candidateInitials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#101828' }}>
                    {currentSession.candidateName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.6875rem',
                      color: '#667085',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {currentSession.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475467' }}>
                  {currentSession.examTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr'
            }}
            className="dashboard-columns"
          >
            {/* Left Sidebar: Score, Meters, Actions */}
            <div
              style={{
                backgroundColor: '#F7F9FC',
                borderRight: '1px solid #E4E7EC',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              {/* Risk Score */}
              <div>
                <span style={{ fontSize: '0.75rem', color: '#667085', textTransform: 'uppercase', fontWeight: 600 }}>
                  Risk Score
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.25rem 0 0.4rem 0' }}>
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color:
                        currentSession.integrityRiskScore < 25
                          ? '#16A765'
                          : currentSession.integrityRiskScore < 60
                          ? '#F59E0B'
                          : '#EF4444',
                      lineHeight: 1
                    }}
                  >
                    {currentSession.integrityRiskScore}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#667085' }}>/ 100</span>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color:
                      currentSession.integrityRiskScore < 25
                        ? '#16A765'
                        : currentSession.integrityRiskScore < 60
                        ? '#B45309'
                        : '#DC2626'
                  }}
                >
                  {currentSession.integrityRiskScore < 25
                    ? 'Low Academic Risk'
                    : currentSession.integrityRiskScore < 60
                    ? 'Contextual Review'
                    : 'Investigation Required'}
                </div>
              </div>

              {/* Decoupled Indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Behavioural Risk Meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#101828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={14} color="#16A765" />
                      Behavioural Risk
                    </span>
                    <span style={{ fontWeight: 700, color: '#101828' }}>{currentSession.behaviouralRiskScore}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#E4E7EC', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.behaviouralRiskScore}%`,
                        backgroundColor:
                          currentSession.behaviouralRiskScore < 25
                            ? '#16A765'
                            : currentSession.behaviouralRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                  </div>
                </div>

                {/* Network Stability Meter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#101828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wifi size={14} color={currentSession.environmentalQualityScore < 50 ? '#F59E0B' : '#16A765'} />
                      Network Stability
                    </span>
                    <span style={{ fontWeight: 700, color: '#101828' }}>{currentSession.environmentalQualityScore}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: '#E4E7EC', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.environmentalQualityScore}%`,
                        backgroundColor:
                          currentSession.environmentalQualityScore < 50
                            ? '#F59E0B'
                            : '#16A765'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Verdict & Essential Actions */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #E4E7EC', paddingTop: '1.25rem' }}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#16A765',
                    backgroundColor: '#E8F8EF',
                    border: '1px solid rgba(22, 167, 101, 0.25)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '5px',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  Status: {verdicts[currentSession.id]}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleApplyVerdict('Dismissed')}
                    className="btn btn-outline-white btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <CheckCircle size={14} color="#16A765" />
                    <span>Dismiss</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenAppealModal) onOpenAppealModal(currentSession);
                      handleApplyVerdict('Awaiting Statement');
                    }}
                    className="btn btn-green btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <FileCheck2 size={14} />
                    <span>Request Statement</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Clean Event Timeline */}
            <div style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Category Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E4E7EC', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#667085', fontWeight: 600 }}>
                  <Filter size={13} />
                  <span>Filter:</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'environmental', label: 'Environmental' },
                    { id: 'behavioural', label: 'Behavioural' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      style={{
                        backgroundColor: activeCategoryFilter === cat.id ? '#E8F8EF' : '#FFFFFF',
                        color: activeCategoryFilter === cat.id ? '#16A765' : '#475467',
                        border: `1px solid ${activeCategoryFilter === cat.id ? '#16A765' : '#E4E7EC'}`,
                        borderRadius: '5px',
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simplified Event Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredEvents.map((event) => {
                  const isSelected = event.id === selectedEventId;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#F7F9FC' : '#FFFFFF',
                        border: `1px solid ${isSelected ? '#16A765' : '#E4E7EC'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: '#16A765', fontWeight: 600, minWidth: '60px' }}>
                          {event.timestamp}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#101828' }}>
                            {event.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#475467' }}>
                            {event.description}
                          </div>
                        </div>
                      </div>

                      {/* Short Status Label */}
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          flexShrink: 0,
                          backgroundColor:
                            event.isSuppressed || event.category === 'environmental'
                              ? '#E8F8EF'
                              : event.severity === 'medium' || event.severity === 'high'
                              ? '#FEF3C7'
                              : '#F0F9FF',
                          color:
                            event.isSuppressed || event.category === 'environmental'
                              ? '#16A765'
                              : event.severity === 'medium' || event.severity === 'high'
                              ? '#B45309'
                              : '#0284C7',
                          border: `1px solid ${
                            event.isSuppressed || event.category === 'environmental'
                              ? 'rgba(22, 167, 101, 0.3)'
                              : event.severity === 'medium' || event.severity === 'high'
                              ? '#FCD34D'
                              : '#BAE6FD'
                          }`
                        }}
                      >
                        {event.isSuppressed ? 'Suppressed' : event.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .dashboard-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
