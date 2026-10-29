import React from 'react';
import { WifiOff, Users, SunMedium, UserCheck, Scale, Lock } from 'lucide-react';

export const TrustedAssessment: React.FC = () => {
  const frictionPoints = [
    {
      icon: WifiOff,
      title: 'Unstable Connectivity',
      detail: 'Packet drops and network handovers are isolated as environmental noise, never flagged as camera tampering.'
    },
    {
      icon: Users,
      title: 'Shared Living Spaces',
      detail: 'Ambient background acoustics from family and pets are separated from active voice collaboration.'
    },
    {
      icon: SunMedium,
      title: 'Variable Room Lighting',
      detail: 'Contour tracking adapts dynamically to ambient lighting shifts without triggering false absence flags.'
    }
  ];

  return (
    <section className="section-alt" style={{ padding: '80px 0', borderTop: '1px solid #E4E7EC' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '720px', margin: '0 auto 2.75rem auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              color: '#101828',
              lineHeight: 1.2,
              marginBottom: '0.85rem',
              letterSpacing: '-0.03em'
            }}
          >
            Security should be intelligent.{' '}
            <span style={{ color: '#16A765' }}>Fairness should be fundamental.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
            Real-world testing involves network stutters, shared spaces, and varying lighting. FairProctor isolates
            environmental noise from actual behavioural evidence.
          </p>
        </div>

        {/* 3 Crisp Friction Solution Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}
        >
          {frictionPoints.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="card-white"
                style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC' }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#E8F8EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <IconComponent size={20} color="#16A765" />
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#101828', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: '#475467', margin: 0, lineHeight: 1.6 }}>
                  {item.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Concise Trust Pillars Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '8px',
            padding: '1.25rem 2rem',
            color: '#101828',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserCheck size={18} color="#16A765" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#101828' }}>Human-Led Review Authority</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Scale size={18} color="#16A765" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#101828' }}>Zero Low-Bandwidth Penalty</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Lock size={18} color="#16A765" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#101828' }}>Biometric Zero-Retention</span>
          </div>
        </div>
      </div>
    </section>
  );
};
