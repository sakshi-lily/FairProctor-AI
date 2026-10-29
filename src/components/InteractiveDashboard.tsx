import React, { useState } from 'react';
import {
  Wifi,
  UserCheck,
  Filter,
  CheckCircle,
  Info,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import { MOCK_SESSIONS } from '../data/mockData';
import type { CandidateSession, EvidenceEvent } from '../types';

interface InteractiveDashboardProps {
  onOpenAppealModal?: (session: CandidateSession) => void;
}

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ onOpenAppealModal }) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_SESSIONS[0].timeline[1].id);
  const [verdicts, setVerdicts] = useState<Record<string, string>>({
    [MOCK_SESSIONS[0].id]: 'Auto-Cleared: Environmental Latency Suppressed',
    [MOCK_SESSIONS[1].id]: 'Review: Sanctioned Formula PDF Verified',
    [MOCK_SESSIONS[2].id]: 'Escalated: High-Volume Paste Audit'
  });

  const currentSession =
    MOCK_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_SESSIONS[0];

  const filteredEvents = currentSession.timeline.filter((event) => {
    if (activeCategoryFilter === 'all') return true;
    return event.category === activeCategoryFilter;
  });

  const activeEvent: EvidenceEvent =
    currentSession.timeline.find((ev) => ev.id === selectedEventId) ||
    currentSession.timeline[0];

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
        position: 'relative',
        backgroundColor: '#03102F',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Reviewer triage dashboard.
          </h2>
          <p style={{ fontSize: '1rem', color: '#B8C4D9', lineHeight: 1.55, margin: 0 }}>
            Audit multi-signal telemetry with explainable reasoning. Select a session below to inspect live records.
          </p>

          {/* Compact Demo Notice */}
          <div
            style={{
              marginTop: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.75rem',
              color: '#8696B2'
            }}
          >
            <Info size={14} color="#18B86A" />
            <span>Illustrative demo data · Risk scores are advisory for educators</span>
          </div>
        </div>

        {/* Dashboard Shell Container */}
        <div
          className="card-navy"
          style={{
            overflow: 'hidden',
            border: '1px solid rgba(24, 184, 106, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Top Bar: Session Info & Ranked Queue */}
          <div
            style={{
              backgroundColor: '#061744',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.85rem'
            }}
          >
            {/* Session Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '5px',
                  backgroundColor: '#0E2463',
                  border: '1px solid rgba(24, 184, 106, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#18B86A',
                  fontSize: '0.8125rem'
                }}
              >
                {currentSession.candidateInitials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#FFFFFF' }}>
                    {currentSession.candidateName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.7rem',
                      color: '#18B86A',
                      backgroundColor: 'rgba(24, 184, 106, 0.12)',
                      padding: '1px 6px',
                      borderRadius: '3px'
                    }}
                  >
                    {currentSession.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#B8C4D9' }}>
                  {currentSession.examTitle}
                </div>
              </div>
            </div>

            {/* Session Queue Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#8696B2', fontWeight: 700 }}>
                QUEUE:
              </span>
              {MOCK_SESSIONS.map((sess) => {
                const isSelected = sess.id === currentSession.id;
                return (
                  <button
                    key={sess.id}
                    onClick={() => {
                      setSelectedSessionId(sess.id);
                      setSelectedEventId(sess.timeline[0]?.id || '');
                    }}
                    style={{
                      backgroundColor: isSelected ? '#0E2463' : 'rgba(10, 30, 84, 0.6)',
                      border: `1px solid ${isSelected ? '#18B86A' : 'rgba(255,255,255,0.1)'}`,
                      color: isSelected ? '#FFFFFF' : '#B8C4D9',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor:
                          sess.integrityRiskScore < 25
                            ? '#18B86A'
                            : sess.integrityRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                    <span>{sess.candidateName.split(' ')[0]}</span>
                    <span style={{ opacity: 0.75 }}>({sess.integrityRiskScore})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 300px) 1fr',
              minHeight: '520px'
            }}
            className="dashboard-columns"
          >
            {/* Left Sidebar: Scores & Actions */}
            <div
              style={{
                backgroundColor: '#061744',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              {/* Risk Score */}
              <div
                style={{
                  backgroundColor: '#0A1E54',
                  borderRadius: '6px',
                  padding: '1rem',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: '#B8C4D9', textTransform: 'uppercase' }}>
                  Risk Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', margin: '0.35rem 0' }}>
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color:
                        currentSession.integrityRiskScore < 25
                          ? '#18B86A'
                          : currentSession.integrityRiskScore < 60
                          ? '#F59E0B'
                          : '#EF4444',
                      lineHeight: 1
                    }}
                  >
                    {currentSession.integrityRiskScore}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#8696B2' }}>/ 100</span>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color:
                      currentSession.integrityRiskScore < 25
                        ? '#18B86A'
                        : currentSession.integrityRiskScore < 60
                        ? '#F59E0B'
                        : '#EF4444'
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Behavioural Risk */}
                <div style={{ backgroundColor: '#0A1E54', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={13} color="#18B86A" />
                      Behavioural Risk
                    </span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{currentSession.behaviouralRiskScore}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.behaviouralRiskScore}%`,
                        backgroundColor:
                          currentSession.behaviouralRiskScore < 25
                            ? '#18B86A'
                            : currentSession.behaviouralRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                  </div>
                </div>

                {/* Environmental Stability */}
                <div style={{ backgroundColor: '#0A1E54', borderRadius: '6px', padding: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wifi size={13} color={currentSession.environmentalQualityScore < 50 ? '#F59E0B' : '#18B86A'} />
                      Network Stability
                    </span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{currentSession.environmentalQualityScore}%</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.environmentalQualityScore}%`,
                        backgroundColor:
                          currentSession.environmentalQualityScore < 50
                            ? '#F59E0B'
                            : '#18B86A'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Reviewer Action Verdict */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#18B86A', backgroundColor: 'rgba(24, 184, 106, 0.12)', padding: '0.45rem', borderRadius: '4px', marginBottom: '0.65rem', lineHeight: 1.35 }}>
                  {verdicts[currentSession.id]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleApplyVerdict('Dismissed: Confirmed Network Interruption')}
                    className="btn btn-outline-white btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <CheckCircle size={13} color="#18B86A" />
                    <span>Dismiss as Environmental</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenAppealModal) onOpenAppealModal(currentSession);
                      handleApplyVerdict('Awaiting Candidate Response (48h Window)');
                    }}
                    className="btn btn-outline-white btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <FileCheck2 size={13} color="#79F2C0" />
                    <span>Request Statement</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Timeline & Deep Inspector */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#03102F' }}>
              {/* Category Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#B8C4D9', fontWeight: 600 }}>
                  <Filter size={13} />
                  <span>Filters:</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'environmental', label: 'Environmental' },
                    { id: 'behavioural', label: 'Behavioural' },
                    { id: 'client', label: 'DOM / Window' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      style={{
                        backgroundColor: activeCategoryFilter === cat.id ? '#18B86A' : 'rgba(10, 30, 84, 0.6)',
                        color: activeCategoryFilter === cat.id ? '#FFFFFF' : '#B8C4D9',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredEvents.map((event) => {
                  const isSelected = event.id === activeEvent.id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '5px',
                        backgroundColor: isSelected ? '#0A1E54' : 'rgba(10, 30, 84, 0.4)',
                        border: `1px solid ${isSelected ? '#18B86A' : 'rgba(255, 255, 255, 0.08)'}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr auto',
                        gap: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#18B86A', fontWeight: 600 }}>
                        {event.timestamp}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#FFFFFF' }}>
                            {event.title}
                          </span>
                          {event.isSuppressed && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, backgroundColor: 'rgba(24, 184, 106, 0.15)', color: '#18B86A', padding: '1px 5px', borderRadius: '3px' }}>
                              SUPPRESSED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#B8C4D9' }}>{event.description}</div>
                      </div>
                      <span className={`badge ${event.category === 'environmental' ? 'badge-warning' : 'badge-green'}`} style={{ fontSize: '0.625rem' }}>
                        {event.category}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Explainable Rationale Box */}
              <div
                style={{
                  backgroundColor: '#0A1E54',
                  border: '1px solid rgba(24, 184, 106, 0.3)',
                  borderRadius: '6px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                    <Sparkles size={14} color="#18B86A" />
                    <span>Signal Rationale: {activeEvent.title}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: '#8696B2' }}>{activeEvent.id}</span>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {activeEvent.metrics.map((m, i) => (
                    <div key={i} style={{ backgroundColor: '#061744', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      <span style={{ color: '#8696B2' }}>{m.label}: </span>
                      <strong style={{ color: '#18B86A' }}>{m.value}</strong>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                  {activeEvent.aiRationale}
                </p>
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
