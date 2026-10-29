import { Shield, ArrowRight, Activity } from 'lucide-react';

interface FooterProps {
  onExploreDemo: () => void;
  onOpenPreTest: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onExploreDemo, onOpenPreTest }) => {
  return (
    <>
      {/* Closing CTA Banner */}
      <section
        style={{
          position: 'relative',
          padding: '100px 0',
          backgroundColor: '#0B1020',
          overflow: 'hidden',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(ellipse, rgba(121, 242, 192, 0.12) 0%, rgba(11, 16, 32, 0) 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="badge badge-mint" style={{ marginBottom: '1.25rem' }}>
            ASSESSMENTS WITHOUT BIAS
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
              maxWidth: '850px',
              margin: '0 auto 1.5rem auto',
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              color: '#FFFFFF'
            }}
          >
            Integrity should be evidence-based.{' '}
            <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
              Fairness should be built in.
            </span>
          </h2>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
              color: '#94A3B8',
              maxWidth: '620px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6
            }}
          >
            Empower educators with clear, transparent anomaly signals while shielding students from punitive false
            alarms caused by ordinary network conditions.
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
            <button onClick={onExploreDemo} className="btn btn-primary">
              <span>Explore the Demo</span>
              <ArrowRight size={16} />
            </button>

            <button onClick={onOpenPreTest} className="btn btn-secondary">
              <Activity size={16} />
              <span>Run System Diagnostic</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer
        style={{
          backgroundColor: '#070B16',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '60px',
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
            {/* Col 1: Brand & Hackathon Context */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: '#151C35',
                    border: '1px solid rgba(121, 242, 192, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Shield size={18} color="#79F2C0" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#FFFFFF' }}>
                  FairProctor <span style={{ color: '#79F2C0' }}>AI</span>
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1rem' }}>
                An explainable, connectivity-aware online exam integrity platform. Built with human-in-the-loop review
                and zero biometric retention.
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(21, 28, 53, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#CBD5E1'
                }}
              >
                <span>Integraminds IM-102 Hackathon</span>
              </div>
            </div>

            {/* Col 2: Architecture & Platform */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                PLATFORM CAPABILITIES
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Connectivity Decoupler', href: '#features' },
                  { label: 'Multi-Signal Correlation', href: '#features' },
                  { label: 'Explainable Decision Graphs', href: '#features' },
                  { label: 'Reviewer Triage Queue', href: '#interactive-demo' },
                  { label: '48-Hour Student Appeals', href: '#workflow' }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontSize: '0.875rem',
                        color: '#94A3B8',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#79F2C0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Principles & Due Process */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                ETHICS & PRIVACY
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Biometric Zero-Retention', href: '#fairness' },
                  { label: 'Bandwidth Equity Auditing', href: '#fairness' },
                  { label: 'FERPA & GDPR Alignment', href: '#fairness' },
                  { label: 'Explainable AI Transparency', href: '#fairness' },
                  { label: 'Human-Led Sanctions Only', href: '#fairness' }
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      style={{
                        fontSize: '0.875rem',
                        color: '#94A3B8',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#79F2C0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Hackathon Disclaimer & Prototype Note */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
                PROTOTYPE NOTICE
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1rem' }}>
                This software is an engineering submission developed for the Integraminds IM-102 hackathon. All sample
                session names, telemetry spikes, and risk scores are illustrative synthetic demo data.
              </p>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '0.75rem',
                  lineHeight: 1.5
                }}
              >
                Note: This project is an independent hackathon prototype and does not represent an official partnership
                or verified integration with Integraminds.
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.8125rem',
              color: '#64748B'
            }}
          >
            <div>
              © 2026 FairProctor AI · Integraminds IM-102 Hackathon Prototype.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#79F2C0' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#79F2C0',
                    boxShadow: '0 0 6px #79F2C0'
                  }}
                />
                Engine Status: Nominal
              </span>
              <span>All telemetries decoupled</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
