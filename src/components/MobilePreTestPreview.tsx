import React from 'react';
import { Camera, Sun, Wifi, Smartphone } from 'lucide-react';

interface MobilePreTestPreviewProps {
  onOpenDiagnosticModal: () => void;
}

export const MobilePreTestPreview: React.FC<MobilePreTestPreviewProps> = ({ onOpenDiagnosticModal }) => {
  return (
    <section
      id="pretest"
      className="section-alt"
      style={{
        padding: '85px 0',
        backgroundColor: '#F7F9FC',
        borderTop: '1px solid #E4E7EC'
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
                color: '#101828'
              }}
            >
              Pre-test readiness check.
            </h2>
            <p style={{ fontSize: '1rem', color: '#475467', marginBottom: '1.75rem', lineHeight: 1.55 }}>
              Verify camera framing, room lighting, and connection stability before the exam window begins.
            </p>

            {/* Clear Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC', padding: '0.85rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
                <Sun size={18} color="#16A765" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#475467' }}>
                  <strong style={{ color: '#101828' }}>Lighting:</strong> Face your main light source to prevent backlighting silhouettes.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC', padding: '0.85rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
                <Camera size={18} color="#16A765" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#475467' }}>
                  <strong style={{ color: '#101828' }}>Camera Framing:</strong> Position webcam at eye level with head and shoulders centered.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC', padding: '0.85rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)' }}>
                <Wifi size={18} color="#F59E0B" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.875rem', color: '#475467' }}>
                  <strong style={{ color: '#101828' }}>Connection:</strong> Adaptive jitter buffer protects candidates on 4G cellular links.
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
                backgroundColor: '#FFFFFF',
                border: '8px solid #E4E7EC',
                boxShadow: '0 20px 40px rgba(16, 24, 40, 0.08)',
                overflow: 'hidden'
              }}
            >
              {/* Phone Notch */}
              <div style={{ height: '22px', backgroundColor: '#F7F9FC', borderBottom: '1px solid #E4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#D0D5DD' }} />
              </div>

              {/* Phone Body */}
              <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A765' }}>PRE-TEST READY</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828' }}>System Verification</div>
                </div>

                {/* Camera Oval */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    margin: '0 auto 1rem auto',
                    border: '2px dashed #16A765',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#E8F8EF'
                  }}
                >
                  <Camera size={26} color="#16A765" />
                  <span style={{ fontSize: '0.625rem', color: '#16A765', marginTop: '4px', fontWeight: 600 }}>Face Centered</span>
                </div>

                {/* Status Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#F7F9FC', border: '1px solid #E4E7EC', borderRadius: '6px', color: '#475467' }}>
                    <span>Camera</span>
                    <strong style={{ color: '#16A765' }}>1080p @ 30fps</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#F7F9FC', border: '1px solid #E4E7EC', borderRadius: '6px', color: '#475467' }}>
                    <span>Lighting</span>
                    <strong style={{ color: '#16A765' }}>58 Lux (Nominal)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.45rem 0.65rem', backgroundColor: '#F7F9FC', border: '1px solid #E4E7EC', borderRadius: '6px', color: '#475467' }}>
                    <span>Connection</span>
                    <strong style={{ color: '#D97706' }}>Cellular (Buffered)</strong>
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
