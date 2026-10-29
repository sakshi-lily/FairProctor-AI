import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ArrowRight, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenPreTest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPreTest }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '#overview' },
    { label: 'How It Works', href: '#workflow' },
    { label: 'Features', href: '#features' },
    { label: 'Fairness', href: '#fairness' },
    { label: 'Privacy', href: '#privacy' }
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.25s ease',
          backgroundColor: scrolled ? 'rgba(3, 16, 47, 0.96)' : 'rgba(6, 23, 68, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px'
          }}
        >
          {/* Left: Original FairProctor AI Wordmark with Shield/Check */}
          <a
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: '#FFFFFF'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#0E2463',
                border: '1px solid rgba(24, 184, 106, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}
            >
              <ShieldCheck size={20} color="#18B86A" />
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', color: '#FFFFFF' }}>
                  FairProctor
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(24, 184, 106, 0.15)',
                    color: '#18B86A',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(24, 184, 106, 0.35)'
                  }}
                >
                  AI
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#B8C4D9',
                  letterSpacing: '0.05em',
                  display: 'block',
                  lineHeight: 1,
                  fontWeight: 600
                }}
              >
                ASSESSMENT INTEGRITY
              </span>
            </div>
          </a>

          {/* Center: Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
              margin: '0 auto'
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: '#B8C4D9',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                  padding: '0.25rem 0'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#B8C4D9')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Actions (Diagnostic + Prominent Green "Explore Demo") */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.85rem'
            }}
            className="desktop-actions"
          >
            <button
              onClick={onOpenPreTest}
              className="btn btn-outline-white btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Activity size={14} color="#79F2C0" />
              <span>Pre-Test Check</span>
            </button>

            <a href="#interactive-demo" className="btn btn-green btn-sm">
              <span>Explore Demo</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile Burger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: '#0E2463',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            className="mobile-burger"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              backgroundColor: '#03102F',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '1.5rem',
              zIndex: 99,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPreTest();
                  }}
                  className="btn btn-outline-white"
                  style={{ width: '100%' }}
                >
                  <Activity size={16} color="#79F2C0" />
                  <span>Run Pre-Test Check</span>
                </button>
                <a
                  href="#interactive-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-green"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Explore Demo
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 960px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-burger { display: none !important; }
        }
      `}</style>
    </>
  );
};
