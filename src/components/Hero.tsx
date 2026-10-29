import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type Variants } from 'framer-motion';
import {
  ShieldCheck,
  Wifi,
  ExternalLink,
  Users,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  label: 'Environmental' | 'Review';
  status?: string;
  supportingNote?: string;
  icon: typeof Wifi;
  nodeColor: string;
  nodeBorder: string;
  nodeGlow: string;
  labelColor: string;
  labelBg: string;
  labelBorder: string;
  statusColor?: string;
  statusBg?: string;
  statusBorder?: string;
  cardBorderHover: string;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks }) => {
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

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
    setHoveredEventId(null);
  };

  const timelineEvents: TimelineEvent[] = [
    {
      id: 'ev-network',
      time: '14:22:08',
      title: 'Network interruption',
      description: 'Connection unstable for 28 seconds.',
      label: 'Environmental',
      status: 'Excluded from risk score.',
      icon: Wifi,
      nodeColor: '#0284C7',
      nodeBorder: '#BAE6FD',
      nodeGlow: 'rgba(2, 132, 199, 0.15)',
      labelColor: '#0284C7',
      labelBg: '#E0F2FE',
      labelBorder: '#BAE6FD',
      statusColor: '#16A765',
      statusBg: '#E8F8EF',
      statusBorder: 'rgba(22, 167, 101, 0.25)',
      cardBorderHover: '#0284C7'
    },
    {
      id: 'ev-tab',
      time: '14:24:31',
      title: 'Tab focus changed',
      description: 'Switched to another application.',
      label: 'Review',
      status: 'Context required.',
      icon: ExternalLink,
      nodeColor: '#D97706',
      nodeBorder: '#FCD34D',
      nodeGlow: 'rgba(217, 119, 6, 0.15)',
      labelColor: '#B45309',
      labelBg: '#FEF3C7',
      labelBorder: '#FCD34D',
      statusColor: '#B45309',
      statusBg: '#FFFBEB',
      statusBorder: '#FDE68A',
      cardBorderHover: '#F59E0B'
    },
    {
      id: 'ev-pattern',
      time: '14:26:10',
      title: 'Answer pattern similarity',
      description: 'Similar responses detected.',
      label: 'Review',
      supportingNote: '3 sessions · review evidence',
      icon: Users,
      nodeColor: '#2563EB',
      nodeBorder: '#BFDBFE',
      nodeGlow: 'rgba(37, 99, 235, 0.15)',
      labelColor: '#B45309',
      labelBg: '#FEF3C7',
      labelBorder: '#FCD34D',
      cardBorderHover: '#3B82F6'
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
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
          {/* Left: Headline, Subtitle, Exactly 2 CTAs, No Trust Row */}
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

            {/* Exactly Two CTAs without any trailing trust labels */}
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

          {/* Right: Evidence Timeline Panel (Light Theme Dashboard) */}
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
                maxWidth: '510px',
                position: 'relative',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                boxShadow: '0 20px 40px -15px rgba(16, 24, 40, 0.08), 0 0 0 1px rgba(22, 167, 101, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Panel Header */}
              <div
                style={{
                  padding: '1.1rem 1.25rem',
                  borderBottom: '1px solid #E4E7EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F7F9FC',
                  flexWrap: 'wrap',
                  gap: '0.6rem'
                }}
              >
                {/* Left: Shield icon + Title + LIVE DEMO badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: '#E8F8EF',
                      border: '1px solid rgba(22, 167, 101, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShieldCheck size={16} color="#16A765" />
                  </div>

                  <span
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: '#101828',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Evidence Timeline
                  </span>

                  {/* LIVE DEMO Pill Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      backgroundColor: '#E8F8EF',
                      border: '1px solid rgba(22, 167, 101, 0.3)',
                      color: '#16A765'
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
                    <span>LIVE DEMO</span>
                  </div>
                </div>

                {/* Right: Review Priority: Medium */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.22rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#FEF3C7',
                    border: '1px solid #FCD34D',
                    color: '#92400E'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#D97706'
                    }}
                  />
                  <span>
                    Review Priority: <strong style={{ color: '#B45309' }}>Medium</strong>
                  </span>
                </div>
              </div>

              {/* Timeline Body with Vertical Connection Track */}
              <div
                style={{
                  padding: '1.25rem',
                  position: 'relative',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Continuous Vertical Track Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '28px',
                    top: '2.25rem',
                    bottom: '2.5rem',
                    width: '2px',
                    background:
                      'linear-gradient(to bottom, #BAE6FD 0%, #FDE68A 50%, #BFDBFE 100%)',
                    zIndex: 0
                  }}
                />

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  {timelineEvents.map((ev, idx) => {
                    const isHovered = hoveredEventId === ev.id;
                    const IconComponent = ev.icon;

                    return (
                      <motion.div
                        key={ev.id}
                        variants={itemVariants}
                        onMouseEnter={() => setHoveredEventId(ev.id)}
                        onMouseLeave={() => setHoveredEventId(null)}
                        style={{
                          display: 'flex',
                          gap: '0.9rem',
                          marginBottom: idx === timelineEvents.length - 1 ? 0 : '1rem',
                          alignItems: 'flex-start'
                        }}
                      >
                        {/* Timeline Node Icon */}
                        <div
                          style={{
                            flexShrink: 0,
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: `1.5px solid ${ev.nodeBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: ev.nodeColor,
                            boxShadow: isHovered ? `0 0 8px ${ev.nodeGlow}` : 'none',
                            transition: 'all 0.25s ease',
                            marginTop: '0.15rem'
                          }}
                        >
                          <IconComponent size={14} />
                        </div>

                        {/* Event Content Card */}
                        <div
                          style={{
                            flex: 1,
                            backgroundColor: isHovered ? '#F7F9FC' : '#FFFFFF',
                            border: `1px solid ${isHovered ? ev.cardBorderHover : '#E4E7EC'}`,
                            borderRadius: '8px',
                            padding: '0.75rem 0.95rem',
                            boxShadow: isHovered
                              ? '0 4px 12px rgba(16, 24, 40, 0.05)'
                              : '0 1px 3px rgba(16, 24, 40, 0.02)',
                            transition: 'all 0.2s ease',
                            transform: isHovered ? 'translateX(2px)' : 'none'
                          }}
                        >
                          {/* Row 1: Time, Title, and Label Badge */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                              marginBottom: '0.3rem'
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                flexWrap: 'wrap'
                              }}
                            >
                              <span
                                className="font-mono"
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#667085',
                                  fontWeight: 600
                                }}
                              >
                                {ev.time}
                              </span>
                              <span style={{ color: '#D0D5DD', fontSize: '0.75rem' }}>—</span>
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: '#101828'
                                }}
                              >
                                {ev.title}
                              </span>
                            </div>

                            {/* Label Badge */}
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: ev.labelBg,
                                border: `1px solid ${ev.labelBorder}`,
                                color: ev.labelColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                              }}
                            >
                              {ev.label}
                            </span>
                          </div>

                          {/* Row 2: Description */}
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: '#475467',
                              margin: '0 0 0.5rem 0',
                              lineHeight: 1.45
                            }}
                          >
                            {ev.description}
                          </p>

                          {/* Row 3: Status / Supporting Note */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              flexWrap: 'wrap'
                            }}
                          >
                            {ev.status && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.18rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: ev.statusBg,
                                  border: `1px solid ${ev.statusBorder}`,
                                  color: ev.statusColor
                                }}
                              >
                                {ev.label === 'Environmental' ? (
                                  <CheckCircle2 size={13} color="#16A765" />
                                ) : (
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: ev.statusColor
                                    }}
                                  />
                                )}
                                <span>{ev.status}</span>
                              </div>
                            )}

                            {ev.supportingNote && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.18rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  backgroundColor: '#EFF6FF',
                                  border: '1px solid #BFDBFE',
                                  color: '#1D4ED8'
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: '#3B82F6'
                                  }}
                                />
                                <span>{ev.supportingNote}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Bottom Information Strip */}
              <div
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#F7F9FC',
                  borderTop: '1px solid #E4E7EC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}
              >
                <CheckCircle2 size={16} color="#16A765" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: '#475467',
                    fontWeight: 500,
                    lineHeight: 1.4
                  }}
                >
                  Every flag includes a timestamp and a human-readable reason.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
