import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock, Key, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { authClient } from '../../api/authClient';

export const ResetPasswordPage: React.FC = () => {
  const { resetToken, setActiveView } = useAuth();

  const [tokenInput, setTokenInput] = useState(resetToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!tokenInput.trim()) {
      setErrorMessage('Please provide a valid recovery token.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await authClient.resetPassword({
        token: tokenInput.trim(),
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.data?.message || err.message || 'Password reset token is invalid or has expired. Please request a new link.'
      );
    } finally {
      setSubmitting(false);
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
            Set New Password
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.35rem' }}>
            Enter your secure single-use token and choose a strong new password.
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

        {/* Success State */}
        {success ? (
          <div>
            <div
              style={{
                backgroundColor: '#ECFDF3',
                border: '1px solid #A6F4C5',
                borderRadius: '10px',
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1.75rem',
                color: '#027A48',
              }}
            >
              <CheckCircle2 size={36} color="#16A765" style={{ margin: '0 auto 0.75rem auto' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#05603A', marginBottom: '0.35rem' }}>
                Password Updated Successfully
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#067647', lineHeight: 1.5 }}>
                Your master credentials have been securely updated in the database. You may now log in to access your portal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="btn btn-green"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Recovery Token */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="reset-token"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.4rem' }}
              >
                Security Recovery Token
              </label>
              <div style={{ position: 'relative' }}>
                <Key
                  size={18}
                  color="#667085"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reset-token"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste 64-character token"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
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

            {/* New Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="reset-new-password"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.4rem' }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#667085"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.5rem',
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

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                htmlFor="reset-confirm-password"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.4rem' }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#667085"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reset-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '0.9375rem',
                    borderRadius: '8px',
                    border: `1px solid ${confirmPassword && newPassword !== confirmPassword ? '#FCA5A5' : '#D0D5DD'}`,
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                    color: '#101828',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                  onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                />
              </div>
            </div>

            {/* Submit */}
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
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
