import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Info } from 'lucide-react';
import { MOCK_SESSIONS } from '../../data/mockData';
import { useAuth } from '../../context/useAuth';
import { authClient } from '../../api/authClient';

export const ReviewerPortal: React.FC = () => {
  const { user } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState<string>(MOCK_SESSIONS[0].id);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>(MOCK_SESSIONS[0].timeline[0]?.id || 'EV-01');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('NO_CONCERN');
  const [submittingVerdict, setSubmittingVerdict] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentSession = MOCK_SESSIONS.find((s) => s.id === selectedSessionId) || MOCK_SESSIONS[0];

  const filteredEvents = currentSession.timeline.filter((event) => {
    if (activeCategoryFilter === 'all') return true;
    return event.category === activeCategoryFilter;
  });

  const activeEvent = currentSession.timeline.find((e) => e.id === selectedEventId) || currentSession.timeline[0];

  const handleVerdictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingVerdict) return;

    setSubmittingVerdict(true);
    setFeedbackMsg(null);

    try {
      const res = await authClient.submitReviewerVerdict({
        sessionId: currentSession.id,
        decision: selectedVerdict,
        justificationNotes: reviewerNotes,
      });

      setFeedbackMsg({
        type: 'success',
        text: res.message || 'Verdict securely sealed in audit trail.',
      });
      setReviewerNotes('');
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to submit verdict.',
      });
    } finally {
      setSubmittingVerdict(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', backgroundColor: '#F7F9FC', padding: '2.5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#101828' }}>
                Reviewer Triage Queue
              </h1>
              <span className="badge badge-green">Authorized Reviewer</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.2rem' }}>
              Reviewing as: <strong>{user?.name}</strong> &middot; {user?.email} &middot; Role: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
            </p>
          </div>

          {/* Session Switcher Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {MOCK_SESSIONS.map((sess) => (
              <button
                key={sess.id}
                type="button"
                onClick={() => {
                  setSelectedSessionId(sess.id);
                  if (sess.timeline.length > 0) setSelectedEventId(sess.timeline[0].id);
                  setFeedbackMsg(null);
                }}
                style={{
                  padding: '0.5rem 0.9rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: `1px solid ${selectedSessionId === sess.id ? '#16A765' : '#D0D5DD'}`,
                  backgroundColor: selectedSessionId === sess.id ? '#E8F8EF' : '#FFFFFF',
                  color: selectedSessionId === sess.id ? '#16A765' : '#344054',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>{sess.candidateName}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'monospace' }}>({sess.id})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Selected Session Decoupled Scoring Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#101828' }}>
                  {currentSession.candidateName}
                </h2>
                <span className="badge badge-info">{currentSession.connectionType}</span>
                <span className="badge badge-green">{currentSession.reviewStatus}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#667085', marginTop: '0.25rem' }}>
                {currentSession.examTitle} &middot; Exam ID: <span style={{ fontFamily: 'monospace' }}>{currentSession.id}</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#667085', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                  Behavioral Risk
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#101828' }}>
                  {currentSession.behaviouralRiskScore}/100
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#667085', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                  Environmental Quality
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A765' }}>
                  {currentSession.environmentalQualityScore}/100
                </span>
              </div>
            </div>
          </div>

          {/* AI Decision Rationale Box */}
          <div
            style={{
              backgroundColor: '#F8F9FC',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              fontSize: '0.875rem',
              color: '#344054',
              lineHeight: 1.55,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#101828', marginBottom: '0.35rem' }}>
              <Sparkles size={16} color="#16A765" />
              <span>Decoupling Engine Rationale</span>
            </div>
            <p style={{ margin: 0 }}>{currentSession.summaryRationale}</p>
          </div>
        </div>

        {/* Two-Column Grid: Evidence Timeline & Inspector + Verdict */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Filterable Evidence Timeline */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101828' }}>
                Evidence Timeline ({filteredEvents.length})
              </h3>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['all', 'environmental', 'behavioural', 'client'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    style={{
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: '1px solid #D0D5DD',
                      backgroundColor: activeCategoryFilter === cat ? '#101828' : '#FFFFFF',
                      color: activeCategoryFilter === cat ? '#FFFFFF' : '#475467',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedEventId === event.id ? '#16A765' : '#E4E7EC'}`,
                    backgroundColor: selectedEventId === event.id ? '#F2FAF5' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#101828' }}>{event.title}</span>
                    <span style={{ fontSize: '0.75rem', color: '#667085', fontFamily: 'monospace' }}>{event.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#475467', margin: 0, lineHeight: 1.4 }}>
                    {event.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Decision Inspector & Live Verdict Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#101828', marginBottom: '0.75rem' }}>
              Reviewer Verdict Action
            </h3>

            {activeEvent && (
              <div
                style={{
                  backgroundColor: '#F8F9FC',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#101828', marginBottom: '0.2rem' }}>
                  <Info size={14} color="#16A765" />
                  <span>Inspecting: {activeEvent.title}</span>
                </div>
                <p style={{ margin: 0, color: '#475467', lineHeight: 1.45 }}>
                  {activeEvent.aiRationale}
                </p>
              </div>
            )}

            {feedbackMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8125rem',
                  backgroundColor: feedbackMsg.type === 'success' ? '#ECFDF3' : '#FEF2F2',
                  border: `1px solid ${feedbackMsg.type === 'success' ? '#A6F4C5' : '#FCA5A5'}`,
                  color: feedbackMsg.type === 'success' ? '#027A48' : '#B91C1C',
                }}
              >
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleVerdictSubmit}>
              {/* Verdict Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedVerdict === 'NO_CONCERN' ? '#16A765' : '#E4E7EC'}`,
                    backgroundColor: selectedVerdict === 'NO_CONCERN' ? '#E8F8EF' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="verdict"
                    value="NO_CONCERN"
                    checked={selectedVerdict === 'NO_CONCERN'}
                    onChange={(e) => setSelectedVerdict(e.target.value)}
                    style={{ accentColor: '#16A765' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      No Concern (Dismiss as Environmental)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>Candidate cleared. Environmental packet drop isolated.</span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedVerdict === 'REQUIRES_INVESTIGATION' ? '#0284C7' : '#E4E7EC'}`,
                    backgroundColor: selectedVerdict === 'REQUIRES_INVESTIGATION' ? '#E0F2FE' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="verdict"
                    value="REQUIRES_INVESTIGATION"
                    checked={selectedVerdict === 'REQUIRES_INVESTIGATION'}
                    onChange={(e) => setSelectedVerdict(e.target.value)}
                    style={{ accentColor: '#0284C7' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      Requires Investigation (Request Statement)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>Ambiguous signal. Rebuttal window opened for candidate.</span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: `1px solid ${selectedVerdict === 'CONFIRMED_VIOLATION' ? '#DC2626' : '#E4E7EC'}`,
                    backgroundColor: selectedVerdict === 'CONFIRMED_VIOLATION' ? '#FEF2F2' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="verdict"
                    value="CONFIRMED_VIOLATION"
                    checked={selectedVerdict === 'CONFIRMED_VIOLATION'}
                    onChange={(e) => setSelectedVerdict(e.target.value)}
                    style={{ accentColor: '#DC2626' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      Confirmed Policy Violation
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>Lead proctor determination based on tangible evidence.</span>
                  </div>
                </label>
              </div>

              {/* Justification Textarea */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="reviewer-notes"
                  style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#344054', marginBottom: '0.35rem' }}
                >
                  Reviewer Notes & Justification:
                </label>
                <textarea
                  id="reviewer-notes"
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Record contextual observations, timestamp inspected, or reason for determination..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #D0D5DD',
                    outline: 'none',
                    color: '#101828',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                  onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#667085' }}>
                  Recorded in server audit log &middot; Immutable
                </span>
                <button
                  type="submit"
                  disabled={submittingVerdict}
                  className="btn btn-green btn-sm"
                  style={{ opacity: submittingVerdict ? 0.7 : 1 }}
                >
                  <Send size={14} />
                  <span>{submittingVerdict ? 'Recording...' : 'Submit Decision'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
