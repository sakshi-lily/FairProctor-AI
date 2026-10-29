import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const UnauthorizedPage: React.FC = () => {
  const { user, setActiveView, navigateToRolePortal } = useAuth();

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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E4E7EC',
          boxShadow: '0 8px 30px -4px rgba(16, 24, 40, 0.08)',
          padding: '2.5rem 2.25rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#FEF3F2',
            border: '1px solid #FECDCA',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={28} color="#D92D20" />
        </div>

        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#101828', letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
          403 — Access Restricted
        </h1>

        <p style={{ fontSize: '0.9375rem', color: '#475467', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your current account is authenticated as{' '}
          <strong style={{ color: '#101828', textTransform: 'capitalize' }}>
            {user ? user.role : 'Unauthenticated'}
          </strong>
          . Server-enforced role-based access control (RBAC) prevents unauthorized access to this administrative or review resource.
        </p>

        <div
          style={{
            backgroundColor: '#F8F9FC',
            border: '1px solid #E4E7EC',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'left',
            marginBottom: '1.75rem',
            fontSize: '0.8125rem',
            color: '#344054',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.35rem', color: '#101828' }}>
            <Lock size={14} color="#D92D20" />
            <span>Cryptographic Access Policy</span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.5, color: '#475467' }}>
            Access to Reviewer queues and Administrator consoles requires verified elevated privileges provisioned through institutional governance. Client-side URL tampering is automatically intercepted and audited.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveView('landing')}
            className="btn btn-outline-navy"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={navigateToRolePortal}
              className="btn btn-green"
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <span>Go to My Authorized Portal</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
