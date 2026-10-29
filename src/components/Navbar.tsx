import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
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
    { label: 'Fairness', href: '#fairness' }
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
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E4E7EC',
          boxShadow: scrolled ? '0 1px 3px rgba(16, 24, 40, 0.05)' : 'none'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px'
          }}
        >
          {/* Brand Wordmark with Shield/Check */}
          <a
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: '#101828'
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '7px',
                backgroundColor: '#E8F8EF',
                border: '1px solid rgba(22, 167, 101, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={19} color="#16A765" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.025em', color: '#101828' }}>
                FairProctor
              </span>
              <span
                style={{
                  backgroundColor: '#E8F8EF',
                  color: '#16A765',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid rgba(22, 167, 101, 0.25)'
                }}
              >
                AI
              </span>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2.25rem',
              margin: '0 auto'
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  color: '#475467',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#101828')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475467')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action */}
          <div
            style={{
              display: 'none',
              alignItems: 'center'
            }}
            className="desktop-actions"
          >
            <a href="#interactive-demo" className="btn btn-green btn-sm">
              <span>Explore Demo</span>
              <ArrowRight size={14} />
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
              width: '38px',
              height: '38px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              color: '#101828',
              cursor: 'pointer'
            }}
            className="mobile-burger"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              top: '68px',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E4E7EC',
              padding: '1.25rem 1.5rem',
              zIndex: 99,
              boxShadow: '0 16px 36px rgba(16, 24, 40, 0.08)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#101828',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.4rem 0'
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ marginTop: '0.75rem' }}>
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
