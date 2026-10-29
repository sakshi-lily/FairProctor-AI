import React from 'react';
import { ShieldCheck, ArrowRight, Activity, Mail } from 'lucide-react';

interface FooterProps {
  onExploreDemo: () => void;
  onOpenPreTest: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onExploreDemo, onOpenPreTest }) => {
  return (
    <>
      {/* Section G: Closing CTA Banner */}
      <section
        style={{
          position: 'relative',
          padding: '100px 0',
          backgroundColor: '#03102F',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Subtle Green Ambient Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(ellipse, rgba(24, 184, 106, 0.15) 0%, rgba(3, 16, 47, 0) 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="badge badge-green" style={{ marginBottom: '1.25rem' }}>
            SECTION G · ENTERPRISE ASSESSMENTS
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
              maxWidth: '850px',
              margin: '0 auto 1.25rem auto',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Fair assessments start with better evidence.
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
              color: '#B8C4D9',
              maxWidth: '620px',
              margin: '0 auto 2.25rem auto',
              lineHeight: 1.65
            }}
          >
            Help reviewers focus on meaningful signals, not environmental noise.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <button onClick={onExploreDemo} className="btn btn-green">
              <span>Explore the Demo</span>
              <ArrowRight size={16} />
            </button>

            <button onClick={onOpenPreTest} className="btn btn-outline-white">
              <Activity size={16} color="#79F2C0" />
              <span>Pre-Test Diagnostic</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Corporate Footer */}
      <footer
        style={{
          backgroundColor: '#061744',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '65px',
          paddingBottom: '50px'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '3rem',
              marginBottom: '3.5rem'
            }}
          >
            {/* Col 1: Brand & Wordmark */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '6px',
                    backgroundColor: '#0E2463',
                    border: '1px solid rgba(24, 184, 106, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={18} color="#18B86A" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF' }}>
                  FairProctor <span style={{ color: '#18B86A' }}>AI</span>
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#B8C4D9', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                An explainable, connectivity-aware exam integrity platform engineered to eliminate false accusations
                from network latency.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(14, 36, 99, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#FFFFFF'
                }}
              >
                <span>Integraminds IM-102 Hackathon</span>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                PLATFORM
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Scoring Engine Overview', href: '#overview' },
                  { label: 'Reviewer Triage Dashboard', href: '#interactive-demo' },
                  { label: 'How It Works (Workflow)', href: '#workflow' },
                  { label: 'Five Core Capabilities', href: '#features' },
                  { label: 'Mobile Pre-Test Diagnostic', href: '#pretest' }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontSize: '0.875rem',
                        color: '#B8C4D9',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#B8C4D9')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Privacy & Due Process */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                PRIVACY & FAIRNESS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Informed Consent Charter', href: '#fairness' },
                  { label: 'Biometric Zero-Retention', href: '#fairness' },
                  { label: 'Bandwidth Equity Auditing', href: '#fairness' },
                  { label: '48-Hour Student Appeals', href: '#fairness' },
                  { label: 'Retention Policy Simulator', href: '#privacy' }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontSize: '0.875rem',
                        color: '#B8C4D9',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#B8C4D9')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Prototype Disclaimer & Contact */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                CONTACT & PROTOTYPE
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', lineHeight: 1.6, marginBottom: '1rem' }}>
                Developed for the Integraminds IM-102 Hackathon. All candidate names, scores, and logs are illustrative
                synthetic demo data.
              </p>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#8696B2',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '0.75rem',
                  lineHeight: 1.5,
                  marginBottom: '1rem'
                }}
              >
                Note: Independent hackathon prototype. Does not represent an official partnership or endorsement by
                Integraminds.
              </div>
              <a
                href="mailto:contact@fairproctor.ai"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#18B86A',
                  fontSize: '0.8125rem',
                  textDecoration: 'none'
                }}
              >
                <Mail size={14} />
                <span>contact@fairproctor.ai</span>
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8125rem',
              color: '#8696B2'
            }}
          >
            <div>
              FairProctor AI · IM-102 Hackathon · Platform · Privacy · Contact.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#18B86A',
                    boxShadow: '0 0 6px #18B86A'
                  }}
                />
                Scoring Engine: Active
              </span>
              <span>Connectivity Decoupled</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
