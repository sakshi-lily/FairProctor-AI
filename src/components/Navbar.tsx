import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Crown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout, activeView, setActiveView, navigateToRolePortal } = useAuth();
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
    { label: 'Fairness', href: '#fairness' },
  ];

  const handleNavClick = (href: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const id = href.replace('#', '');
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const getPortalLabel = () => {
    if (!user) return 'Portal';
    if (user.role === 'admin') return 'Admin Console';
    if (user.role === 'reviewer') return 'Reviewer Queue';
    return 'Candidate Portal';
  };

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
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E4E7EC',
          boxShadow: scrolled ? '0 1px 3px rgba(16, 24, 40, 0.05)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '68px',
          }}
        >
          {/* Brand Wordmark with Shield/Check */}
          <button
            type="button"
            onClick={() => setActiveView('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: '#101828',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
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
                justifyContent: 'center',
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
                  border: '1px solid rgba(22, 167, 101, 0.25)',
                }}
              >
                AI
              </span>
            </div>
          </button>

          {/* Center Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
              margin: '0 auto',
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (activeView !== 'landing') {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }
                }}
                style={{
                  color: '#475467',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#101828')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475467')}
              >
                {link.label}
              </a>
            ))}

            {user && (
              <button
                type="button"
                onClick={navigateToRolePortal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16A765',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: 0,
                }}
              >
                <LayoutDashboard size={15} />
                <span>{getPortalLabel()}</span>
              </button>
            )}
          </nav>

          {/* Right Action: Auth Buttons */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.65rem',
            }}
            className="desktop-actions"
          >
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {/* User Status Capsule */}
                <button
                  type="button"
                  onClick={navigateToRolePortal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.75rem',
                    backgroundColor: '#F8F9FC',
                    border: '1px solid #E4E7EC',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: '#101828',
                    fontWeight: 600,
                  }}
                >
                  {user.role === 'admin' ? (
                    <Crown size={15} color="#B42318" />
                  ) : (
                    <UserIcon size={15} color="#16A765" />
                  )}
                  <span>{user.name.split(' ')[0]}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor:
                        user.role === 'admin'
                          ? '#FEF3F2'
                          : user.role === 'reviewer'
                          ? '#F0F9FF'
                          : '#E8F8EF',
                      color:
                        user.role === 'admin'
                          ? '#B42318'
                          : user.role === 'reviewer'
                          ? '#026AA2'
                          : '#027A48',
                    }}
                  >
                    {user.role}
                  </span>
                </button>

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline-navy btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Sign out of your session"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="btn btn-outline-navy btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('register')}
                  className="btn btn-green btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} />
                  <span>Register</span>
                </button>
              </div>
            )}
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
              cursor: 'pointer',
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
              boxShadow: '0 16px 36px rgba(16, 24, 40, 0.08)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick(link.href);
                  }}
                  style={{
                    color: '#101828',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '0.4rem 0',
                  }}
                >
                  {link.label}
                </a>
              ))}

              <div style={{ borderTop: '1px solid #E4E7EC', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToRolePortal();
                      }}
                      className="btn btn-green"
                      style={{ width: '100%' }}
                    >
                      <LayoutDashboard size={16} />
                      <span>{getPortalLabel()}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="btn btn-outline-navy"
                      style={{ width: '100%' }}
                    >
                      <LogOut size={16} />
                      <span>Log Out ({user.name})</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setActiveView('login');
                      }}
                      className="btn btn-outline-navy"
                      style={{ width: '100%' }}
                    >
                      <LogIn size={16} />
                      <span>Sign In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setActiveView('register');
                      }}
                      className="btn btn-green"
                      style={{ width: '100%' }}
                    >
                      <UserPlus size={16} />
                      <span>Register Candidate</span>
                    </button>
                  </>
                )}
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
