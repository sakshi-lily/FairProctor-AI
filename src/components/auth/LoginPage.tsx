import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const LoginPage: React.FC = () => {
  const { login, setActiveView } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your email address and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email: email.trim(), password, rememberMe });
    } catch (err: any) {
      setErrorMessage(err.data?.message || err.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const autofillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: '#F7F9FC',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E4E7EC',
          boxShadow: '0 8px 30px -4px rgba(16, 24, 40, 0.08)',
          padding: '2.5rem 2.25rem',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#E8F8EF',
              border: '1px solid rgba(22, 167, 101, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={24} color="#16A765" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#101828', letterSpacing: '-0.025em' }}>
            Sign In to FairProctor AI
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.35rem' }}>
            Enter your credentials to access your authorized integrity portal.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              color: '#B91C1C',
              fontSize: '0.875rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.4rem' }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#101828',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label
                htmlFor="login-password"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: '#344054' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setActiveView('forgot-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#16A765',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#101828',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#667085',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#16A765',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="remember-me"
              style={{ fontSize: '0.875rem', color: '#475467', cursor: 'pointer', userSelect: 'none' }}
            >
              Remember me on this trusted device (30-day secure session)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-green"
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E4E7EC' }}>
          <p style={{ fontSize: '0.875rem', color: '#475467' }}>
            Don't have a candidate account?{' '}
            <button
              type="button"
              onClick={() => setActiveView('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#16A765',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Register Candidate Profile
            </button>
          </p>
        </div>

        {/* Quick Demo Credentials Assistant */}
        <div
          style={{
            marginTop: '1.75rem',
            padding: '1rem',
            backgroundColor: '#F8F9FC',
            borderRadius: '8px',
            border: '1px solid #E4E7EC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <CheckCircle2 size={15} color="#16A765" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#344054' }}>
              Quick Evaluation Autofill
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => autofillDemo('admin@fairproctor.ai', 'Admin@FairProctor2026!')}
              style={{
                padding: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D0D5DD',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#101828',
              }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('reviewer@fairproctor.ai', 'Reviewer@FairProctor2026!')}
              style={{
                padding: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D0D5DD',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#101828',
              }}
            >
              🔍 Reviewer
            </button>
            <button
              type="button"
              onClick={() => autofillDemo('candidate@fairproctor.ai', 'Candidate@FairProctor2026!')}
              style={{
                padding: '0.45rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D0D5DD',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#101828',
              }}
            >
              🎓 Candidate
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
