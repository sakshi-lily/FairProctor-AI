import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Send, CheckCircle2, Paperclip } from 'lucide-react';
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
          backgroundColor: 'rgba(16, 24, 40, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 200
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          className="card-white"
          style={{
            width: '100%',
            maxWidth: '640px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            boxShadow: '0 25px 60px rgba(16, 24, 40, 0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E4E7EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F7F9FC'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="#16A765" />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#101828', margin: 0, fontWeight: 700 }}>
                  Candidate Due Process & Rebuttal Window
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#475467' }}>
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
                color: '#475467',
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
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#E8F8EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem auto',
                    border: '1px solid rgba(22, 167, 101, 0.3)'
                  }}
                >
                  <CheckCircle2 size={30} color="#16A765" />
                </div>
                <h4 style={{ fontSize: '1.3rem', color: '#101828', marginBottom: '0.5rem', fontWeight: 700 }}>
                  Statement & Telemetry Logs Submitted
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475467', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
                  Your statement, along with your ISP packet-loss audit report, has been appended to the reviewer queue.
                  Academic sanctions remain strictly paused pending human educator review.
                </p>
                <button onClick={onClose} className="btn btn-green btn-sm">
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    backgroundColor: '#F7F9FC',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #E4E7EC'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A765', marginBottom: '0.25rem' }}>
                    REVIEWER INQUIRY NOTICE:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#101828', lineHeight: 1.5 }}>
                    {session.summaryRationale}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#101828',
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
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      color: '#101828',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-sans)',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Evidence Attachment Interactive Box */}
                <div
                  onClick={() => setAttachedLog(!attachedLog)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#F7F9FC',
                    borderRadius: '8px',
                    border: '1px solid #E4E7EC',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Paperclip size={16} color={attachedLog ? '#16A765' : '#667085'} />
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#101828', fontWeight: 600 }}>
                        isp_telemetry_dump_rtt980ms.json
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#475467' }}>
                        Local WebRTC socket diagnostic logs (Verified HMAC)
                      </div>
                    </div>
                  </div>
                  <span
                    className={`badge ${attachedLog ? 'badge-green' : 'badge-warning'}`}
                    style={{ fontSize: '0.625rem' }}
                  >
                    {attachedLog ? 'ATTACHED' : 'ADD LOGS'}
                  </span>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-outline-white btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-green btn-sm">
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
