import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Menu, X, ArrowUpRight } from 'lucide-react';

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
    { label: 'Scoring Engine', href: '#scoring-engine' },
    { label: 'Interactive Demo', href: '#interactive-demo' },
    { label: 'Multi-Signal', href: '#features' },
    { label: 'Workflow', href: '#workflow' },
    { label: 'Ethics & Due Process', href: '#fairness' }
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
          transition: 'all 0.3s ease',
          backgroundColor: scrolled ? 'rgba(11, 16, 32, 0.92)' : 'rgba(11, 16, 32, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px'
          }}
        >
          {/* Brand Logo */}
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
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#151C35',
                border: '1px solid rgba(121, 242, 192, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(121, 242, 192, 0.15)'
              }}
            >
              <Shield size={20} color="#79F2C0" />
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>
                  FairProctor
                </span>
                <span
                  style={{
                    backgroundColor: 'rgba(121, 242, 192, 0.15)',
                    color: '#79F2C0',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(121, 242, 192, 0.3)'
                  }}
                >
                  AI
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#94A3B8',
                  letterSpacing: '0.04em',
                  display: 'block',
                  lineHeight: 1
                }}
              >
                IM-102 HACKATHON
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.75rem',
              margin: '0 auto',
              padding: '0 1.5rem'
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: '#94A3B8',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease',
                  padding: '0.25rem 0'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#79F2C0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Area */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.875rem'
            }}
            className="desktop-actions"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: '#79F2C0',
                backgroundColor: 'rgba(121, 242, 192, 0.08)',
                padding: '0.35rem 0.65rem',
                borderRadius: '9999px',
                border: '1px solid rgba(121, 242, 192, 0.2)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#79F2C0',
                  boxShadow: '0 0 8px #79F2C0'
                }}
              />
              <span style={{ fontWeight: 600 }}>Connectivity Decoupled</span>
            </div>

            <button
              onClick={onOpenPreTest}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Activity size={14} />
              <span>Diagnostic Check</span>
            </button>

            <a
              href="#interactive-demo"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <span>Inspect Sessions</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: 'rgba(21, 28, 53, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#F8FAFC',
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '76px',
              left: 0,
              right: 0,
              backgroundColor: '#0B1020',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              zIndex: 99,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#F8FAFC',
                    textDecoration: 'none',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
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
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Activity size={16} />
                  <span>Run Pre-Test Check</span>
                </button>
                <a
                  href="#interactive-demo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Inspect Live Sessions
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
