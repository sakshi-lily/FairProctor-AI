import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Send, CheckCircle2, Paperclip } from 'lucide-react';
import type { CandidateSession } from '../types';

interface AppealModalProps {
  isOpen: boolean;
  session: CandidateSession | null;
  onClose: () => void;
}

export const AppealModal: React.FC<AppealModalProps> = ({ isOpen, session, onClose }) => {
  const [statement, setStatement] = useState<string>(
    'During the exam at 14:22 UTC, my neighborhood experienced a brief cellular network tower switch, causing my camera stream to stutter. I remained in my chair and did not use any external devices.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [attachedLog, setAttachedLog] = useState<boolean>(true);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(7, 11, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 200
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="card-indigo"
          style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: '#0E1428',
            border: '1px solid rgba(121, 242, 192, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#0B1020'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Shield size={20} color="#79F2C0" />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>
                  Candidate Due Process & Rebuttal Window
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Session: {session.id} · {session.candidateName}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Appeal Modal"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1.5rem' }}>
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(121, 242, 192, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    border: '1px solid rgba(121, 242, 192, 0.4)'
                  }}
                >
                  <CheckCircle2 size={32} color="#79F2C0" />
                </div>
                <h4 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  Statement & Telemetry Logs Submitted
                </h4>
                <p style={{ fontSize: '0.9375rem', color: '#94A3B8', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
                  Your statement, along with your ISP packet-loss audit report, has been attached to the reviewer queue.
                  Academic actions are paused pending independent faculty review.
                </p>
                <button onClick={onClose} className="btn btn-primary btn-sm">
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(21, 28, 53, 0.6)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#79F2C0', marginBottom: '0.25rem' }}>
                    REVIEWER INQUIRY NOTICE:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#CBD5E1' }}>
                    {session.summaryRationale}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#F8FAFC',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Your Personal Statement (Plain-Language Explanation):
                  </label>
                  <textarea
                    rows={4}
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#151C35',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-sans)',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Evidence Attachment Simulated Box */}
                <div
                  onClick={() => setAttachedLog(!attachedLog)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#151C35',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Paperclip size={16} color={attachedLog ? '#79F2C0' : '#94A3B8'} />
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#FFFFFF', fontWeight: 600 }}>
                        isp_telemetry_dump_rtt980ms.json
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                        Local WebRTC socket diagnostic logs (Verified HMAC)
                      </div>
                    </div>
                  </div>
                  <span
                    className={`badge ${attachedLog ? 'badge-mint' : 'badge-warning'}`}
                    style={{ fontSize: '0.625rem' }}
                  >
                    {attachedLog ? 'ATTACHED' : 'ADD LOGS'}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} />
                    <span>Submit Candidate Appeal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
