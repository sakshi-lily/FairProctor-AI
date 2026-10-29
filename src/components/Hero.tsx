import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sliders } from 'lucide-react';
import heroImage from '../assets/fairproctor-hero.png';

interface HeroProps {
  onExploreDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDemo, onSeeHowItWorks }) => {
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

          {/* Right: FairProctor AI Hero Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              position: 'relative'
            }}
          >
            <img
              src={heroImage}
              alt="FairProctor AI - Secure Exams for a Fair Future"
              style={{
                width: '100%',
                maxWidth: '620px',
                height: 'auto',
                aspectRatio: '2 / 1',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
