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
  Clock,
  Layers
} from 'lucide-react';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks }) => {
  const [isDecoupled, setIsDecoupled] = useState<boolean>(true);
  const [activeSignalIndex, setActiveSignalIndex] = useState<number>(0);

  // Subtle 3D perspective mouse tilt
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

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
      type: 'Packet Loss 34%',
      detail: 'Uplink RTT spike (920ms)',
      fairVerdict: 'Environmental anomaly isolated. No score penalty.',
      legacyVerdict: 'Camera obstruction flagged. False penalty applied.'
    },
    {
      time: '14:35:12',
      type: 'Tab Switch',
      detail: 'Exam Formula PDF modal',
      fairVerdict: 'Approved reference resource verified in DOM.',
      legacyVerdict: 'Unauthorized browser navigation flag triggered.'
    },
    {
      time: '14:48:30',
      type: 'Keystroke Velocity',
      detail: 'Cognitive drafting cadence',
      fairVerdict: 'Natural typing variance confirmed.',
      legacyVerdict: 'Uncalibrated baseline generated low-confidence flag.'
    }
  ];

  return (
    <section
      id="overview"
      className="bg-navy-grid"
      style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '110px',
        paddingBottom: '75px',
        backgroundColor: '#061744',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '15%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(24, 184, 106, 0.1) 0%, rgba(6, 23, 68, 0) 70%)',
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
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          {/* Left: Strong Headline, Short Subtitle, 2 CTAs */}
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
                color: '#FFFFFF'
              }}
            >
              Protect exam integrity.{' '}
              <span style={{ color: '#18B86A' }}>Preserve fairness.</span>
            </h1>

            {/* Short Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.3vw, 1.2rem)',
                color: '#B8C4D9',
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
                alignItems: 'center',
                marginBottom: '2rem'
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

            {/* Concise Trust Line */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem'
              }}
            >
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <span>Evidence-led</span>
                <span style={{ color: '#18B86A' }}>·</span>
                <span>Privacy-conscious</span>
                <span style={{ color: '#18B86A' }}>·</span>
                <span>Human-reviewed</span>
              </p>
            </div>
          </motion.div>

          {/* Right: Clean Product Visualization */}
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
                maxWidth: '490px',
                position: 'relative'
              }}
              className="card-navy"
            >
              {/* Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(3, 16, 47, 0.6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <ShieldCheck size={18} color="#18B86A" />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Integrity Scoring Engine
                  </span>
                </div>

                {/* Interactive Decoupling Mode Toggle */}
                <button
                  onClick={() => setIsDecoupled(!isDecoupled)}
                  title="Click to toggle between FairProctor AI Decoupling and Legacy Proctoring"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: isDecoupled ? 'rgba(24, 184, 106, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isDecoupled ? '#18B86A' : '#EF4444'}`,
                    padding: '0.25rem 0.55rem',
                    borderRadius: '4px',
                    color: isDecoupled ? '#18B86A' : '#EF4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw size={11} />
                  <span>{isDecoupled ? 'Decoupled: Active' : 'Legacy Conflated'}</span>
                </button>
              </div>

              {/* Orbiting Concentric Canvas */}
              <div
                style={{
                  position: 'relative',
                  height: '280px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  overflow: 'hidden'
                }}
              >
                {/* SVG Concentric Rings */}
                <svg
                  viewBox="0 0 320 320"
                  style={{
                    position: 'absolute',
                    width: '280px',
                    height: '280px',
                    pointerEvents: 'none'
                  }}
                >
                  <circle
                    cx="160"
                    cy="160"
                    r="130"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(24, 184, 106, 0.15)' : 'rgba(239, 68, 68, 0.2)'}
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="92"
                    fill="none"
                    stroke={isDecoupled ? 'rgba(24, 184, 106, 0.25)' : 'rgba(239, 68, 68, 0.3)'}
                    strokeWidth="1.5"
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="60"
                    fill="none"
                    stroke={isDecoupled ? '#18B86A' : '#EF4444'}
                    strokeOpacity="0.4"
                    strokeWidth="2"
                  />
                </svg>

                {/* Central Core */}
                <motion.div
                  animate={{ scale: isDecoupled ? [1, 1.03, 1] : [1, 0.98, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '18px',
                    background: isDecoupled
                      ? 'linear-gradient(135deg, rgba(24, 184, 106, 0.2) 0%, rgba(14, 36, 99, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(14, 36, 99, 0.9) 100%)',
                    border: `1.5px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isDecoupled
                      ? '0 0 25px rgba(24, 184, 106, 0.3)'
                      : '0 0 25px rgba(239, 68, 68, 0.35)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 2
                  }}
                >
                  <ShieldCheck size={32} color={isDecoupled ? '#18B86A' : '#EF4444'} />
                </motion.div>

                {/* Floating Risk Score */}
                <div
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    backgroundColor: 'rgba(3, 16, 47, 0.92)',
                    border: `1px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    zIndex: 4,
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '0.625rem', color: '#B8C4D9', textTransform: 'uppercase' }}>
                    Risk Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '0.2rem' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: isDecoupled ? '#18B86A' : '#EF4444',
                        lineHeight: 1
                      }}
                    >
                      {isDecoupled ? '14' : '88'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#8696B2' }}>/ 100</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: isDecoupled ? '#18B86A' : '#EF4444'
                    }}
                  >
                    {isDecoupled ? 'Low Risk · Auto-Cleared' : 'Flagged · False Penalty'}
                  </span>
                </div>

                {/* Floating Connectivity Indicator */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '14px',
                    backgroundColor: 'rgba(3, 16, 47, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    zIndex: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                    <Radio size={12} color={isDecoupled ? '#F59E0B' : '#EF4444'} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FFFFFF' }}>
                      CONNECTIVITY
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDecoupled ? '#18B86A' : '#EF4444', fontWeight: 600 }}>
                    {isDecoupled ? 'Packet Loss 34% · Suppressed' : 'Packet Drop Penalized as Fraud'}
                  </div>
                </div>

                {/* Orbiting Evidence Marker Buttons */}
                {evidenceSignals.map((sig, idx) => {
                  const angles = [35, 155, 275];
                  const angleRad = (angles[idx] * Math.PI) / 180;
                  const radius = 95;
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
                        width: '32px',
                        height: '32px',
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
                        transition: 'transform 0.15s ease'
                      }}
                      title={`Inspect ${sig.type}`}
                    >
                      {idx === 0 && <Wifi size={13} />}
                      {idx === 1 && <Layers size={13} />}
                      {idx === 2 && <Clock size={13} />}
                    </button>
                  );
                })}
              </div>

              {/* Timestamped Evidence Card Snippet */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(3, 16, 47, 0.95)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
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
                    padding: '0.45rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: isDecoupled ? 'rgba(24, 184, 106, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isDecoupled ? 'rgba(24, 184, 106, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                    color: isDecoupled ? '#EAF1F7' : '#FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  {isDecoupled ? <CheckCircle2 size={15} color="#18B86A" /> : <AlertCircle size={15} color="#EF4444" />}
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
