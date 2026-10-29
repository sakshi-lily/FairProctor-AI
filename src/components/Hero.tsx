import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck,
  WifiOff,
  Radio,
  ArrowRight,
  Layers,
  AlertCircle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Eye,
  Sliders,
  Activity
} from 'lucide-react';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
  onOpenPreTest: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks, onOpenPreTest }) => {
  // Toggle between Legacy Proctor vs FairProctor Decoupled mode
  const [isDecoupled, setIsDecoupled] = useState<boolean>(true);
  const [activeSignalIndex, setActiveSignalIndex] = useState<number>(0);

  // 3D perspective mouse tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

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

  const signals = [
    {
      id: 'net',
      label: 'Cellular Jitter',
      legacyVerdict: 'Camera Tamper Flag',
      fairVerdict: 'Environmental Suppression',
      metric: '34% packet loss · RTT 920ms',
      time: '14:22:08'
    },
    {
      id: 'gaze',
      label: 'Downward Gaze',
      legacyVerdict: 'Cheat Flag (Looking Away)',
      fairVerdict: 'Scratchpad Math Ingest',
      metric: 'Head pitch 6° · Question 14',
      time: '14:31:40'
    },
    {
      id: 'dom',
      label: 'Formula Tab Focus',
      legacyVerdict: 'Browser Blur Penalty',
      fairVerdict: 'Approved PDF Modal Target',
      metric: 'DOM appendix focus · 3.4s',
      time: '14:45:15'
    }
  ];

  return (
    <section
      id="overview"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '110px',
        paddingBottom: '80px',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '25%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(121, 242, 192, 0.08) 0%, rgba(21, 28, 53, 0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 41, 75, 0.4) 0%, rgba(11, 16, 32, 0) 70%)',
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
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(121, 242, 192, 0.09)',
                border: '1px solid rgba(121, 242, 192, 0.22)',
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                marginBottom: '1.5rem'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#79F2C0',
                  boxShadow: '0 0 10px #79F2C0'
                }}
              />
              <span
                style={{
                  color: '#79F2C0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                BUILT FOR FAIRER ASSESSMENTS
              </span>
            </div>

            {/* Headline with Contrasting Typography */}
            <h1
              style={{
                fontSize: 'clamp(2.75rem, 5.2vw, 4.25rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                marginBottom: '1.5rem',
                color: '#FFFFFF'
              }}
            >
              Fair exams.{' '}
              <span
                className="editorial-italic"
                style={{
                  color: '#79F2C0',
                  fontWeight: 400,
                  display: 'inline-block',
                  position: 'relative'
                }}
              >
                Smarter integrity.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
                color: '#94A3B8',
                lineHeight: 1.6,
                maxWidth: '560px',
                marginBottom: '2.25rem'
              }}
            >
              Understand suspicious behaviour without confusing poor connectivity with misconduct.
              A multi-signal AI engine with cryptographic auditability and human-in-the-loop review.
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
              <button onClick={onExploreDemo} className="btn btn-primary">
                <span>Explore the Platform</span>
                <ArrowRight size={16} />
              </button>

              <button onClick={onSeeHowItWorks} className="btn btn-secondary">
                <Sliders size={16} />
                <span>See How It Works</span>
              </button>

              <button
                onClick={onOpenPreTest}
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '0.75rem 1rem' }}
              >
                <Activity size={15} color="#79F2C0" />
                <span>Pre-Test Check</span>
              </button>
            </div>

            {/* Trust Statement */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '1.5rem'
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#CBD5E1',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ color: '#79F2C0', fontWeight: 700 }}>●</span>
                <span>Explainable signals.</span>
                <span style={{ color: '#79F2C0', fontWeight: 700 }}>●</span>
                <span>Human-led decisions.</span>
                <span style={{ color: '#79F2C0', fontWeight: 700 }}>●</span>
                <span>Connectivity-aware scoring.</span>
              </p>
            </div>
          </motion.div>

          {/* Right Column: 3D Integrity Scoring Engine Visual */}
          <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            id="scoring-engine"
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
              className="card-indigo"
            >
              {/* Card Header & Decoupling Toggle */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  backgroundColor: 'rgba(11, 16, 32, 0.6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cpu size={16} color="#79F2C0" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.04em', color: '#F8FAFC' }}>
                    INTEGRITY SCORING ENGINE
                  </span>
                </div>

                {/* Interactive Toggle */}
                <button
                  onClick={() => setIsDecoupled(!isDecoupled)}
                  title="Click to toggle between Legacy Proctor and FairProctor AI Decoupling"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: isDecoupled ? 'rgba(121, 242, 192, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isDecoupled ? '#79F2C0' : '#EF4444'}`,
                    padding: '0.3rem 0.65rem',
                    borderRadius: '6px',
                    color: isDecoupled ? '#79F2C0' : '#EF4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>{isDecoupled ? 'Connectivity Decoupled: ON' : 'Legacy Conflated: ON'}</span>
                </button>
              </div>

              {/* 3D Orbiting Engine Canvas */}
              <div
                style={{
                  position: 'relative',
                  height: '320px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  overflow: 'hidden'
                }}
              >
                {/* Precision Crafted Concentric Orbiting Rings (SVG) */}
                <svg
                  viewBox="0 0 360 360"
                  style={{
                    position: 'absolute',
                    width: '320px',
                    height: '320px',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Outer Ring */}
                  <circle
                    cx="180"
                    cy="180"
                    r="150"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(121, 242, 192, 0.18)' : 'rgba(239, 68, 68, 0.22)'}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  {/* Middle Ring */}
                  <circle
                    cx="180"
                    cy="180"
                    r="110"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(121, 242, 192, 0.25)' : 'rgba(239, 68, 68, 0.3)'}
                    strokeWidth="1.5"
                    strokeDasharray="8 4"
                  />
                  {/* Inner Orbit */}
                  <circle
                    cx="180"
                    cy="180"
                    r="70"
                    fill="none"
                    stroke={isDecoupled ? '#79F2C0' : '#EF4444'}
                    strokeOpacity="0.4"
                    strokeWidth="2"
                  />
                  {/* Radial Crosshairs */}
                  <line x1="180" y1="20" x2="180" y2="340" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  <line x1="20" y1="180" x2="340" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </svg>

                {/* Central Translucent Geometric Object */}
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: isDecoupled ? [1, 1.04, 1] : [1, 0.98, 1]
                  }}
                  transition={{
                    rotate: { duration: 32, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '24px',
                    background: isDecoupled
                      ? 'linear-gradient(135deg, rgba(121, 242, 192, 0.22) 0%, rgba(21, 28, 53, 0.8) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(21, 28, 53, 0.8) 100%)',
                    border: `1.5px solid ${isDecoupled ? 'rgba(121, 242, 192, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDecoupled
                      ? '0 0 35px rgba(121, 242, 192, 0.3)'
                      : '0 0 35px rgba(239, 68, 68, 0.35)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 2
                  }}
                >
                  <ShieldCheck size={38} color={isDecoupled ? '#79F2C0' : '#EF4444'} />
                </motion.div>

                {/* Orbiting Telemetry Nodes */}
                {signals.map((sig, idx) => {
                  const angles = [30, 150, 270];
                  const angleRad = (angles[idx] * Math.PI) / 180;
                  const radius = 115;
                  const x = Math.cos(angleRad) * radius;
                  const y = Math.sin(angleRad) * radius;

                  const isSelected = activeSignalIndex === idx;

                  return (
                    <motion.button
                      key={sig.id}
                      onClick={() => setActiveSignalIndex(idx)}
                      whileHover={{ scale: 1.15 }}
                      aria-label={`Inspect signal ${sig.label}`}
                      style={{
                        position: 'absolute',
                        transform: `translate(${x}px, ${y}px)`,
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isSelected
                          ? isDecoupled
                            ? '#79F2C0'
                            : '#EF4444'
                          : '#151C35',
                        border: `2px solid ${isDecoupled ? '#79F2C0' : '#EF4444'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? '#0B1020' : '#FFFFFF',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                        zIndex: 3
                      }}
                    >
                      {idx === 0 && <WifiOff size={16} />}
                      {idx === 1 && <Eye size={16} />}
                      {idx === 2 && <Layers size={16} />}
                    </motion.button>
                  );
                })}

                {/* Overlay Sample Risk Score Badge (Floating Top Right) */}
                <motion.div
                  key={isDecoupled ? 'decoupled-score' : 'conflated-score'}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(11, 16, 32, 0.88)',
                    border: `1px solid ${isDecoupled ? 'rgba(121, 242, 192, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    backdropFilter: 'blur(8px)',
                    zIndex: 4,
                    textAlign: 'right'
                  }}
                >
                  <span style={{ fontSize: '0.6875rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>
                    Calculated Risk Score
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.25rem' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: isDecoupled ? '#79F2C0' : '#EF4444',
                        lineHeight: 1
                      }}
                    >
                      {isDecoupled ? '14' : '88'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>/ 100</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: isDecoupled ? '#79F2C0' : '#EF4444'
                    }}
                  >
                    {isDecoupled ? 'Low Risk · Auto-Cleared' : 'High Risk · Flagged for Cheating'}
                  </span>
                </motion.div>

                {/* Overlay Connectivity Indicator (Floating Bottom Left) */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    backgroundColor: 'rgba(11, 16, 32, 0.88)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '0.65rem 0.9rem',
                    backdropFilter: 'blur(8px)',
                    zIndex: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                    <Radio size={13} color={isDecoupled ? '#F59E0B' : '#EF4444'} />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#F8FAFC' }}>
                      CONNECTIVITY STATUS
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDecoupled ? '#79F2C0' : '#EF4444', fontWeight: 600 }}>
                    {isDecoupled
                      ? 'Packet Loss 34% (Environmental) — Flag Suppressed'
                      : 'Camera UDP Drop Confused for Dishonesty!'}
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Evidence Snippet Banner */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  backgroundColor: 'rgba(11, 16, 32, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#79F2C0' }}>
                      {signals[activeSignalIndex].time}
                    </span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {signals[activeSignalIndex].label}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                    {signals[activeSignalIndex].metric}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: isDecoupled ? 'rgba(121, 242, 192, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${isDecoupled ? 'rgba(121, 242, 192, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                    color: isDecoupled ? '#CBD5E1' : '#FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}
                >
                  {isDecoupled ? <CheckCircle2 size={16} color="#79F2C0" /> : <AlertCircle size={16} color="#EF4444" />}
                  <span>
                    {isDecoupled
                      ? `FairProctor verdict: ${signals[activeSignalIndex].fairVerdict}. No candidate penalty.`
                      : `Legacy verdict: ${signals[activeSignalIndex].legacyVerdict}. Automatic false flag!`}
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
