import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORKFLOW_STEPS } from '../data/mockData';
import { Check, ArrowRight, ShieldCheck, Activity, Cpu, Filter, Users, FileCheck2 } from 'lucide-react';

export const Workflow: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  // Custom visual icons for each step
  const stepIcons = [Activity, Filter, Cpu, Users, FileCheck2];
  const ActiveStepIcon = stepIcons[activeStepIndex];

  return (
    <section
      id="workflow"
      style={{
        padding: '100px 0',
        backgroundColor: '#061744',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge badge-green" style={{ marginBottom: '1rem' }}>
            SECTION C · HOW IT WORKS
          </div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            How FairProctor processes an assessment.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#B8C4D9', lineHeight: 1.65 }}>
            From multimodal client signal ingest to candidate due process, exam integrity is handled as an
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
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                zIndex: 0
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: '#18B86A',
                  boxShadow: '0 0 10px #18B86A'
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
                      backgroundColor: isActive ? '#18B86A' : isPast ? '#0E2463' : '#03102F',
                      border: `2px solid ${isActive ? '#18B86A' : isPast ? '#18B86A' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#FFFFFF' : '#B8C4D9',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      boxShadow: isActive ? '0 0 16px rgba(24, 184, 106, 0.45)' : 'none',
                      transition: 'all 0.25s ease',
                      marginBottom: '0.85rem'
                    }}
                  >
                    {isPast ? <Check size={18} color="#18B86A" /> : step.step}
                  </div>

                  {/* Step Title Label */}
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isActive ? '#FFFFFF' : isPast ? '#EAF1F7' : '#B8C4D9',
                      textAlign: 'center',
                      lineHeight: 1.35,
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
        <div className="workflow-mobile" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            return (
              <div
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: isActive ? '#0E2463' : 'rgba(3, 16, 47, 0.6)',
                  border: `1px solid ${isActive ? '#18B86A' : 'rgba(255,255,255,0.1)'}`,
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
                    backgroundColor: isActive ? '#18B86A' : '#03102F',
                    color: '#FFFFFF',
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
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isActive ? '#18B86A' : '#FFFFFF' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#B8C4D9' }}>{step.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Showcase Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep.step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="card-navy"
            style={{
              padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              border: '1px solid rgba(24, 184, 106, 0.35)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                  <ActiveStepIcon size={18} color="#18B86A" />
                  <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: '#18B86A' }}>
                    PHASE {activeStep.step}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#B8C4D9' }}>— {activeStep.subtitle}</span>
                </div>

                <h3 style={{ fontSize: 'clamp(1.35rem, 2vw, 1.8rem)', color: '#FFFFFF', marginBottom: '1rem', fontWeight: 700 }}>
                  {activeStep.title}
                </h3>

                <p style={{ fontSize: '1rem', color: '#B8C4D9', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  {activeStep.description}
                </p>

                {/* Tech Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {activeStep.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#03102F',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#EAF1F7',
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
                  backgroundColor: '#03102F',
                  border: '1px solid rgba(24, 184, 106, 0.25)',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <ShieldCheck size={18} color="#18B86A" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#18B86A', letterSpacing: '0.04em' }}>
                    FAIRNESS COMMITMENT
                  </span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#FFFFFF', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>
                  "{activeStep.highlight}"
                </p>

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveStepIndex((activeStepIndex + 1) % WORKFLOW_STEPS.length)}
                    className="btn btn-outline-white btn-sm"
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
