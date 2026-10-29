import { Camera, Sun, Wifi, Smartphone } from 'lucide-react';

interface MobilePreTestPreviewProps {
  onOpenDiagnosticModal: () => void;
}

export const MobilePreTestPreview: React.FC<MobilePreTestPreviewProps> = ({ onOpenDiagnosticModal }) => {
  return (
    <section
      id="pretest"
      style={{
        padding: '95px 0',
        backgroundColor: '#061744',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          {/* Left Column: Guidance & Troubleshooting Instructions */}
          <div>
            <div className="badge badge-green" style={{ marginBottom: '1rem' }}>
              SECTION E · CANDIDATE READINESS
            </div>
            <h2
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.85rem)',
                marginBottom: '1.25rem',
                letterSpacing: '-0.03em',
                color: '#FFFFFF'
              }}
            >
              Mobile & desktop pre-test check.
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#B8C4D9', marginBottom: '2rem', lineHeight: 1.65 }}>
              Assessment anxiety drops when candidates know their system is verified in advance. Our 60-second
              pre-flight check verifies camera framing, ambient lighting, and cellular latency before the exam begins.
            </p>

            {/* Clear Instructions to Fix Technical Problems */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  backgroundColor: '#0A1E54',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <Sun size={20} color="#18B86A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#FFFFFF', display: 'block', marginBottom: '0.2rem' }}>
                    Lighting & Glare Calibration
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                    Ensure your primary light source is in front of you. Avoid sitting with bright windows directly behind
                    your back to prevent harsh backlighting silhouette.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  backgroundColor: '#0A1E54',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <Wifi size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#FFFFFF', display: 'block', marginBottom: '0.2rem' }}>
                    Adaptive Bandwidth Baseline
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                    If you are testing over a 4G hotspot or shared home connection, FairProctor automatically buffers audio
                    in local client RAM. Unstable ping will never disqualify your submission.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  backgroundColor: '#0A1E54',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <Camera size={20} color="#18B86A" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: '#FFFFFF', display: 'block', marginBottom: '0.2rem' }}>
                    Camera Field-of-View
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: '#B8C4D9', margin: 0, lineHeight: 1.5 }}>
                    Position your phone or webcam at eye level so your head and shoulders remain within the natural center
                    boundary.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={onOpenDiagnosticModal} className="btn btn-green">
              <Smartphone size={16} />
              <span>Launch Live Pre-Test Diagnostic</span>
            </button>
          </div>

          {/* Right Column: Realistic Mobile Phone Mockup Frame */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '320px',
                borderRadius: '34px',
                backgroundColor: '#03102F',
                border: '9px solid #0E2463',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Camera Notch */}
              <div
                style={{
                  height: '26px',
                  backgroundColor: '#0E2463',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '45px', height: '4px', borderRadius: '2px', backgroundColor: '#03102F' }} />
              </div>

              {/* Mobile Screen Body */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18B86A', letterSpacing: '0.04em' }}>
                    FAIRPROCTOR CANDIDATE
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                    Environmental Verification
                  </div>
                </div>

                {/* Simulated Camera Feed Oval */}
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    margin: '0 auto 1.25rem auto',
                    border: '2px dashed #18B86A',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(24, 184, 106, 0.08)'
                  }}
                >
                  <Camera size={30} color="#18B86A" />
                  <span style={{ fontSize: '0.65rem', color: '#18B86A', marginTop: '6px', fontWeight: 600 }}>
                    Face Centered (98%)
                  </span>
                </div>

                {/* Status Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#0A1E54',
                      borderRadius: '5px',
                      color: '#EAF1F7'
                    }}
                  >
                    <span>Camera Stream</span>
                    <span style={{ color: '#18B86A', fontWeight: 700 }}>1080p @ 30fps</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#0A1E54',
                      borderRadius: '5px',
                      color: '#EAF1F7'
                    }}
                  >
                    <span>Ambient Lux</span>
                    <span style={{ color: '#18B86A', fontWeight: 700 }}>58 Lux (Nominal)</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#0A1E54',
                      borderRadius: '5px',
                      color: '#EAF1F7'
                    }}
                  >
                    <span>Uplink Jitter</span>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>Adaptive Profile</span>
                  </div>
                </div>

                {/* Troubleshoot Hint Callout */}
                <div
                  style={{
                    backgroundColor: 'rgba(24, 184, 106, 0.1)',
                    border: '1px solid rgba(24, 184, 106, 0.25)',
                    borderRadius: '6px',
                    padding: '0.65rem',
                    fontSize: '0.6875rem',
                    color: '#EAF1F7',
                    marginBottom: '1rem',
                    lineHeight: 1.4
                  }}
                >
                  ✓ All hardware checks verified. No punitive flags will be applied for connection stutter.
                </div>

                <button
                  onClick={onOpenDiagnosticModal}
                  className="btn btn-green btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  Run Full Pre-Test Check
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
