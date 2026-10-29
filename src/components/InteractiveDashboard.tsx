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
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E4E7EC'
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
              color: '#101828'
            }}
          >
            Reviewer triage dashboard.
          </h2>
          <p style={{ fontSize: '1rem', color: '#475467', lineHeight: 1.55, margin: 0 }}>
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
              color: '#667085'
            }}
          >
            <Info size={14} color="#16A765" />
            <span>Illustrative demo data · Risk scores are advisory for educators</span>
          </div>
        </div>

        {/* Dashboard Shell Container */}
        <div
          className="card-white"
          style={{
            overflow: 'hidden',
            border: '1px solid #E4E7EC',
            boxShadow: '0 12px 32px rgba(16, 24, 40, 0.08)'
          }}
        >
          {/* Top Bar: Session Info & Ranked Queue */}
          <div
            style={{
              backgroundColor: '#F7F9FC',
              borderBottom: '1px solid #E4E7EC',
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
                  borderRadius: '6px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#101828' }}>
                    {currentSession.candidateName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.7rem',
                      color: '#16A765',
                      backgroundColor: '#E8F8EF',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      border: '1px solid rgba(22, 167, 101, 0.25)'
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

            {/* Session Queue Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#667085', fontWeight: 700 }}>
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
                      backgroundColor: isSelected ? '#E8F8EF' : '#FFFFFF',
                      border: `1px solid ${isSelected ? '#16A765' : '#E4E7EC'}`,
                      color: isSelected ? '#101828' : '#475467',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
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
                            ? '#16A765'
                            : sess.integrityRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                    <span>{sess.candidateName.split(' ')[0]}</span>
                    <span style={{ opacity: 0.8 }}>({sess.integrityRiskScore})</span>
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
                backgroundColor: '#F7F9FC',
                borderRight: '1px solid #E4E7EC',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              {/* Risk Score */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  border: '1px solid #E4E7EC',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: '#667085', textTransform: 'uppercase', fontWeight: 600 }}>
                  Risk Score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem', margin: '0.35rem 0' }}>
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
                  <span style={{ fontSize: '0.85rem', color: '#667085' }}>/ 100</span>
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Behavioural Risk */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', border: '1px solid #E4E7EC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#101828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={13} color="#16A765" />
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

                {/* Environmental Stability */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '0.75rem', border: '1px solid #E4E7EC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#101828', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wifi size={13} color={currentSession.environmentalQualityScore < 50 ? '#F59E0B' : '#16A765'} />
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

              {/* Reviewer Action Verdict */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid #E4E7EC', paddingTop: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#16A765', backgroundColor: '#E8F8EF', border: '1px solid rgba(22, 167, 101, 0.25)', padding: '0.45rem', borderRadius: '4px', marginBottom: '0.65rem', lineHeight: 1.35, fontWeight: 600 }}>
                  {verdicts[currentSession.id]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleApplyVerdict('Dismissed: Confirmed Network Interruption')}
                    className="btn btn-outline-white btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <CheckCircle size={13} color="#16A765" />
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
                    <FileCheck2 size={13} color="#16A765" />
                    <span>Request Statement</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Timeline & Deep Inspector */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#FFFFFF' }}>
              {/* Category Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #E4E7EC', paddingBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475467', fontWeight: 600 }}>
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
                        backgroundColor: activeCategoryFilter === cat.id ? '#16A765' : '#F7F9FC',
                        color: activeCategoryFilter === cat.id ? '#FFFFFF' : '#475467',
                        border: `1px solid ${activeCategoryFilter === cat.id ? '#16A765' : '#E4E7EC'}`,
                        borderRadius: '4px',
                        padding: '0.25rem 0.55rem',
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
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#F7F9FC' : '#FFFFFF',
                        border: `1px solid ${isSelected ? '#16A765' : '#E4E7EC'}`,
                        cursor: 'pointer',
                        display: 'grid',
                        gridTemplateColumns: '72px 1fr auto',
                        gap: '0.85rem',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div className="font-mono" style={{ fontSize: '0.75rem', color: '#16A765', fontWeight: 600 }}>
                        {event.timestamp}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#101828' }}>
                            {event.title}
                          </span>
                          {event.isSuppressed && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, backgroundColor: '#E8F8EF', color: '#16A765', border: '1px solid rgba(22, 167, 101, 0.25)', padding: '1px 5px', borderRadius: '3px' }}>
                              SUPPRESSED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475467' }}>{event.description}</div>
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
                  backgroundColor: '#F7F9FC',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 700, color: '#101828' }}>
                    <Sparkles size={14} color="#16A765" />
                    <span>Signal Rationale: {activeEvent.title}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.6875rem', color: '#667085' }}>{activeEvent.id}</span>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {activeEvent.metrics.map((m, i) => (
                    <div key={i} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      <span style={{ color: '#667085' }}>{m.label}: </span>
                      <strong style={{ color: '#16A765' }}>{m.value}</strong>
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#475467', margin: 0, lineHeight: 1.5 }}>
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
