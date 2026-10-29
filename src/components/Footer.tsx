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
        style={{
          position: 'relative',
          padding: '80px 0',
          backgroundColor: '#03102F',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
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
              color: '#FFFFFF'
            }}
          >
            Fair assessments start with better evidence.
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#B8C4D9',
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
          backgroundColor: '#061744',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
                  borderRadius: '5px',
                  backgroundColor: '#0E2463',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={16} color="#18B86A" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#FFFFFF' }}>
                FairProctor <span style={{ color: '#18B86A' }}>AI</span>
              </span>
              <span style={{ fontSize: '0.75rem', color: '#8696B2', marginLeft: '0.5rem' }}>
                · IM-102 Hackathon Prototype
              </span>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
              <a href="#overview" style={{ color: '#B8C4D9', textDecoration: 'none' }}>Platform</a>
              <a href="#workflow" style={{ color: '#B8C4D9', textDecoration: 'none' }}>How It Works</a>
              <a href="#features" style={{ color: '#B8C4D9', textDecoration: 'none' }}>Features</a>
              <a href="#fairness" style={{ color: '#B8C4D9', textDecoration: 'none' }}>Privacy</a>
              <a href="mailto:contact@fairproctor.ai" style={{ color: '#18B86A', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Mail size={12} />
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div style={{ fontSize: '0.75rem', color: '#8696B2' }}>
              © 2026 FairProctor AI. Independent prototype.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
