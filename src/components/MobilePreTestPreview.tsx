import React from 'react';
import { Camera, Sun, Wifi, Smartphone } from 'lucide-react';

interface MobilePreTestPreviewProps {
  onOpenDiagnosticModal: () => void;
}

export const MobilePreTestPreview: React.FC<MobilePreTestPreviewProps> = ({ onOpenDiagnosticModal }) => {
  return (
    <section
      id="pretest"
      style={{
        padding: '85px 0',
        backgroundColor: '#061744',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          {/* Left: Guidance & Instructions */}
          <div>
            <h2
              style={{
                fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
                marginBottom: '0.65rem',
                letterSpacing: '-0.03em',
                color: '#FFFFFF'
              }}
            >
              Pre-test readiness check.
            </h2>
            <p style={{ fontSize: '1rem', color: '#B8C4D9', marginBottom: '1.75rem', lineHeight: 1.55 }}>
              Verify camera framing, room lighting, and connection stability before the exam window begins.
            </p>

            {/* Clear Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#0A1E54', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <Sun size={18} color="#18B86A" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                  <strong>Lighting:</strong> Face your main light source to prevent backlighting silhouettes.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#0A1E54', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <Camera size={18} color="#18B86A" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                  <strong>Camera Framing:</strong> Position webcam at eye level with head and shoulders centered.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#0A1E54', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <Wifi size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#FFFFFF' }}>
                  <strong>Connection:</strong> Adaptive jitter buffer protects candidates on 4G cellular links.
                </span>
              </div>
            </div>

            <button onClick={onOpenDiagnosticModal} className="btn btn-green">
              <Smartphone size={15} />
              <span>Launch Diagnostic</span>
            </button>
          </div>

          {/* Right: Phone Frame Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '300px',
                borderRadius: '28px',
                backgroundColor: '#03102F',
                border: '8px solid #0E2463',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
                overflow: 'hidden'
              }}
            >
              {/* Phone Notch */}
              <div style={{ height: '22px', backgroundColor: '#0E2463', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#03102F' }} />
              </div>

              {/* Phone Body */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18B86A' }}>PRE-TEST READY</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>System Verification</div>
                </div>

                {/* Camera Oval */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    margin: '0 auto 1rem auto',
                    border: '2px dashed #18B86A',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(24, 184, 106, 0.08)'
                  }}
                >
                  <Camera size={26} color="#18B86A" />
                  <span style={{ fontSize: '0.625rem', color: '#18B86A', marginTop: '4px', fontWeight: 600 }}>Face Centered</span>
                </div>

                {/* Status Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#0A1E54', borderRadius: '4px', color: '#EAF1F7' }}>
                    <span>Camera</span>
                    <strong style={{ color: '#18B86A' }}>1080p @ 30fps</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#0A1E54', borderRadius: '4px', color: '#EAF1F7' }}>
                    <span>Lighting</span>
                    <strong style={{ color: '#18B86A' }}>58 Lux (Nominal)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#0A1E54', borderRadius: '4px', color: '#EAF1F7' }}>
                    <span>Connection</span>
                    <strong style={{ color: '#F59E0B' }}>Cellular (Buffered)</strong>
                  </div>
                </div>

                <button
                  onClick={onOpenDiagnosticModal}
                  className="btn btn-green btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem' }}
                >
                  Run Full Diagnostic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
