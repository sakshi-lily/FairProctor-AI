import React, { useState } from 'react';
import { Lock, Scale, UserCheck, FileText, ShieldCheck } from 'lucide-react';

export const PrivacyFairness: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [zeroBiometricRetention, setZeroBiometricRetention] = useState<boolean>(true);
  const [fairnessAuditLogging, setFairnessAuditLogging] = useState<boolean>(true);

  const pillars = [
    {
      icon: Lock,
      title: 'Biometric Zero-Retention',
      desc: 'Facial landmarks are processed into one-way ephemeral RAM embeddings and discarded post-exam.'
    },
    {
      icon: Scale,
      title: 'Purpose Limitation',
      desc: 'Telemetry is gathered exclusively for exam integrity and never sold or shared with commercial brokers.'
    },
    {
      icon: UserCheck,
      title: 'Human Review Authority',
      desc: 'AI provides advisory triage. Only certified faculty and educators possess disciplinary authority.'
    },
    {
      icon: FileText,
      title: 'Guaranteed 48-Hour Rebuttal',
      desc: 'Candidates receive plain-language summaries of questioned events with time to submit ISP logs.'
    }
  ];

  return (
    <section
      id="fairness"
      className="section-white"
      style={{
        padding: '85px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E4E7EC'
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '720px', margin: '0 auto 2.5rem auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              color: '#101828',
              lineHeight: 1.2,
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em'
            }}
          >
            Privacy & fairness by design.
          </h2>
          <p style={{ fontSize: '1rem', color: '#475467', lineHeight: 1.55, margin: 0 }}>
            Purpose limitation, secure RAM processing, retention-based deletion, and human-in-the-loop review.
          </p>

          {/* Essential Core Principle Banner */}
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#E8F8EF',
              border: '1px solid rgba(22, 167, 101, 0.4)',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              textAlign: 'left'
            }}
          >
            <ShieldCheck size={20} color="#16A765" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', color: '#101828', fontWeight: 600 }}>
              Poor connectivity, a temporary missing face, or looking away alone does not prove cheating.
            </span>
          </div>
        </div>

        {/* 4 Clean Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          {pillars.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="card-white" style={{ padding: '1.5rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#E8F8EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <IconComp size={18} color="#16A765" />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: '#101828', marginBottom: '0.35rem', fontWeight: 700 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#475467', margin: 0, lineHeight: 1.55 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Minimal Retention Simulator */}
        <div
          id="privacy"
          className="card-white"
          style={{
            padding: '1.5rem',
            maxWidth: '780px',
            margin: '0 auto',
            backgroundColor: '#F7F9FC',
            border: '1px solid #E4E7EC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9375rem', color: '#101828', fontWeight: 700 }}>
              Data Governance & Retention Simulator
            </span>
            <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
              FERPA & GDPR ALIGNED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475467', display: 'block', marginBottom: '0.3rem' }}>
                Retention: {retentionDays} Days (Auto-Purged)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#16A765', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: '#475467', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={zeroBiometricRetention}
                  onChange={(e) => setZeroBiometricRetention(e.target.checked)}
                  style={{ accentColor: '#16A765' }}
                />
                <span>Zero Biometric Disk Storage</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: '#475467', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={fairnessAuditLogging}
                  onChange={(e) => setFairnessAuditLogging(e.target.checked)}
                  style={{ accentColor: '#16A765' }}
                />
                <span>Bandwidth Parity Auditing</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
