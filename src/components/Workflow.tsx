import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORKFLOW_STEPS } from '../data/mockData';
import { Check, ArrowRight, Shield } from 'lucide-react';

export const Workflow: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  return (
    <section
      id="workflow"
      style={{
        padding: '100px 0',
        backgroundColor: '#070B16',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
            END-TO-END PIPELINE
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              marginBottom: '1rem',
              letterSpacing: '-0.03em'
            }}
          >
            How FairProctor processes an assessment.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8' }}>
            From multimodal client signal ingest to candidate due process, integrity is handled as an
            explainable, transparent chain of custody.
          </p>
        </div>

        {/* Desktop Horizontal Workflow Stepper */}
        <div className="workflow-desktop" style={{ marginBottom: '3rem' }}>
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
                top: '24px',
                left: '10%',
                right: '10%',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                zIndex: 0
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: '#79F2C0',
                  boxShadow: '0 0 10px #79F2C0'
                }}
                animate={{ width: `${(activeStepIndex / 4) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              />
            </div>

            {/* Stepper Buttons */}
            {WORKFLOW_STEPS.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;

              return (
                <button
                  key={step.step}
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
                  {/* Step Bubble */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#79F2C0' : isPast ? '#1E294B' : '#151C35',
                      border: `2px solid ${isActive ? '#79F2C0' : isPast ? '#79F2C0' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#0B1020' : '#FFFFFF',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      boxShadow: isActive ? '0 0 20px rgba(121, 242, 192, 0.4)' : 'none',
                      transition: 'all 0.25s ease',
                      marginBottom: '0.85rem'
                    }}
                  >
                    {isPast ? <Check size={18} color="#79F2C0" /> : step.step}
                  </div>

                  {/* Step Title Label */}
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isActive ? '#79F2C0' : isPast ? '#F8FAFC' : '#94A3B8',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      maxWidth: '160px',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Stepper View */}
        <div className="workflow-mobile" style={{ display: 'none', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <div
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#151C35' : 'rgba(21, 28, 53, 0.4)',
                  border: `1px solid ${isActive ? '#79F2C0' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#79F2C0' : '#0B1020',
                    color: isActive ? '#0B1020' : '#79F2C0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    flexShrink: 0
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isActive ? '#79F2C0' : '#FFFFFF' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{step.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="card-indigo"
            style={{
              padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              border: '1px solid rgba(121, 242, 192, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#79F2C0' }}>
                    PHASE {activeStep.step}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>— {activeStep.subtitle}</span>
                </div>

                <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)', color: '#FFFFFF', marginBottom: '1rem' }}>
                  {activeStep.title}
                </h3>

                <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  {activeStep.description}
                </p>

                {/* Tech Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeStep.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: 'rgba(21, 28, 53, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step Fairness Highlight Box */}
              <div
                style={{
                  backgroundColor: 'rgba(11, 16, 32, 0.8)',
                  border: '1px solid rgba(121, 242, 192, 0.25)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Shield size={18} color="#79F2C0" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#79F2C0', letterSpacing: '0.04em' }}>
                    FAIRNESS COMMITMENT
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#F8FAFC', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  "{activeStep.highlight}"
                </p>

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveStepIndex((activeStepIndex + 1) % WORKFLOW_STEPS.length)}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Next Phase</span>
                    <ArrowRight size={14} />
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
