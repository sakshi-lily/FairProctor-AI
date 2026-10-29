import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Eye
} from 'lucide-react';

export const SignatureFeatures: React.FC = () => {
  // State for Feature 1: Connectivity-Aware Scoring Simulation
  const [networkJitter, setNetworkJitter] = useState<number>(34);

  // State for Feature 2: Multi-Signal Selector
  const [activeSignalTab, setActiveSignalTab] = useState<'paste' | 'keystroke' | 'blur' | 'collusion'>('paste');

  return (
    <section
      id="features"
      style={{
        padding: '100px 0',
        backgroundColor: '#03102F',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3.5rem auto' }}>
          <div className="badge badge-green" style={{ marginBottom: '1rem' }}>
            SECTION D · SIGNATURE CAPABILITIES
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.1rem, 3.8vw, 3.25rem)',
              marginBottom: '1rem',
              letterSpacing: '-0.03em',
              color: '#FFFFFF'
            }}
          >
            Five pillars of explainable exam integrity.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#B8C4D9', lineHeight: 1.65 }}>
            Purpose-built assessment intelligence designed to protect institutional standards while eliminating punitive
            false positives for real-world test takers.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* Capability 1: Connectivity-Aware Integrity Scoring */}
        {/* ========================================================================= */}
        <div
          className="card-navy"
          style={{
            padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            marginBottom: '2.5rem',
            border: '1px solid rgba(24, 184, 106, 0.3)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                <span className="font-mono">01</span> / FIVE CORE CAPABILITIES
              </div>
              <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', color: '#FFFFFF', marginBottom: '1rem', fontWeight: 700 }}>
                Connectivity-Aware Integrity Scoring
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#B8C4D9', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Distinguishes missing video frames, cellular handovers, and UDP socket drops from intentional stream
                tampering. When connectivity degrades, video stutters are permanently tagged as environmental anomalies.
              </p>

              {/* Interactive Packet Loss Slider */}
              <div
                style={{
                  backgroundColor: '#061744',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Simulate Cellular / Wi-Fi Drop:</span>
                  <span style={{ color: '#18B86A', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {networkJitter}% Packet Loss
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={networkJitter}
                  onChange={(e) => setNetworkJitter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#18B86A', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#8696B2', marginTop: '0.25rem' }}>
                  <span>0% (Fiber Optic)</span>
                  <span>40% (Cellular Jitter)</span>
                  <span>80% (Severe Network Drop)</span>
                </div>
              </div>
            </div>

            {/* Real-Time Outcome Comparison */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1.15rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#FCA5A5' }}>
                    Conventional Proctoring
                  </span>
                  <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>
                    {networkJitter > 20 ? 'FALSE POSITIVE ACCUSATION' : 'BASELINE'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#EAF1F7', margin: 0, lineHeight: 1.5 }}>
                  {networkJitter > 20
                    ? `Penalty applied: "Camera feed offline / student absent". Risk score forced up to ${50 + Math.round(networkJitter * 0.5)}/100.`
                    : 'Feed online. No immediate penalty.'}
                </p>
              </div>

              <div
                style={{
                  padding: '1.15rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(24, 184, 106, 0.08)',
                  border: '1px solid rgba(24, 184, 106, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#18B86A' }}>
                    FairProctor AI Decoupled
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    ENVIRONMENTAL SUPPRESSION
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#FFFFFF', margin: 0, lineHeight: 1.5 }}>
                  {networkJitter > 20
                    ? 'Video stutter isolated as socket-level ISP jitter. Client audio buffer cached locally with SHA-256 HMAC. True candidate academic score preserved at 14/100.'
                    : 'Connection baseline nominal. Academic risk score 14/100.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Capability 2: Multisignal Behavioural Analysis */}
        {/* ========================================================================= */}
        <div
          className="card-navy"
          style={{
            padding: 'clamp(1.5rem, 3.5vw, 2.5rem)',
            marginBottom: '2.5rem',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
            <span className="font-mono">02</span> / FIVE CORE CAPABILITIES
          </div>
          <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', color: '#FFFFFF', marginBottom: '1rem', fontWeight: 700 }}>
            Multisignal Behavioural Analysis
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#B8C4D9', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '750px' }}>
            Integrity cannot be judged by a single sensor. FairProctor correlates typing cadence, clipboard injection,
            browser blur targets, and cross-candidate cluster patterns into a single weighted confidence distribution.
          </p>

          {/* Interactive Multi-Signal Selector Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}
          >
            {[
              { id: 'paste', label: 'Clipboard & Paste Rate', icon: Activity },
              { id: 'keystroke', label: 'Answer Timing Cadence', icon: Cpu },
              { id: 'blur', label: 'Tab Focus & Context Switches', icon: Layers },
              { id: 'collusion', label: 'Cross-Cohort Clustering', icon: Eye }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeSignalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSignalTab(tab.id as any)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: isActive ? '#0E2463' : '#061744',
                    border: `1px solid ${isActive ? '#18B86A' : 'rgba(255,255,255,0.1)'}`,
                    color: isActive ? '#FFFFFF' : '#B8C4D9',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={16} color={isActive ? '#18B86A' : '#8696B2'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              backgroundColor: '#061744',
              padding: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {activeSignalTab === 'paste' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#18B86A', marginBottom: '0.5rem' }}>
                  Instantaneous Insertion Velocity & Token Entropy
                </h4>
                <p style={{ color: '#EAF1F7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  Analyzes character injection speed (e.g. 480 characters in 120ms) without pre-drafting keystrokes.
                  Distinguishes sanctioned scratchpad reuse from external LLM injection.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green">4,000 WPM Insertion Threshold</span>
                  <span className="badge badge-info">Zero Raw Clipboard Storage</span>
                </div>
              </div>
            )}
            {activeSignalTab === 'keystroke' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#18B86A', marginBottom: '0.5rem' }}>
                  Keystroke Flight Time & Cognitive Drafting Bursts
                </h4>
                <p style={{ color: '#EAF1F7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  Natural problem solving involves reflective pauses, backspaces, and burst typing aligned with
                  question difficulty. Uniform instant code submission flags an auditable inquiry note.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green">Calibrated to Question Difficulty</span>
                </div>
              </div>
            )}
            {activeSignalTab === 'blur' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#18B86A', marginBottom: '0.5rem' }}>
                  Contextual Document Object Model (DOM) Blur Evaluation
                </h4>
                <p style={{ color: '#EAF1F7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  Focus shifts to an authorized formula appendix or exam reference tab are automatically cleared;
                  unauthorized external window shifts are flagged for contextual instructor triage.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-green">Whitelisted DOM Targets</span>
                </div>
              </div>
            )}
            {activeSignalTab === 'collusion' && (
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#18B86A', marginBottom: '0.5rem' }}>
                  Cohort-Wide Cross-Candidate Collusion Graph
                </h4>
                <p style={{ color: '#EAF1F7', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.85rem' }}>
                  Identifies shared syntax AST patterns, synchronized submit timestamps, and identical unusual mistakes
                  across candidates in the same examination window.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-danger">High-Confidence Pair Matching</span>
                  <span className="badge badge-green">Privacy-Preserving Hashes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Capabilities 3, 4, 5 Grid */}
        {/* ========================================================================= */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Capability 3: Timestamped, Explainable Evidence */}
          <div
            className="card-navy"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                <span className="font-mono">03</span> / FIVE CORE CAPABILITIES
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.75rem', fontWeight: 700 }}>
                Timestamped, Explainable Evidence
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#B8C4D9', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                No mysterious "AI Black Boxes". Every flagged score point is anchored to a millisecond timestamp, raw
                sensor metrics, and a plain-English explanation written for human comprehension.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#061744',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18B86A', marginBottom: '0.35rem' }}>
                AUDIT TRAIL CHAIN:
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#EAF1F7', lineHeight: 1.5 }}>
                Timestamp 14:22:08 UTC → 41% UDP drop confirmed → Socket delay 980ms → Penalty suppressed → Signed HMAC.
              </div>
            </div>
          </div>

          {/* Capability 4: Reviewer Prioritization */}
          <div
            className="card-navy"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                <span className="font-mono">04</span> / FIVE CORE CAPABILITIES
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.75rem', fontWeight: 700 }}>
                Reviewer Prioritization Queue
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#B8C4D9', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Educators shouldn't have to watch 3,000 hours of webcam footage. FairProctor auto-clears 85-90% of
                unequivocally honest sessions, surfacing only genuine multi-signal anomalies for review.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#061744',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18B86A', marginBottom: '0.35rem' }}>
                TRIAGE EFFICIENCY:
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#EAF1F7', lineHeight: 1.5 }}>
                Faculty review time reduced by 91% while maintaining zero tolerance for multi-candidate collusion.
              </div>
            </div>
          </div>

          {/* Capability 5: Candidate Appeals & Fairness Analytics */}
          <div
            className="card-navy"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#18B86A', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.06em' }}>
                <span className="font-mono">05</span> / FIVE CORE CAPABILITIES
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', marginBottom: '0.75rem', fontWeight: 700 }}>
                Candidate Appeals & Fairness Analytics
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#B8C4D9', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Guaranteed student due process. Every candidate receives a clear breakdown of flagged timestamps with an
                asynchronous 48-hour rebuttal window to submit personal statements and ISP logs.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#061744',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#18B86A', marginBottom: '0.35rem' }}>
                EQUITY SAFEGUARD:
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#EAF1F7', lineHeight: 1.5 }}>
                Institutions receive continuous parity audit reports verifying zero demographic or bandwidth bias.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
