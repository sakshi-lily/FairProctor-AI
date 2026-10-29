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
    }, 600);
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
            maxWidth: '620px',
            backgroundColor: '#0E1428',
            border: '1px solid rgba(121, 242, 192, 0.3)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header */}
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
              <Smartphone size={20} color="#79F2C0" />
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF', margin: 0 }}>
                  Pre-Test Environmental Diagnostics
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
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
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Diagnostic Checks Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0 }}>
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
                      backgroundColor: 'rgba(21, 28, 53, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: isFinished ? 1 : 0.4,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#151C35',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        {metric.id === 'cam' && <Camera size={16} color="#79F2C0" />}
                        {metric.id === 'light' && <Sun size={16} color="#79F2C0" />}
                        {metric.id === 'net' && <Wifi size={16} color="#F59E0B" />}
                        {metric.id === 'sandbox' && <ShieldCheck size={16} color="#79F2C0" />}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>
                          {metric.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{metric.details}</div>
                      </div>
                    </div>

                    <div>
                      {isFinished ? (
                        metric.status === 'passed' ? (
                          <span className="badge badge-mint" style={{ fontSize: '0.6875rem' }}>
                            Optimal
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                            Adaptive Buffer
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Evaluating...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Baseline Summary Pill */}
            <div
              style={{
                backgroundColor: 'rgba(121, 242, 192, 0.08)',
                border: '1px solid rgba(121, 242, 192, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: '#79F2C0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} color="#79F2C0" />
              <span>
                Baseline calibrated: Low-bandwidth adaptive profile established. Video drop tolerance set to 1,200ms.
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#0B1020',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={isRunning ? 'spin' : ''} />
              <span>{isRunning ? 'Running Diagnostic...' : 'Re-run Diagnostic Suite'}</span>
            </button>

            <button onClick={onClose} className="btn btn-primary btn-sm">
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
