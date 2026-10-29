import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Wifi,
  UserCheck,
  Cpu,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Sparkles
} from 'lucide-react';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks }) => {
  // Subtle 3D perspective mouse tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="overview"
      className="bg-navy-grid"
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '115px',
        paddingBottom: '80px',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        borderBottom: '1px solid #E4E7EC'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22, 167, 101, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center'
          }}
        >
          {/* Left: Headline, Subtitle, 2 CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 4.2vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
                color: '#101828'
              }}
            >
              Protect exam integrity.{' '}
              <span style={{ color: '#16A765' }}>Preserve fairness.</span>
            </h1>

            {/* Short Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.3vw, 1.2rem)',
                color: '#475467',
                lineHeight: 1.6,
                maxWidth: '520px',
                marginBottom: '2rem'
              }}
            >
              An explainable proctoring intelligence layer that distinguishes genuine misconduct from real-world
              network instability.
            </p>

            {/* Exactly Two CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.85rem',
                alignItems: 'center'
              }}
            >
              <button onClick={onExploreDemo} className="btn btn-green">
                <span>Explore Demo</span>
                <ArrowRight size={16} />
              </button>

              <button onClick={onSeeHowItWorks} className="btn btn-outline-white">
                <Sliders size={16} />
                <span>How It Works</span>
              </button>
            </div>
          </motion.div>

          {/* Right: Compact Fairness Intelligence Visual */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              position: 'relative',
              perspective: '1200px',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
                width: '100%',
                maxWidth: '460px',
                position: 'relative',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                boxShadow: '0 20px 40px -15px rgba(16, 24, 40, 0.08), 0 0 0 1px rgba(22, 167, 101, 0.08)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #E4E7EC'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="#16A765" />
                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#101828',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Fairness Intelligence
                  </span>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#16A765',
                    backgroundColor: '#E8F8EF',
                    border: '1px solid rgba(22, 167, 101, 0.25)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#16A765'
                    }}
                  />
                  Decoupled Engine
                </span>
              </div>

              {/* Two Signal Groups */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Group 1: Environment */}
                <div
                  style={{
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: '10px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <Wifi size={14} color="#0284C7" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#101828' }}>
                      Environment
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#475467', lineHeight: 1.4 }}>
                    Packet jitter · UDP drops · Lighting
                  </div>
                </div>

                {/* Group 2: Behaviour */}
                <div
                  style={{
                    backgroundColor: '#F7F9FC',
                    border: '1px solid #E4E7EC',
                    borderRadius: '10px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <UserCheck size={14} color="#16A765" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#101828' }}>
                      Behaviour
                    </span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#475467', lineHeight: 1.4 }}>
                    Typing cadence · Tab focus · Clipboard
                  </div>
                </div>
              </div>

              {/* Central Minimal Visual: Connection to AI Analysis Node */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  padding: '0.25rem 0'
                }}
              >
                {/* Converging connector lines */}
                <svg
                  width="180"
                  height="28"
                  viewBox="0 0 180 28"
                  fill="none"
                  style={{ display: 'block', overflow: 'visible' }}
                >
                  <path
                    d="M 25 0 C 25 14, 90 6, 90 26"
                    stroke="#BAE6FD"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M 155 0 C 155 14, 90 6, 90 26"
                    stroke="#D0D5DD"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>

                {/* AI Analysis Node */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #16A765',
                    boxShadow: '0 4px 12px rgba(22, 167, 101, 0.15)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#101828',
                    zIndex: 2
                  }}
                >
                  <Cpu size={14} color="#16A765" />
                  <span>AI Analysis</span>
                </div>

                {/* Diverging connector lines */}
                <svg
                  width="180"
                  height="26"
                  viewBox="0 0 180 26"
                  fill="none"
                  style={{ display: 'block', overflow: 'visible' }}
                >
                  <path
                    d="M 90 0 C 90 12, 45 16, 45 26"
                    stroke="#16A765"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 90 0 C 90 12, 135 16, 135 26"
                    stroke="#D0D5DD"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Output Results */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Result 1: Environmental issue isolated */}
                <div
                  style={{
                    backgroundColor: '#E8F8EF',
                    border: '1px solid rgba(22, 167, 101, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <CheckCircle2 size={16} color="#16A765" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#14532D' }}>
                      Environmental issue isolated
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#16A765' }}>
                      Zero penalty applied to candidate risk score
                    </div>
                  </div>
                </div>

                {/* Result 2: Behavioural signals -> Human review */}
                <div
                  style={{
                    backgroundColor: '#F7F9FC',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  <ArrowRight size={14} color="#667085" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#101828' }}>
                      Behavioural signals → Human review
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#667085' }}>
                      Forwarded to reviewer triage with verifiable audit log
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
