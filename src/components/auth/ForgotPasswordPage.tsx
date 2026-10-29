import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { authClient } from '../../api/authClient';

export const ForgotPasswordPage: React.FC = () => {
  const { setActiveView, setResetToken } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<{ rawToken: string; resetUrl: string; mode: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await authClient.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.devNotice) {
        setDevNotice(res.devNotice);
      }
    } catch (err: any) {
      setErrorMessage(err.data?.message || err.message || 'Unable to process reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDevLink = () => {
    if (devNotice?.rawToken) {
      setResetToken(devNotice.rawToken);
      setActiveView('reset-password');
    }
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
        {/* Header */}
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
            Recover Access
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.35rem' }}>
            Enter your email to receive a secure, time-limited password recovery link.
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

        {/* Submitted State: Safe Message (Never Reveals Email Registration Status) */}
        {submitted ? (
          <div>
            <div
              style={{
                backgroundColor: '#ECFDF3',
                border: '1px solid #A6F4C5',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                color: '#027A48',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={20} color="#16A765" />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Instructions Dispatched</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#05603A', lineHeight: 1.5 }}>
                If an account associated with <strong>{email}</strong> exists in our verified registry, you will receive password reset instructions within moments.
              </p>
              <p style={{ fontSize: '0.75rem', color: '#067647', marginTop: '0.65rem' }}>
                For security reasons, recovery tokens expire after 15 minutes and can only be used once.
              </p>
            </div>

            {/* Development-Only Inspection Notice */}
            {devNotice && (
              <div
                style={{
                  backgroundColor: '#EFF8FF',
                  border: '1px solid #B2DDFF',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.8125rem',
                  color: '#175CD3',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <Info size={16} />
                  <span>Development Mode Token Preview</span>
                </div>
                <p style={{ marginBottom: '0.65rem', lineHeight: 1.45 }}>
                  SMTP is running in local logging mode. A secure recovery token was generated:
                </p>
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                    border: '1px solid #D1E9FF',
                    marginBottom: '0.75rem',
                  }}
                >
                  {devNotice.rawToken}
                </div>
                <button
                  type="button"
                  onClick={handleUseDevLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    backgroundColor: '#175CD3',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span>Proceed to Reset Password with Token</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="btn btn-outline-navy"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="reset-email"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.4rem' }}
              >
                Registered Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#667085"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reset-email"
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
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                  onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                />
              </div>
            </div>

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
                <span>Generating Security Token...</span>
              ) : (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveView('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475467',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Login</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
