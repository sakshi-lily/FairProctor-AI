import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Activity, Cpu, Filter, Users, FileCheck2 } from 'lucide-react';

export const Workflow: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps = [
    {
      step: '01',
      title: 'Collect Assessment Signals',
      shortDesc: 'Captures window focus, typing cadence, and audio decibel levels with local client memory buffering.',
      commitment: 'Zero raw video leaves the candidate device unless an escalated flag is confirmed.'
    },
    {
      step: '02',
      title: 'Separate Environmental Issues',
      shortDesc: 'Monitors UDP packet loss, network handovers, and Wi-Fi jitter to decouple infrastructure faults.',
      commitment: 'Poor connectivity is treated as an infrastructure reality, never grounds for disciplinary action.'
    },
    {
      step: '03',
      title: 'Analyse Behavioural Evidence',
      shortDesc: 'Correlates typing bursts, clipboard velocity, and window focus into an explainable Bayesian confidence model.',
      commitment: 'Every risk point is backed by a plain-language explanation and verifiable timestamp.'
    },
    {
      step: '04',
      title: 'Rank Sessions for Review',
      shortDesc: 'Auto-clears 85–90% of genuine sessions, prioritizing only meaningful multi-signal anomalies for educators.',
      commitment: 'The AI never auto-fails candidates. Only certified faculty deliver final verdicts.'
    },
    {
      step: '05',
      title: 'Enable Human Decisions & Appeals',
      shortDesc: 'Provides flagged candidates with a 48-hour window to review timestamps and submit explanations or ISP logs.',
      commitment: 'Restoring student dignity through due process, transparency, and two-way communication.'
    }
  ];

  const stepIcons = [Activity, Filter, Cpu, Users, FileCheck2];
  const ActiveStepIcon = stepIcons[activeStepIndex];
  const currentStep = steps[activeStepIndex];

  return (
    <section
      id="workflow"
      className="section-alt"
      style={{
        padding: '85px 0',
        backgroundColor: '#F7F9FC',
        position: 'relative',
        borderTop: '1px solid #E4E7EC'
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.75rem auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em',
              color: '#101828'
            }}
          >
            How it works.
          </h2>
          <p style={{ fontSize: '1rem', color: '#475467', lineHeight: 1.55, margin: 0 }}>
            An explainable five-stage assessment security pipeline from client telemetry ingest to candidate appeal.
          </p>
        </div>

        {/* Desktop Stepper */}
        <div className="workflow-desktop" style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              position: 'relative',
              gap: '1rem'
            }}
          >
            {/* Animated Connector Bar */}
            <div
              style={{
                position: 'absolute',
                top: '22px',
                left: '10%',
                right: '10%',
                height: '2px',
                backgroundColor: '#E4E7EC',
                zIndex: 0
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: '#16A765'
                }}
                animate={{ width: `${(activeStepIndex / 4) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              />
            </div>

            {/* Stepper Buttons */}
            {steps.map((item, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;

              return (
                <button
                  key={item.step}
                  onClick={() => setActiveStepIndex(idx)}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#16A765' : isPast ? '#E8F8EF' : '#FFFFFF',
                      border: `2px solid ${isActive ? '#16A765' : isPast ? '#16A765' : '#E4E7EC'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#FFFFFF' : isPast ? '#16A765' : '#667085',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      boxShadow: isActive ? '0 0 12px rgba(22, 167, 101, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                      marginBottom: '0.65rem'
                    }}
                  >
                    {isPast ? <Check size={16} color="#16A765" /> : item.step}
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isActive ? '#101828' : isPast ? '#16A765' : '#667085',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      maxWidth: '140px'
                    }}
                  >
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View */}
        <div className="workflow-mobile" style={{ display: 'none', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {steps.map((item, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#E8F8EF' : '#FFFFFF',
                  border: `1px solid ${isActive ? '#16A765' : '#E4E7EC'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#16A765' : '#F7F9FC',
                    color: isActive ? '#FFFFFF' : '#667085',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: isActive ? '#16A765' : '#101828' }}>
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="card-white"
            style={{
              padding: '1.75rem 2rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              boxShadow: '0 8px 24px rgba(16, 24, 40, 0.05)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <ActiveStepIcon size={16} color="#16A765" />
                  <span className="font-mono" style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16A765' }}>
                    PHASE {currentStep.step}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', color: '#101828', marginBottom: '0.65rem', fontWeight: 700 }}>
                  {currentStep.title}
                </h3>

                <p style={{ fontSize: '0.9375rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
                  {currentStep.shortDesc}
                </p>
              </div>

              {/* Commitment Callout */}
              <div
                style={{
                  backgroundColor: '#F7F9FC',
                  border: '1px solid #E4E7EC',
                  borderRadius: '8px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <ShieldCheck size={16} color="#16A765" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A765' }}>
                    FAIRNESS COMMITMENT
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#101828', lineHeight: 1.55, margin: 0 }}>
                  "{currentStep.commitment}"
                </p>

                <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveStepIndex((activeStepIndex + 1) % steps.length)}
                    className="btn btn-outline-white btn-sm"
                  >
                    <span>Next Phase</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .workflow-desktop { display: none !important; }
          .workflow-mobile { display: flex !important; }
        }
      `}</style>
    </section>
  );
};
