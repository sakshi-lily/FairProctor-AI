import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Eye,
  CheckCircle2,
  Lock,
  FileText,
  UserCheck,
  Scale,
  Smartphone
} from 'lucide-react';

interface FeaturesProps {
  onOpenPreTest: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onOpenPreTest }) => {
  // Interactive state for Feature A: Network Decoupling Simulation
  const [networkJitter, setNetworkJitter] = useState<number>(38); // % packet loss

  // Interactive state for Feature B: Multi-Signal Weights
  const [activeSignalTab, setActiveSignalTab] = useState<'keystroke' | 'blur' | 'paste' | 'collusion'>('paste');

  // Interactive state for Feature C: Explainable Evidence Tree
  const [selectedTreeNode, setSelectedTreeNode] = useState<string>('node-bayesian');

  // Interactive state for Feature F: Privacy Controls
  const [retentionDays, setRetentionDays] = useState<number>(7);
  const [biometricZeroRetention, setBiometricZeroRetention] = useState<boolean>(true);
  const [lowBandwidthAuditReport, setLowBandwidthAuditReport] = useState<boolean>(true);

  return (
    <div id="features" style={{ position: 'relative' }}>
      {/* ============================================================ */}
      {/* FEATURE A: CONNECTIVITY-AWARE SCORING (Interactive Split) */}
      {/* ============================================================ */}
      <section style={{ padding: '90px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
                FEATURE A · CORE ARCHITECTURE
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                Connectivity-aware scoring.{' '}
                <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
                  Network drops ≠ Academic fraud.
                </span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#94A3B8', marginBottom: '1.75rem', lineHeight: 1.65 }}>
                Legacy proctoring software triggers severe infractions whenever a video stream freezes or an ISP
                re-negotiates cellular towers. FairProctor AI continuously measures WebRTC socket jitter, ISP packet
                drops, and round-trip ping to mathematically decouple network degradation from candidate behaviour.
              </p>

              {/* Interactive Jitter Control Slider */}
              <div
                style={{
                  backgroundColor: '#151C35',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#F8FAFC', fontWeight: 600 }}>Simulate Network Packet Drop:</span>
                  <span style={{ color: '#79F2C0', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {networkJitter}% UDP Loss
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={networkJitter}
                  onChange={(e) => setNetworkJitter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#79F2C0', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem' }}>
                  <span>0% (Fiber Optic)</span>
                  <span>40% (Rural Cellular)</span>
                  <span>80% (Severe Outage)</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#CBD5E1' }}>
                  <CheckCircle2 size={16} color="#79F2C0" />
                  <span>WebSockets Ping/Pong Telemetry</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#CBD5E1' }}>
                  <CheckCircle2 size={16} color="#79F2C0" />
                  <span>Client-Side Cryptographic Buffering</span>
                </div>
              </div>
            </div>

            {/* Visual Interactive Comparison Matrix */}
            <div className="card-indigo" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.04em' }}>
                  REAL-TIME COMPARISON
                </span>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#79F2C0' }}>
                  LOSS RATE: {networkJitter}%
                </span>
              </div>

              {/* Legacy Proctor Row */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FCA5A5' }}>
                    Conventional Proctoring
                  </span>
                  <span className="badge badge-danger" style={{ fontSize: '0.6875rem' }}>
                    {networkJitter > 20 ? 'FALSE INFRACTION' : 'NORMAL'}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>
                  {networkJitter > 20
                    ? `Penalty applied: "Camera disconnected / video stream frozen". Risk Score jumped to ${
                        50 + Math.round(networkJitter * 0.5)
                      }/100.`
                    : 'Stream connected normally. No flag.'}
                </div>
              </div>

              {/* FairProctor Decoupled Row */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(121, 242, 192, 0.08)',
                  border: '1px solid rgba(121, 242, 192, 0.3)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#79F2C0' }}>
                    FairProctor AI Decoupled
                  </span>
                  <span className="badge badge-mint" style={{ fontSize: '0.6875rem' }}>
                    PROTECTED (ENVIRONMENTAL)
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>
                  {networkJitter > 20
                    ? `Network fault isolated. Video buffer cached locally on client with SHA-256 HMAC. Academic Risk Score remains preserved at 14/100.`
                    : 'Stream baseline nominal. Risk Score 14/100.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE B: MULTISIGNAL ANALYSIS (Matrix & Signal Weights) */}
      {/* ============================================================ */}
      <section style={{ padding: '90px 0', backgroundColor: 'rgba(15, 21, 41, 0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
            <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
              FEATURE B · HOLISTIC TELEMETRY
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Multisignal correlation.{' '}
              <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
                Never rely on one fragile flag.
              </span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94A3B8' }}>
              Cheating is never a single momentary anomaly. FairProctor synthesizes typing cadence, DOM focus
              transitions, clipboard injection, and cross-cohort answer patterns into a holistic confidence model.
            </p>
          </div>

          {/* Interactive Multi-Signal Inspector */}
          <div className="card-indigo" style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.75rem'
              }}
            >
              {[
                { id: 'paste', label: 'Clipboard & Paste Rate', icon: Activity },
                { id: 'keystroke', label: 'Answer Timing & Cadence', icon: Cpu },
                { id: 'blur', label: 'Tab & Context Switches', icon: Layers },
                { id: 'collusion', label: 'Cross-Cohort Clustering', icon: Eye }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeSignalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSignalTab(tab.id as any)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#1E294B' : 'rgba(21, 28, 53, 0.5)',
                      border: `1px solid ${isActive ? '#79F2C0' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? '#FFFFFF' : '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <IconComponent size={16} color={isActive ? '#79F2C0' : '#94A3B8'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Signal Deep-Dive Content */}
            <div
              style={{
                backgroundColor: 'rgba(11, 16, 32, 0.7)',
                padding: '1.5rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {activeSignalTab === 'paste' && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#79F2C0', marginBottom: '0.5rem' }}>
                    Instantaneous Insertion & Entropy Analysis
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Differentiates between legitimate internal scratchpad copies and external AI injection. Analyzes
                    character insertion speed (e.g. 500 chars in 80ms) and compares code AST structure against common LLM
                    output tokens.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-mint">Instant Velocity Vector</span>
                    <span className="badge badge-info">Zero Raw Clipboard Exfiltration</span>
                    <span className="badge badge-warning">Contextual DOM Destination Checked</span>
                  </div>
                </div>
              )}

              {activeSignalTab === 'keystroke' && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#79F2C0', marginBottom: '0.5rem' }}>
                    Keystroke Flight Time & Cognitive Drafting Cadence
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Human problem-solving produces natural burst pauses, backspace edits, and cadence variations
                    correlated with question difficulty. Instantaneous bulk completion without pause triggers an
                    auditable inquiry node.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-mint">Flight Time Variance</span>
                    <span className="badge badge-info">Question Difficulty Calibrated</span>
                  </div>
                </div>
              )}

              {activeSignalTab === 'blur' && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#79F2C0', marginBottom: '0.5rem' }}>
                    Document Object Model (DOM) Contextual Blur Audit
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Window blur events are not created equal. Switching to an approved syllabus appendix or formula
                    modal is automatically distinguished from launching unauthorized local software.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-mint">Whitelisted Document Targets</span>
                    <span className="badge badge-warning">Split-Screen Geometry Monitored</span>
                  </div>
                </div>
              )}

              {activeSignalTab === 'collusion' && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#79F2C0', marginBottom: '0.5rem' }}>
                    Cohort-Wide Cross-Candidate Collusion Graph
                  </h3>
                  <p style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Detects identical idiosyncratic errors, identical variable renamings, and synchronized submission
                    timestamps across separate candidates without revealing identity to peers.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-danger">High Confidence Anomaly Pairs</span>
                    <span className="badge badge-mint">Privacy-Preserving Hashing</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE C: EXPLAINABLE EVIDENCE (Decision Graph) */}
      {/* ============================================================ */}
      <section style={{ padding: '90px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
                FEATURE C · TRANSPARENT REASONING
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                Explainable evidence.{' '}
                <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
                  No black-box accusations.
                </span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                Every single risk score point is connected directly to a millisecond-precision timestamp, the raw
                telemetry signal, and a plain-English human explanation. Reviewers, professors, and students can audit
                the exact mathematical weight of every flag.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ marginTop: '3px' }}><CheckCircle2 size={18} color="#79F2C0" /></div>
                  <div>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.9375rem' }}>Timestamped Evidence Anchor:</strong>
                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>Every event is tied to an immutable audit record.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ marginTop: '3px' }}><CheckCircle2 size={18} color="#79F2C0" /></div>
                  <div>
                    <strong style={{ color: '#F8FAFC', fontSize: '0.9375rem' }}>Human-Auditable Rationale:</strong>
                    <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>Explanations written for human comprehension, not raw log dumps.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Decision Node Graph */}
            <div className="card-indigo" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                AUDIT GRAPH TRACE:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  {
                    id: 'node-raw',
                    title: '1. Ingest Telemetry Stream',
                    detail: 'WebRTC jitter 410ms + Window Blur (4.2s)',
                    status: 'verified'
                  },
                  {
                    id: 'node-env',
                    title: '2. Environmental Filter Evaluated',
                    detail: 'RTT spike confirmed cellular handover. Video drop isolated.',
                    status: 'suppressed'
                  },
                  {
                    id: 'node-bayesian',
                    title: '3. Bayesian Behavioural Score Calculation',
                    detail: 'Target window verified as formula sheet modal. Risk delta = 0.',
                    status: 'explained'
                  },
                  {
                    id: 'node-audit',
                    title: '4. Cryptographic Proof Generated',
                    detail: 'HMAC-SHA256 signature appended to student session log.',
                    status: 'signed'
                  }
                ].map((node) => {
                  const isSelected = selectedTreeNode === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedTreeNode(node.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#1E294B' : 'rgba(21, 28, 53, 0.4)',
                        border: `1px solid ${isSelected ? '#79F2C0' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? '#79F2C0' : '#F8FAFC' }}>
                          {node.title}
                        </span>
                        <span className="badge badge-mint" style={{ fontSize: '0.625rem' }}>
                          {node.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>{node.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE D: HUMAN-FIRST REVIEW (Triage Workflow) */}
      {/* ============================================================ */}
      <section style={{ padding: '90px 0', backgroundColor: 'rgba(15, 21, 41, 0.5)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem auto' }}>
            <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
              FEATURE D · DUE PROCESS
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
              Human-first review.{' '}
              <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
                AI prioritizes. Humans decide.
              </span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#94A3B8' }}>
              FairProctor AI does not have the authority to fail, terminate, or penalize any student. The AI acts
              strictly as an explainable triage assistant that filters false alarms and brings high-confidence
              ambiguities to experienced academic arbiters.
            </p>
          </div>

          {/* Reviewer Triage Flow Visualization */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                step: '01',
                title: 'Automated Clearing',
                subtitle: '85-92% of Cohort',
                desc: 'Sessions with zero anomalous multi-signal vectors and isolated network drops are instantly auto-cleared.',
                color: '#79F2C0'
              },
              {
                step: '02',
                title: 'Contextual Triage',
                subtitle: '5-10% of Cohort',
                desc: 'Borderline ambiguities (e.g. formula sheet focus or glare shifts) are grouped with context for quick instructor sign-off.',
                color: '#F59E0B'
              },
              {
                step: '03',
                title: 'Faculty Escalation',
                subtitle: '1-3% of Cohort',
                desc: 'Substantial synchronized paste or cross-cohort answer matching is forwarded to the departmental honor board.',
                color: '#EF4444'
              },
              {
                step: '04',
                title: 'Student Due Process',
                subtitle: '100% Guaranteed',
                desc: 'Candidates receive plain-language audit trails and 48 hours to submit personal statements before any final grade impact.',
                color: '#38BDF8'
              }
            ].map((card) => (
              <div
                key={card.step}
                className="card-indigo"
                style={{ padding: '1.75rem', position: 'relative', overflow: 'hidden' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1.25rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {card.step}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: card.color, marginBottom: '0.35rem' }}>
                  {card.subtitle}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '0.75rem' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE E: MOBILE PRE-TEST CHECK (Interactive Diagnostic) */}
      {/* ============================================================ */}
      <section style={{ padding: '90px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <div className="badge badge-mint" style={{ marginBottom: '1rem' }}>
                FEATURE E · INCLUSIVE ACCESS
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                Mobile pre-test check.{' '}
                <span className="editorial-italic" style={{ color: '#79F2C0', fontWeight: 400 }}>
                  Prevent surprises before exam start.
                </span>
              </h2>
              <p style={{ fontSize: '1.05rem', color: '#94A3B8', marginBottom: '1.75rem', lineHeight: 1.65 }}>
                Anxiety spikes when students encounter technical glitches mid-exam. Our 60-second pre-test diagnostic
                evaluates ambient lighting, face field-of-view, microphone noise floors, and cellular latency jitter
                before the exam window opens.
              </p>

              <button onClick={onOpenPreTest} className="btn btn-primary" style={{ marginBottom: '1.5rem' }}>
                <Smartphone size={16} />
                <span>Launch Interactive Pre-Test Diagnostic</span>
              </button>

              <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                Works on low-end smartphones, Chromebooks, and low-bandwidth connections.
              </div>
            </div>

            {/* Mobile Device Mockup Frame */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: '300px',
                  borderRadius: '32px',
                  backgroundColor: '#070B16',
                  border: '8px solid #1D2647',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Mobile Camera Notch */}
                <div
                  style={{
                    height: '24px',
                    backgroundColor: '#1D2647',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#0B1020' }} />
                </div>

                {/* Mobile Screen Content */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#79F2C0' }}>PRE-TEST READY</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>Candidate Verification</div>
                  </div>

                  {/* Simulated Camera FOV Circle */}
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      margin: '0 auto 1.25rem auto',
                      border: '2px dashed #79F2C0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(121, 242, 192, 0.05)'
                    }}
                  >
                    <Eye size={28} color="#79F2C0" />
                    <span style={{ fontSize: '0.625rem', color: '#79F2C0', marginTop: '4px' }}>Face Centered</span>
                  </div>

                  {/* Pre-Test Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#CBD5E1', padding: '0.4rem', backgroundColor: '#151C35', borderRadius: '4px' }}>
                      <span>Camera FOV</span>
                      <span style={{ color: '#79F2C0', fontWeight: 700 }}>Optimal (98%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#CBD5E1', padding: '0.4rem', backgroundColor: '#151C35', borderRadius: '4px' }}>
                      <span>Lighting Level</span>
                      <span style={{ color: '#79F2C0', fontWeight: 700 }}>58 Lux (Clear)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#CBD5E1', padding: '0.4rem', backgroundColor: '#151C35', borderRadius: '4px' }}>
                      <span>Network Uplink</span>
                      <span style={{ color: '#F59E0B', fontWeight: 700 }}>Cellular (Adaptive)</span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenPreTest}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', fontSize: '0.75rem' }}
                  >
                    Run Full Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURE F: PRIVACY, ETHICS & FAIRNESS (WARM IVORY EDITORIAL) */}
      {/* ============================================================ */}
      <section className="section-ivory" id="fairness" style={{ padding: '100px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '820px', margin: '0 auto 3.5rem auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(11, 16, 32, 0.08)',
                color: '#0B1020',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginBottom: '1.25rem'
              }}
            >
              FEATURE F · HIGH-CONTRAST EDITORIAL MANIFESTO
            </div>
            <h2
              className="serif-display"
              style={{
                fontSize: 'clamp(2.25rem, 4.2vw, 3.5rem)',
                color: '#0B1020',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                letterSpacing: '-0.03em'
              }}
            >
              Privacy, Due Process & Equity Charter.
            </h2>
            <p
              style={{
                fontSize: '1.15rem',
                color: '#525B75',
                lineHeight: 1.7
              }}
            >
              Online proctoring should protect institutional integrity without treating students like suspects or
              harvesting permanent biometric dossiers. FairProctor AI is engineered under four non-negotiable ethical
              tenets.
            </p>
          </div>

          {/* 4 Editorial Ivory Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3.5rem'
            }}
          >
            <div className="ivory-card" style={{ padding: '1.75rem' }}>
              <div style={{ color: '#0B1020', marginBottom: '0.75rem' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0B1020', marginBottom: '0.5rem' }}>
                Biometric Zero-Retention
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#525B75', lineHeight: 1.6 }}>
                Facial landmark vectors are converted to one-way transient embeddings in local RAM. Raw biometric
                features are automatically expunged within 24 hours post-session.
              </p>
            </div>

            <div className="ivory-card" style={{ padding: '1.75rem' }}>
              <div style={{ color: '#0B1020', marginBottom: '0.75rem' }}>
                <Scale size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0B1020', marginBottom: '0.5rem' }}>
                Bandwidth Equity Audit
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#525B75', lineHeight: 1.6 }}>
                Independent false-positive auditing guarantees that rural, low-bandwidth, and mobile candidates
                experience zero statistically significant flag rate divergence compared to high-speed fiber users.
              </p>
            </div>

            <div className="ivory-card" style={{ padding: '1.75rem' }}>
              <div style={{ color: '#0B1020', marginBottom: '0.75rem' }}>
                <UserCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0B1020', marginBottom: '0.5rem' }}>
                Informed Consent & Transparency
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#525B75', lineHeight: 1.6 }}>
                Candidates can inspect the exact telemetry metrics collected at any moment. Zero undisclosed background
                monitoring, keylogger exfiltration, or secondary data sales.
              </p>
            </div>

            <div className="ivory-card" style={{ padding: '1.75rem' }}>
              <div style={{ color: '#0B1020', marginBottom: '0.75rem' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0B1020', marginBottom: '0.5rem' }}>
                Guaranteed 48-Hour Appeal
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#525B75', lineHeight: 1.6 }}>
                No candidate is sanctioned automatically. Every flagged event includes an asynchronous rebuttal window
                where students can upload ISP downtime reports or personal statements.
              </p>
            </div>
          </div>

          {/* Interactive Fairness Policy Controls Preview */}
          <div
            className="ivory-card"
            style={{
              padding: '2rem',
              maxWidth: '820px',
              margin: '0 auto',
              border: '1px solid rgba(11, 16, 32, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.05rem', color: '#0B1020' }}>
                Institutional Privacy & Retention Policy Simulator
              </h4>
              <span className="badge badge-mint" style={{ backgroundColor: '#0B1020', color: '#79F2C0' }}>
                FERPA & GDPR ALIGNED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#525B75', display: 'block', marginBottom: '0.4rem' }}>
                  Telemetry Data Retention Window: {retentionDays} Days
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0B1020', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.6875rem', color: '#525B75' }}>
                  Auto-purges candidate recordings and RAM caches.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0B1020' }}>
                    Zero Biometric Storage
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#525B75' }}>Expunge vectors upon exam submit</div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricZeroRetention}
                  onChange={(e) => setBiometricZeroRetention(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0B1020', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0B1020' }}>
                    Bandwidth Parity Audits
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#525B75' }}>Publish false-positive equity report</div>
                </div>
                <input
                  type="checkbox"
                  checked={lowBandwidthAuditReport}
                  onChange={(e) => setLowBandwidthAuditReport(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0B1020', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(11, 16, 32, 0.04)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8125rem', color: '#525B75' }}>
              <strong>Fairness Guarantee:</strong> In the IM-102 benchmark simulation, implementing connectivity-aware
              decoupling reduced false-positive academic integrity investigations for rural and cellular candidates by{' '}
              <strong style={{ color: '#0B1020' }}>94.2%</strong>.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
