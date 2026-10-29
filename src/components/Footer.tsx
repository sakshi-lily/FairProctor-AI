import React from 'react';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';

interface FooterProps {
  onExploreDemo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onExploreDemo }) => {
  return (
    <>
      {/* Section G: Closing CTA */}
      <section
        className="section-alt"
        style={{
          position: 'relative',
          padding: '80px 0',
          backgroundColor: '#F7F9FC',
          textAlign: 'center',
          borderTop: '1px solid #E4E7EC'
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
              maxWidth: '800px',
              margin: '0 auto 1rem auto',
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#101828'
            }}
          >
            Fair assessments start with better evidence.
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#475467',
              maxWidth: '560px',
              margin: '0 auto 2rem auto',
              lineHeight: 1.6
            }}
          >
            Help reviewers focus on meaningful signals, not environmental noise.
          </p>

          <button onClick={onExploreDemo} className="btn btn-green">
            <span>Explore the Demo</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Compact Enterprise Footer */}
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E4E7EC',
          padding: '2rem 0'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.25rem'
            }}
          >
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#101828' }}>
                FairProctor <span style={{ color: '#16A765' }}>AI</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#667085', marginLeft: '0.5rem' }}>
                · IM-102 Hackathon Prototype
              </span>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
              <a href="#overview" style={{ color: '#475467', textDecoration: 'none', fontWeight: 500 }}>Platform</a>
              <a href="#workflow" style={{ color: '#475467', textDecoration: 'none', fontWeight: 500 }}>How It Works</a>
              <a href="#fairness" style={{ color: '#475467', textDecoration: 'none', fontWeight: 500 }}>Privacy</a>
              <a href="mailto:contact@fairproctor.ai" style={{ color: '#16A765', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                <Mail size={12} />
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div style={{ fontSize: '0.75rem', color: '#667085' }}>
              © 2026 FairProctor AI. Independent prototype.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
