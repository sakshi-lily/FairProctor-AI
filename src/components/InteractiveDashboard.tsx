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
    [MOCK_SESSIONS[0].id]: 'Auto-Cleared: Environmental Faults Isolated',
    [MOCK_SESSIONS[1].id]: 'Pending Review: Permitted Formula Tab Confirmed',
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
        paddingTop: '90px',
        paddingBottom: '100px',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
          <div
            className="badge badge-mint"
            style={{ marginBottom: '1rem', display: 'inline-flex' }}
          >
            INTERACTIVE PRODUCT PREVIEW
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              marginBottom: '1rem',
              letterSpacing: '-0.03em'
            }}
          >
            Inspect the reviewer triage dashboard.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8' }}>
            Experience how human reviewers audit explainable multi-signal telemetry without
            penalizing candidates for network instability. Select sessions below to test live
            evaluation.
          </p>

          {/* Mandatory Demo Data Notice Banner */}
          <div
            style={{
              marginTop: '1.5rem',
              backgroundColor: 'rgba(21, 28, 53, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.8125rem',
              color: '#CBD5E1'
            }}
          >
            <Info size={16} color="#79F2C0" />
            <span>
              <strong>Illustrative demo data.</strong> A risk score is an advisory signal for human
              educators, never automatic proof of cheating.
            </span>
          </div>
        </div>

        {/* Dashboard Shell Container */}
        <div
          className="card-indigo"
          style={{
            overflow: 'hidden',
            border: '1px solid rgba(121, 242, 192, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
          }}
        >
          {/* Top Bar: Reviewer Context & Live Session Switcher */}
          <div
            style={{
              backgroundColor: '#0E1428',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem 1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            {/* Session Identifier & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#151C35',
                  border: '1px solid rgba(121, 242, 192, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#79F2C0',
                  fontSize: '0.875rem'
                }}
              >
                {currentSession.candidateInitials}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>
                    {currentSession.candidateName}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.75rem',
                      color: '#79F2C0',
                      backgroundColor: 'rgba(121, 242, 192, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(121, 242, 192, 0.2)'
                    }}
                  >
                    {currentSession.id}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {currentSession.examTitle} · {currentSession.examDate}
                </div>
              </div>
            </div>

            {/* Quick Session Queue Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                QUEUE ({MOCK_SESSIONS.length}):
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
                      backgroundColor: isSelected ? '#1E294B' : 'rgba(21, 28, 53, 0.5)',
                      border: `1px solid ${isSelected ? '#79F2C0' : 'rgba(255,255,255,0.08)'}`,
                      color: isSelected ? '#FFFFFF' : '#94A3B8',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor:
                          sess.integrityRiskScore < 25
                            ? '#79F2C0'
                            : sess.integrityRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                    <span>{sess.candidateName.split(' ')[0]}</span>
                    <span style={{ opacity: 0.7 }}>({sess.integrityRiskScore})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 320px) 1fr',
              minHeight: '580px'
            }}
            className="dashboard-columns"
          >
            {/* Left Sidebar: Score Deconstruction & Telemetry Health */}
            <div
              style={{
                backgroundColor: 'rgba(15, 21, 41, 0.95)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              {/* Overall Integrity Risk Score */}
              <div
                style={{
                  backgroundColor: '#11172D',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.6875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Illustrative Integrity Risk Score
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    margin: '0.5rem 0'
                  }}
                >
                  <span
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color:
                        currentSession.integrityRiskScore < 25
                          ? '#79F2C0'
                          : currentSession.integrityRiskScore < 60
                          ? '#F59E0B'
                          : '#EF4444',
                      lineHeight: 1
                    }}
                  >
                    {currentSession.integrityRiskScore}
                  </span>
                  <span style={{ fontSize: '1rem', color: '#64748B' }}>/ 100</span>
                </div>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color:
                      currentSession.integrityRiskScore < 25
                        ? '#79F2C0'
                        : currentSession.integrityRiskScore < 60
                        ? '#F59E0B'
                        : '#EF4444'
                  }}
                >
                  {currentSession.integrityRiskScore < 25
                    ? 'Low Academic Risk'
                    : currentSession.integrityRiskScore < 60
                    ? 'Moderate (Contextual Review)'
                    : 'High Risk (Audit Escalated)'}
                </div>
              </div>

              {/* Decoupled Indicators: Behavioural vs Environmental */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em' }}>
                  DECOUPLED INTEGRITY SIGNALS
                </div>

                {/* Behavioural Risk Indicator */}
                <div
                  style={{
                    backgroundColor: '#151C35',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#F8FAFC', fontWeight: 600 }}>
                      <UserCheck size={14} color="#79F2C0" />
                      <span>Behavioural Risk</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {currentSession.behaviouralRiskScore}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.behaviouralRiskScore}%`,
                        backgroundColor:
                          currentSession.behaviouralRiskScore < 25
                            ? '#79F2C0'
                            : currentSession.behaviouralRiskScore < 60
                            ? '#F59E0B'
                            : '#EF4444'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                    {currentSession.behaviouralRiskScore < 25
                      ? 'Zero anomalous input clusters'
                      : 'Requires qualitative instructor review'}
                  </div>
                </div>

                {/* Environmental Quality Indicator */}
                <div
                  style={{
                    backgroundColor: '#151C35',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#F8FAFC', fontWeight: 600 }}>
                      <Wifi size={14} color={currentSession.environmentalQualityScore < 50 ? '#F59E0B' : '#79F2C0'} />
                      <span>Environmental Stability</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {currentSession.environmentalQualityScore}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${currentSession.environmentalQualityScore}%`,
                        backgroundColor:
                          currentSession.environmentalQualityScore < 50
                            ? '#F59E0B'
                            : '#79F2C0'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                    {currentSession.connectionType} · {currentSession.environmentalIncidents} network incident(s)
                  </div>
                </div>
              </div>

              {/* Reviewer Action Verdict Panel */}
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '1rem'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  Active Reviewer Decision:
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#79F2C0',
                    backgroundColor: 'rgba(121, 242, 192, 0.1)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(121, 242, 192, 0.25)',
                    marginBottom: '0.75rem',
                    lineHeight: 1.4
                  }}
                >
                  {verdicts[currentSession.id]}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleApplyVerdict('Dismissed: Confirmed Network Interruption')}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <CheckCircle size={14} color="#79F2C0" />
                    <span>Dismiss as Environmental</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenAppealModal) onOpenAppealModal(currentSession);
                      handleApplyVerdict('Awaiting Candidate Response (48h Window)');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                  >
                    <FileCheck2 size={14} color="#38BDF8" />
                    <span>Request Candidate Statement</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Body: Filterable Evidence Timeline & Deep Evidence Inspector */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Category Filter Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={15} color="#94A3B8" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8' }}>
                    Timeline Signals:
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'All Signals' },
                    { id: 'environmental', label: 'Environmental' },
                    { id: 'behavioural', label: 'Behavioural' },
                    { id: 'client', label: 'Client / DOM' },
                    { id: 'keystroke', label: 'Keystroke & Paste' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      style={{
                        backgroundColor: activeCategoryFilter === cat.id ? '#79F2C0' : 'rgba(21, 28, 53, 0.6)',
                        color: activeCategoryFilter === cat.id ? '#0B1020' : '#94A3B8',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '0.3rem 0.65rem',
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

              {/* Timeline Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredEvents.map((event) => {
                  const isSelected = event.id === activeEvent.id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'rgba(30, 41, 75, 0.7)' : 'rgba(21, 28, 53, 0.4)',
                        border: `1px solid ${isSelected ? '#79F2C0' : 'rgba(255, 255, 255, 0.06)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr auto',
                        gap: '1rem',
                        alignItems: 'center'
                      }}
                    >
                      {/* Timestamp */}
                      <div
                        className="font-mono"
                        style={{
                          fontSize: '0.75rem',
                          color: '#79F2C0',
                          backgroundColor: 'rgba(121, 242, 192, 0.08)',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      >
                        {event.timestamp}
                      </div>

                      {/* Event Headline & Subtitle */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F8FAFC' }}>
                            {event.title}
                          </span>
                          {event.isSuppressed && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                backgroundColor: 'rgba(121, 242, 192, 0.12)',
                                color: '#79F2C0',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(121, 242, 192, 0.3)'
                              }}
                            >
                              SUPPRESSED (ENVIRONMENTAL)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                          {event.description}
                        </div>
                      </div>

                      {/* Category Pill */}
                      <div style={{ textAlign: 'right' }}>
                        <span
                          className={`badge ${
                            event.category === 'environmental'
                              ? 'badge-warning'
                              : event.severity === 'high'
                              ? 'badge-danger'
                              : 'badge-mint'
                          }`}
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {event.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deep Evidence Inspector (Explainability Box for Selected Event) */}
              <div
                style={{
                  backgroundColor: 'rgba(11, 16, 32, 0.9)',
                  border: '1px solid rgba(121, 242, 192, 0.25)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginTop: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="#79F2C0" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.04em' }}>
                      EXPLAINABLE SIGNAL AUDIT: {activeEvent.title}
                    </span>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    AUDIT-ID: {activeEvent.id}
                  </span>
                </div>

                {/* Telemetry Metrics Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}
                >
                  {activeEvent.metrics.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: '#151C35',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>{m.label}</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#79F2C0' }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Plain-Language Explainable AI Rationale */}
                <div
                  style={{
                    backgroundColor: 'rgba(21, 28, 53, 0.6)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.25rem' }}>
                    AI Inference & Human Auditor Context:
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                    {activeEvent.aiRationale}
                  </p>
                  {activeEvent.suppressionReason && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#79F2C0',
                        fontWeight: 600,
                        backgroundColor: 'rgba(121, 242, 192, 0.08)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '4px'
                      }}
                    >
                      🛡️ Fairness Rule Applied: {activeEvent.suppressionReason}
                    </div>
                  )}
                </div>
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
