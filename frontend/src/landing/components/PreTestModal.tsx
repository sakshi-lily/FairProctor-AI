import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, RefreshCw, Smartphone, Camera, Sun, Wifi, ShieldCheck } from 'lucide-react';
import { PRETEST_METRICS } from '../data/mockData';

interface PreTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreTestModal: React.FC<PreTestModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number>(4);

  const handleRerun = () => {
    setIsRunning(true);
    setCompletedSteps(0);

    const stepInterval = setInterval(() => {
      setCompletedSteps((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setIsRunning(false);
          return 4;
        }
        return prev + 1;
      });
    }, 550);
  };

  if (!isOpen) return null;

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
            maxWidth: '620px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            boxShadow: '0 25px 60px rgba(16, 24, 40, 0.15)',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header */}
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
              <Smartphone size={20} color="#16A765" />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#101828', margin: 0, fontWeight: 700 }}>
                  Pre-Test Environmental Diagnostics
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#475467' }}>
                  Simulated Candidate Readiness Suite (Mobile & Desktop)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close Pre-Test Modal"
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

          {/* Diagnostic Checks Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#475467', margin: 0, lineHeight: 1.55 }}>
              The pre-test system establishes individual candidate baselines for ambient lighting, microphone noise
              floors, and uplink jitter so environmental variations are never flagged as suspicious behaviour.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PRETEST_METRICS.map((metric, idx) => {
                const isFinished = completedSteps > idx;

                return (
                  <div
                    key={metric.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isFinished ? 1 : 0.5,
                      transition: 'opacity 0.2s ease',
                      boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#E8F8EF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(22, 167, 101, 0.25)'
                        }}
                      >
                        {metric.id === 'cam' && <Camera size={16} color="#16A765" />}
                        {metric.id === 'light' && <Sun size={16} color="#16A765" />}
                        {metric.id === 'net' && <Wifi size={16} color="#F59E0B" />}
                        {metric.id === 'sandbox' && <ShieldCheck size={16} color="#16A765" />}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828' }}>
                          {metric.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475467' }}>{metric.details}</div>
                      </div>
                    </div>

                    <div>
                      {isFinished ? (
                        metric.status === 'passed' ? (
                          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                            Optimal
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            Adaptive Buffer
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#667085' }}>Evaluating...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Baseline Summary Callout */}
            <div
              style={{
                backgroundColor: '#E8F8EF',
                border: '1px solid rgba(22, 167, 101, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: '#14532D',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} color="#16A765" />
              <span>
                Baseline calibrated: Low-bandwidth adaptive profile established. Video drop tolerance set to 1,200ms.
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#F7F9FC',
              borderTop: '1px solid #E4E7EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="btn btn-outline-white btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={13} className={isRunning ? 'spin' : ''} />
              <span>{isRunning ? 'Running Diagnostic...' : 'Re-run Diagnostic Suite'}</span>
            </button>

            <button onClick={onClose} className="btn btn-green btn-sm">
              <span>Ready for Assessment</span>
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
};
