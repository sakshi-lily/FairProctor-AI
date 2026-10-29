import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Wifi,
  Video,
  Mic,
  Monitor,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

interface CandidatePortalProps {
  onOpenPreTest: () => void;
  onOpenAppeal: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({ onOpenPreTest, onOpenAppeal }) => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', backgroundColor: '#F7F9FC', padding: '2.5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#E8F8EF',
                border: '2px solid rgba(22, 167, 101, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#16A765',
              }}
            >
              {user?.name ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') : 'C'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#101828' }}>
                  Welcome back, {user?.name || 'Candidate'}
                </h1>
                <span className="badge badge-green">Candidate Portal</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.2rem' }}>
                Verified institutional ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{user?.id.slice(-8) || 'CAND-884A'}</span> &middot; {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onOpenPreTest}
              className="btn btn-green btn-sm"
              style={{ padding: '0.65rem 1.15rem' }}
            >
              <Video size={16} />
              <span>Launch Hardware Check</span>
            </button>
            <button
              type="button"
              onClick={onOpenAppeal}
              className="btn btn-outline-navy btn-sm"
              style={{ padding: '0.65rem 1.15rem' }}
            >
              <FileText size={16} />
              <span>Submit Due Process Statement</span>
            </button>
          </div>
        </motion.div>

        {/* Connectivity Equity Guarantee Banner */}
        <div
          style={{
            backgroundColor: '#E8F8EF',
            border: '1px solid rgba(22, 167, 101, 0.3)',
            borderRadius: '10px',
            padding: '1.15rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wifi size={20} color="#16A765" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#05603A', margin: 0 }}>
              Connectivity-Aware Proctoring Buffer Active
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#067647', margin: 0, marginTop: '0.2rem' }}>
              Your session is safeguarded by FairProctor AI decoupled telemetry. Video freezes, cell handovers, and bandwidth drops are isolated from academic evaluation.
            </p>
          </div>
        </div>

        {/* Two Column Layout: Active Exam & Diagnostic Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Active Examination Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span
                  style={{
                    backgroundColor: '#EFF8FF',
                    color: '#175CD3',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #B2DDFF',
                  }}
                >
                  UPCOMING PROCTORED EXAM
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#101828', marginTop: '0.5rem' }}>
                  CS-401: Advanced Distributed Systems
                </h3>
              </div>
              <span className="badge badge-green">Ready</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#475467' }}>
                <Clock size={16} color="#667085" />
                <span>Scheduled: <strong>Today &middot; 2 Hours Allocated</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#475467' }}>
                <ShieldCheck size={16} color="#16A765" />
                <span>Format: <strong>Single-Display Sandbox & WebRTC Telemetry</strong></span>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #E4E7EC',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#667085', display: 'block' }}>Pre-Test Verification:</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16A765' }}>Passed (100% Ready)</span>
              </div>
              <button
                type="button"
                onClick={onOpenPreTest}
                className="btn btn-green btn-sm"
              >
                <span>Enter Examination</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Environmental Readiness Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#101828', marginBottom: '1rem' }}>
              System & Environmental Diagnostic Telemetry
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#F8F9FC',
                  borderRadius: '8px',
                  border: '1px solid #E4E7EC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Video size={18} color="#16A765" />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      Webcam FOV & Head Pose Alignment
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>Centered, single face detected (30 FPS)</span>
                  </div>
                </div>
                <CheckCircle2 size={18} color="#16A765" />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#F8F9FC',
                  borderRadius: '8px',
                  border: '1px solid #E4E7EC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Mic size={18} color="#16A765" />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      Ambient Audio & Lux Lighting
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>38 dB ambient level, 340 Lux calibrated</span>
                  </div>
                </div>
                <CheckCircle2 size={18} color="#16A765" />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: '#F8F9FC',
                  borderRadius: '8px',
                  border: '1px solid #E4E7EC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Monitor size={18} color="#16A765" />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#101828', display: 'block' }}>
                      Display Sandbox & Focus Lock
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#667085' }}>Single display sandbox, DOM focus monitor active</span>
                  </div>
                </div>
                <CheckCircle2 size={18} color="#16A765" />
              </div>
            </div>
          </div>
        </div>

        {/* Due Process & Biometric Privacy Charter Banner */}
        <div
          style={{
            marginTop: '2rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Sparkles size={18} color="#16A765" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#101828', margin: 0 }}>
              Guaranteed Candidate Due Process & Privacy Rights
            </h4>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
            Under institutional policy, model predictions are strictly advisory. No candidate can be penalized by automated algorithms. In any ambiguous event, you are guaranteed a 48-hour rebuttal window to inspect the cryptographic evidence timeline and submit explanatory statements. All facial vectors are expunged in RAM immediately post-exam.
          </p>
        </div>
      </div>
    </div>
  );
};
