import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Info, Check } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const RegisterPage: React.FC = () => {
  const { register, setActiveView } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage('Password must be at least 8 characters and contain both letters and numbers.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('You must acknowledge the terms and integrity privacy charter.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        termsAccepted,
      });
    } catch (err: any) {
      setErrorMessage(err.data?.message || err.message || 'Registration failed. Please try again.');
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
          maxWidth: '500px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E4E7EC',
          boxShadow: '0 8px 30px -4px rgba(16, 24, 40, 0.08)',
          padding: '2.5rem 2.25rem',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
              marginBottom: '0.85rem',
            }}
          >
            <ShieldCheck size={24} color="#16A765" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#101828', letterSpacing: '-0.025em' }}>
            Register Candidate Account
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.35rem' }}>
            Create your verified student profile for connectivity-aware online assessments.
          </p>
        </div>

        {/* Access Policy Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '8px',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: '#0369A1',
            lineHeight: 1.45,
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>RBAC Access Policy:</strong> Public registration automatically assigns the{' '}
            <span style={{ fontWeight: 700, textDecoration: 'underline' }}>Candidate</span> role. Institutional Reviewer or Administrator privileges must be provisioned by an authorized administrator.
          </div>
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
          {/* Full Name */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              htmlFor="reg-name"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.35rem' }}
            >
              Full Legal Name
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Rostova"
                required
                autoComplete="name"
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

          {/* Email */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              htmlFor="reg-email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.35rem' }}
            >
              Academic or Institutional Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
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

          {/* Password */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label
              htmlFor="reg-password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.35rem' }}
            >
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* Password strength criteria pills */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: hasMinLength ? '#16A765' : '#667085',
                }}
              >
                {hasMinLength ? <Check size={12} /> : '•'} 8+ characters
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: hasLetter ? '#16A765' : '#667085',
                }}
              >
                {hasLetter ? <Check size={12} /> : '•'} Letters
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: hasNumber ? '#16A765' : '#667085',
                }}
              >
                {hasNumber ? <Check size={12} /> : '•'} Numbers
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="reg-confirm-password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#344054', marginBottom: '0.35rem' }}
            >
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="#667085"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="reg-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                autoComplete="new-password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  fontSize: '0.9375rem',
                  borderRadius: '8px',
                  border: `1px solid ${
                    confirmPassword && !passwordsMatch ? '#FCA5A5' : '#D0D5DD'
                  }`,
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  color: '#101828',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#16A765')}
                onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Terms and Privacy Acknowledgement */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '1.75rem' }}>
            <input
              id="reg-terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: '#16A765',
                marginTop: '3px',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="reg-terms"
              style={{ fontSize: '0.8125rem', color: '#475467', lineHeight: 1.45, cursor: 'pointer' }}
            >
              I acknowledge the FairProctor AI <strong>Biometric Privacy Charter</strong> (RAM-only vector expunction, 0 permanent biometric storage) and agree to examination telemetry logging.
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
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Candidate Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #E4E7EC' }}>
          <p style={{ fontSize: '0.875rem', color: '#475467' }}>
            Already registered?{' '}
            <button
              type="button"
              onClick={() => setActiveView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#16A765',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Sign In to Your Account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
