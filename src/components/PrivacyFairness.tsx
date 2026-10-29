import React, { useState } from 'react';
import { Lock, Scale, UserCheck, FileText, ShieldCheck } from 'lucide-react';

export const PrivacyFairness: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [zeroBiometricRetention, setZeroBiometricRetention] = useState<boolean>(true);
  const [fairnessAuditLogging, setFairnessAuditLogging] = useState<boolean>(true);

  return (
    <section
      id="fairness"
      className="section-light"
      style={{
        padding: '100px 0',
        borderTop: '1px solid rgba(6, 23, 68, 0.08)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
          <div
            className="badge badge-navy"
            style={{ marginBottom: '1.25rem', backgroundColor: 'rgba(6, 23, 68, 0.08)', color: '#061744' }}
          >
            SECTION F · PRIVACY & CANDIDATE EQUITY
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.1rem, 3.8vw, 3.25rem)',
              color: '#061744',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em'
            }}
          >
            Transparent data governance.{' '}
            <span style={{ color: '#18B86A' }}>Guaranteed due process.</span>
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#344054',
              lineHeight: 1.7
            }}
          >
            Online proctoring must never compromise candidate civil liberties or harvest perpetual biometric profiles.
            FairProctor operates with purpose limitation, strict retention-based deletion, and independent auditability.
          </p>

          {/* Mandatory Core Statement Callout Banner */}
          <div
            style={{
              marginTop: '1.75rem',
              backgroundColor: '#FFFFFF',
              border: '2px solid #18B86A',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left',
              boxShadow: '0 4px 16px rgba(24, 184, 106, 0.15)'
            }}
          >
            <ShieldCheck size={24} color="#18B86A" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9375rem', color: '#061744', fontWeight: 600 }}>
              <strong>Fairness Tenet:</strong> Poor connectivity, a temporary missing face, or looking away alone{' '}
              <span style={{ color: '#DC2626', textDecoration: 'underline' }}>does not prove cheating</span>. Every
              signal requires corroborating evidence and human educator evaluation.
            </div>
          </div>
        </div>

        {/* 4 Core Privacy & Ethics Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem'
          }}
        >
          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 23, 68, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Lock size={20} color="#061744" />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#061744', marginBottom: '0.5rem', fontWeight: 700 }}>
              Biometric Zero-Retention
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#344054', lineHeight: 1.6 }}>
              Facial landmarks are processed into one-way ephemeral embeddings in client memory. Raw video files are
              never stored on permanent disk unless an escalation is confirmed.
            </p>
          </div>

          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 23, 68, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <Scale size={20} color="#061744" />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#061744', marginBottom: '0.5rem', fontWeight: 700 }}>
              Purpose Limitation
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#344054', lineHeight: 1.6 }}>
              Telemetry gathered during an assessment is used exclusively for that specific exam. Data is never sold,
              repurposed for ad profiling, or shared across commercial brokers.
            </p>
          </div>

          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 23, 68, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <UserCheck size={20} color="#061744" />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#061744', marginBottom: '0.5rem', fontWeight: 700 }}>
              Human Review Authority
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#344054', lineHeight: 1.6 }}>
              The AI engine possesses zero disciplinary authority. Only certified university professors, honor boards,
              and human proctors can make academic decisions.
            </p>
          </div>

          <div className="card-white" style={{ padding: '1.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 23, 68, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <FileText size={20} color="#061744" />
            </div>
            <h3 style={{ fontSize: '1.15rem', color: '#061744', marginBottom: '0.5rem', fontWeight: 700 }}>
              Guaranteed 48-Hour Rebuttal
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#344054', lineHeight: 1.6 }}>
              Students flagged for review receive plain-language summaries of questioned timestamps and have an
              asynchronous window to upload ISP downtime notices or statements.
            </p>
          </div>
        </div>

        {/* Interactive Retention Policy Controls */}
        <div
          id="privacy"
          className="card-white"
          style={{
            padding: '2rem',
            maxWidth: '840px',
            margin: '0 auto',
            border: '1px solid rgba(6, 23, 68, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#061744', fontWeight: 700 }}>
              Institutional Data Governance & Retention Simulator
            </h4>
            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
              FERPA & GDPR ALIGNED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#344054', display: 'block', marginBottom: '0.4rem' }}>
                Telemetry Retention Schedule: {retentionDays} Days
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#061744', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.6875rem', color: '#667085' }}>
                Automated cryptographic shredding of session buffers.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#061744' }}>
                  Zero Biometric Disk Storage
                </div>
                <div style={{ fontSize: '0.75rem', color: '#667085' }}>RAM embeddings destroyed on submit</div>
              </div>
              <input
                type="checkbox"
                checked={zeroBiometricRetention}
                onChange={(e) => setZeroBiometricRetention(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#18B86A', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#061744' }}>
                  Bandwidth Parity Auditing
                </div>
                <div style={{ fontSize: '0.75rem', color: '#667085' }}>Zero false flag rate divergence</div>
              </div>
              <input
                type="checkbox"
                checked={fairnessAuditLogging}
                onChange={(e) => setFairnessAuditLogging(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#18B86A', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(6, 23, 68, 0.05)',
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: '#344054',
              lineHeight: 1.5
            }}
          >
            <strong>Equity Audit Result:</strong> In comparative benchmark simulations against legacy video proctors,
            FairProctor’s connectivity-aware isolation reduced false academic investigations for low-bandwidth candidates
            by <strong style={{ color: '#061744' }}>94.2%</strong>.
          </div>
        </div>
      </div>
    </section>
  );
};
