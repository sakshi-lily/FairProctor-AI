import { WifiOff, Users, SunMedium, Lock, Scale, UserCheck } from 'lucide-react';

export const TrustedAssessment: React.FC = () => {
  const frictionPoints = [
    {
      icon: WifiOff,
      title: 'Unstable Connectivity & Cellular Jitter',
      problem:
        'Conventional algorithms flag video stutter and packet drops as "camera disconnection" or "stream tampering", punishing candidates with rural or mobile connections.',
      solution:
        'FairProctor continuously cross-references WebSockets socket latency, round-trip time, and packet loss, permanently classifying network drops as environmental factors.'
    },
    {
      icon: Users,
      title: 'Shared Living Spaces & Background Audio',
      problem:
        'Family members walking past a door, street noise, or pets trigger immediate cheating accusations and automatic assessment termination.',
      solution:
        'Ambient noise floor decibel envelopes distinguish background environmental acoustics from active secondary voice collaboration.'
    },
    {
      icon: SunMedium,
      title: 'Varying Room Lighting & Budget Hardware',
      problem:
        'Natural daylight transitions during a 3-hour exam or budget webcam auto-exposure adjustments cause false "face disappearance" infractions.',
      solution:
        'Adaptive pre-test baseline calibration continuously tracks facial contour landmarks across nominal illumination thresholds.'
    }
  ];

  return (
    <section className="section-light" style={{ padding: '95px 0', borderTop: '1px solid rgba(6, 23, 68, 0.08)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
          <div
            className="badge badge-navy"
            style={{ marginBottom: '1.25rem', backgroundColor: 'rgba(6, 23, 68, 0.08)', color: '#061744' }}
          >
            ENTERPRISE EXAM INTEGRITY
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
            Security should be intelligent.{' '}
            <span style={{ color: '#18B86A' }}>Fairness should be fundamental.</span>
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#344054',
              lineHeight: 1.7
            }}
          >
            Millions of online candidates are assessed in real-world environments—from shared university dorms to rural
            households with fluctuating broadband. FairProctor AI was created to solve the crisis of false-positive
            accusations by separating environmental friction from actual misconduct.
          </p>
        </div>

        {/* 3 Core Comparison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '1.75rem',
            marginBottom: '3.5rem'
          }}
        >
          {frictionPoints.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="card-white"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(6, 23, 68, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <IconComponent size={22} color="#061744" />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#061744', marginBottom: '1rem', fontWeight: 700 }}>
                    {item.title}
                  </h3>

                  <div
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', marginBottom: '0.25rem' }}>
                      THE CONVENTIONAL FLAW:
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0, lineHeight: 1.55 }}>
                      {item.problem}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(24, 184, 106, 0.08)',
                    border: '1px solid rgba(24, 184, 106, 0.25)',
                    borderRadius: '6px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', marginBottom: '0.25rem' }}>
                    THE FAIRPROCTOR SOLUTION:
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#344054', margin: 0, lineHeight: 1.55 }}>
                    {item.solution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Trust Foundation Bar */}
        <div
          style={{
            backgroundColor: '#061744',
            borderRadius: '10px',
            padding: '2rem 2.5rem',
            color: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <UserCheck size={24} color="#18B86A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>
                Human-in-the-Loop Review
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                AI prioritizes anomalies; only certified human educators deliver verdicts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <Scale size={24} color="#18B86A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>
                Equal Bandwidth Equity
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                Zero false-positive divergence between rural cellular and high-speed fiber.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <Lock size={24} color="#18B86A" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>
                Biometric Zero-Retention
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                Transient facial embeddings in RAM are expunged post-exam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
