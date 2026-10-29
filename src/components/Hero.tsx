import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  Wifi,
  Radio,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Activity,
  Layers,
  Clock
} from 'lucide-react';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
  onOpenPreTest: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks, onOpenPreTest }) => {
  // Toggle between FairProctor Decoupled vs Legacy Conflated mode
  const [isDecoupled, setIsDecoupled] = useState<boolean>(true);
  const [activeSignalIndex, setActiveSignalIndex] = useState<number>(0);

  // Subtle 3D perspective mouse tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

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

  const evidenceSignals = [
    {
      time: '14:22:08',
      type: 'Connectivity Latency',
      detail: 'Packet Loss 34% · Uplink RTT 920ms',
      fairVerdict: 'Environmental anomaly isolated. Video freeze penalty suppressed.',
      legacyVerdict: 'Camera obstruction flagged. Candidate automatically penalized.'
    },
    {
      time: '14:35:12',
      type: 'Contextual Tab Switch',
      detail: 'Window blur 3.4s · Target: Formula Appendix PDF',
      fairVerdict: 'Authorized reference document verified in DOM. Score unaffected.',
      legacyVerdict: 'Unauthorized browser navigation flag triggered.'
    },
    {
      time: '14:48:30',
      type: 'Keystroke Flight Time',
      detail: 'Typing cadence within normal cognitive drafting distribution',
      fairVerdict: 'Normal question solving verified. No clipboard injection.',
      legacyVerdict: 'Uncalibrated baseline generated low-confidence flag.'
    }
  ];

  return (
    <section
      id="overview"
      className="bg-navy-grid"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '115px',
        paddingBottom: '85px',
        backgroundColor: '#061744',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient gradient glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '10%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(24, 184, 106, 0.12) 0%, rgba(6, 23, 68, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 36, 99, 0.6) 0%, rgba(3, 16, 47, 0) 70%)',
          filter: 'blur(100px)',
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
          {/* Left Column: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(24, 184, 106, 0.12)',
                border: '1px solid rgba(24, 184, 106, 0.3)',
                padding: '0.35rem 0.85rem',
                borderRadius: '4px',
                marginBottom: '1.5rem'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#18B86A',
                  boxShadow: '0 0 8px #18B86A'
                }}
              />
              <span
                style={{
                  color: '#18B86A',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                IM-102 HACKATHON · EXPLAINABLE EXAM INTEGRITY
              </span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
                color: '#FFFFFF'
              }}
            >
              Protect exam integrity.{' '}
              <span style={{ color: '#18B86A', display: 'inline-block' }}>
                Preserve fairness.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.35vw, 1.2rem)',
                color: '#B8C4D9',
                lineHeight: 1.65,
                maxWidth: '560px',
                marginBottom: '2.25rem'
              }}
            >
              An explainable, connectivity-aware proctoring intelligence layer that distinguishes suspicious behaviour
              from the challenges of real-world testing environments.
            </p>

            {/* Primary & Secondary CTAs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '2.5rem'
              }}
            >
              <button onClick={onExploreDemo} className="btn btn-green">
                <span>Explore the Platform</span>
                <ArrowRight size={16} />
              </button>

              <button onClick={onSeeHowItWorks} className="btn btn-outline-white">
                <Sliders size={16} />
                <span>See How It Works</span>
              </button>

              <button
                onClick={onOpenPreTest}
                className="btn btn-outline-white"
                style={{ fontSize: '0.8125rem' }}
              >
                <Activity size={15} color="#79F2C0" />
                <span>Pre-Test Diagnostic</span>
              </button>
            </div>

            {/* Concise Trust Statement */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1.25rem'
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ color: '#18B86A' }}>●</span>
                <span>Evidence-led.</span>
                <span style={{ color: '#18B86A' }}>●</span>
                <span>Privacy-conscious.</span>
                <span style={{ color: '#18B86A' }}>●</span>
                <span>Human-reviewed.</span>
              </p>
            </div>
          </motion.div>

          {/* Right Column: Animated Product Visualization */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
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
                maxWidth: '520px',
                position: 'relative'
              }}
              className="card-navy"
            >
              {/* Visualization Header */}
              <div
                style={{
                  padding: '1.15rem 1.4rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(3, 16, 47, 0.6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#18B86A" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                    INTEGRITY SCORING ENGINE
                  </span>
                </div>

                {/* Interactive Decoupling Mode Toggle */}
                <button
                  onClick={() => setIsDecoupled(!isDecoupled)}
                  title="Click to toggle between FairProctor AI Decoupling and Legacy Proctoring"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: isDecoupled ? 'rgba(24, 184, 106, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isDecoupled ? '#18B86A' : '#EF4444'}`,
                    padding: '0.3rem 0.65rem',
                    borderRadius: '4px',
                    color: isDecoupled ? '#18B86A' : '#EF4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>{isDecoupled ? 'Decoupling: Active' : 'Legacy Conflated'}</span>
                </button>
              </div>

              {/* Central Scoring Engine & Orbiting Rings */}
              <div
                style={{
                  position: 'relative',
                  height: '310px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  overflow: 'hidden'
                }}
              >
                {/* SVG Concentric Orbiting Rings */}
                <svg
                  viewBox="0 0 340 340"
                  style={{
                    position: 'absolute',
                    width: '300px',
                    height: '300px',
                    pointerEvents: 'none'
                  }}
                >
                  <circle
                    cx="170"
                    cy="170"
                    r="140"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(24, 184, 106, 0.15)' : 'rgba(239, 68, 68, 0.2)'}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="170"
                    cy="170"
                    r="100"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(24, 184, 106, 0.25)' : 'rgba(239, 68, 68, 0.3)'}
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx="170"
                    cy="170"
                    r="65"
                    fill="none"
                    stroke={isDecoupled ? '#18B86A' : '#EF4444'}
                    strokeOpacity="0.4"
                    strokeWidth="2"
                  />
                </svg>

                {/* Central Translucent Product Core */}
                <motion.div
                  animate={{
                    scale: isDecoupled ? [1, 1.03, 1] : [1, 0.98, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '20px',
                    background: isDecoupled
                      ? 'linear-gradient(135deg, rgba(24, 184, 106, 0.2) 0%, rgba(14, 36, 99, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(14, 36, 99, 0.9) 100%)',
                    border: `1.5px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDecoupled
                      ? '0 0 30px rgba(24, 184, 106, 0.3)'
                      : '0 0 30px rgba(239, 68, 68, 0.35)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2
                  }}
                >
                  <ShieldCheck size={36} color={isDecoupled ? '#18B86A' : '#EF4444'} />
                </motion.div>

                {/* Floating Central Integrity Risk Score (Top Right) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(3, 16, 47, 0.92)',
                    border: `1px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    zIndex: 4,
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#B8C4D9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Integrity Risk Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '1.85rem',
                        fontWeight: 800,
                        color: isDecoupled ? '#18B86A' : '#EF4444',
                        lineHeight: 1
                      }}
                    >
                      {isDecoupled ? '14' : '88'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#8696B2' }}>/ 100</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: isDecoupled ? '#18B86A' : '#EF4444'
                    }}
                  >
                    {isDecoupled ? 'Low Risk · Auto-Cleared' : 'Flagged · False Obstruction'}
                  </span>
                </div>

                {/* Floating Connectivity Indicator (Bottom Left) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(3, 16, 47, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.85rem',
                    zIndex: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <Radio size={12} color={isDecoupled ? '#F59E0B' : '#EF4444'} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#FFFFFF' }}>
                      CONNECTIVITY STATUS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDecoupled ? '#18B86A' : '#EF4444', fontWeight: 600 }}>
                    {isDecoupled
                      ? 'Packet Loss 34% (Environmental) — Suppressed'
                      : 'Camera freeze penalized as dishonesty'}
                  </div>
                </div>

                {/* Orbiting Evidence Marker Buttons */}
                {evidenceSignals.map((sig, idx) => {
                  const angles = [35, 155, 275];
                  const angleRad = (angles[idx] * Math.PI) / 180;
                  const radius = 105;
                  const x = Math.cos(angleRad) * radius;
                  const y = Math.sin(angleRad) * radius;

                  const isSelected = activeSignalIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveSignalIndex(idx)}
                      style={{
                        position: 'absolute',
                        transform: `translate(${x}px, ${y}px)`,
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: isSelected
                          ? isDecoupled
                            ? '#18B86A'
                            : '#EF4444'
                          : '#0E2463',
                        border: `2px solid ${isDecoupled ? '#18B86A' : '#EF4444'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#FFFFFF' : '#B8C4D9',
                        cursor: 'pointer',
                        zIndex: 3,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        transition: 'transform 0.2s ease'
                      }}
                      title={`Inspect ${sig.type}`}
                    >
                      {idx === 0 && <Wifi size={14} />}
                      {idx === 1 && <Layers size={14} />}
                      {idx === 2 && <Clock size={14} />}
                    </button>
                  );
                })}
              </div>

              {/* Timestamped Evidence Card Snippet */}
              <div
                style={{
                  padding: '1.15rem 1.4rem',
                  backgroundColor: 'rgba(3, 16, 47, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#18B86A' }}>
                      {evidenceSignals[activeSignalIndex].time}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {evidenceSignals[activeSignalIndex].type}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#8696B2' }}>
                    {evidenceSignals[activeSignalIndex].detail}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.55rem 0.8rem',
                    borderRadius: '5px',
                    backgroundColor: isDecoupled ? 'rgba(24, 184, 106, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    color: isDecoupled ? '#EAF1F7' : '#FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {isDecoupled ? <CheckCircle2 size={16} color="#18B86A" /> : <AlertCircle size={16} color="#EF4444" />}
                  <span>
                    {isDecoupled
                      ? evidenceSignals[activeSignalIndex].fairVerdict
                      : evidenceSignals[activeSignalIndex].legacyVerdict}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
