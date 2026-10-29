import React, { useState } from 'react';
import { Activity, Layers, Cpu, Eye, Wifi, Clock, Users, Scale } from 'lucide-react';

export const SignatureFeatures: React.FC = () => {
  const [networkJitter, setNetworkJitter] = useState<number>(34);
  const [activeSignalTab, setActiveSignalTab] = useState<'paste' | 'keystroke' | 'blur' | 'collusion'>('paste');

  return (
    <section
      id="features"
      className="section-white"
      style={{
        padding: '85px 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E4E7EC'
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
              marginBottom: '0.65rem',
              letterSpacing: '-0.03em',
              color: '#101828'
            }}
          >
            Core platform capabilities.
          </h2>
          <p style={{ fontSize: '1rem', color: '#475467', lineHeight: 1.55, margin: 0 }}>
            Five foundational capabilities designed for explainable, evidence-first assessment security.
          </p>
        </div>

        {/* Feature 1: Connectivity-Aware Scoring */}
        <div
          className="card-white"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            boxShadow: '0 4px 16px rgba(16, 24, 40, 0.04)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16A765', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                <Wifi size={16} />
                <span>01. Connectivity-Aware Integrity Scoring</span>
              </div>
              <p style={{ fontSize: '0.9375rem', color: '#475467', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Separates UDP packet loss and cellular handovers from behavioural evidence. Audio is buffered in client RAM
                so network fluctuations never penalize candidates.
              </p>

              {/* Slider */}
              <div style={{ backgroundColor: '#F7F9FC', padding: '1rem', borderRadius: '8px', border: '1px solid #E4E7EC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                  <span style={{ color: '#101828', fontWeight: 600 }}>Simulate Packet Loss:</span>
                  <span style={{ color: '#16A765', fontWeight: 700 }}>{networkJitter}% Loss</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={networkJitter}
                  onChange={(e) => setNetworkJitter(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#16A765', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Comparison Result */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '6px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', marginBottom: '0.2rem' }}>
                  Conventional Proctor:
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#991B1B', margin: 0 }}>
                  {networkJitter > 20
                    ? `Camera drop flagged as cheating. Score penalized to ${50 + Math.round(networkJitter * 0.5)}/100.`
                    : 'Stream normal. Baseline maintained.'}
                </p>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '6px', backgroundColor: '#E8F8EF', border: '1px solid rgba(22, 167, 101, 0.3)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A765', marginBottom: '0.2rem' }}>
                  FairProctor Decoupling:
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#14532D', margin: 0 }}>
                  {networkJitter > 20
                    ? 'Environmental fault isolated. Score protected at 14/100 (Cleared).'
                    : 'Baseline nominal. Score 14/100.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Multi-Signal Behavioural Analysis */}
        <div
          className="card-white"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            boxShadow: '0 4px 16px rgba(16, 24, 40, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16A765', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Activity size={16} />
            <span>02. Multisignal Behavioural Analysis</span>
          </div>
          <p style={{ fontSize: '0.9375rem', color: '#475467', lineHeight: 1.6, marginBottom: '1.25rem', maxWidth: '640px' }}>
            Synthesizes typing bursts, clipboard velocity, and window focus to prevent single-point false alarms.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { id: 'paste', label: 'Clipboard Injection', icon: Activity },
              { id: 'keystroke', label: 'Typing Cadence', icon: Cpu },
              { id: 'blur', label: 'Context Switches', icon: Layers },
              { id: 'collusion', label: 'Cohort Clustering', icon: Eye }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeSignalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSignalTab(tab.id as any)}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: isActive ? '#E8F8EF' : '#F7F9FC',
                    border: `1px solid ${isActive ? '#16A765' : '#E4E7EC'}`,
                    color: isActive ? '#101828' : '#475467',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconComp size={14} color={isActive ? '#16A765' : '#667085'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ backgroundColor: '#F7F9FC', border: '1px solid #E4E7EC', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', color: '#101828', lineHeight: 1.6 }}>
            {activeSignalTab === 'paste' && 'Detects instantaneous 4,000 WPM insertion speed without pre-drafting keystrokes.'}
            {activeSignalTab === 'keystroke' && 'Validates natural typing cadence and backspace edits calibrated to question difficulty.'}
            {activeSignalTab === 'blur' && 'Whitelists sanctioned formula modals and approved PDF references in the DOM.'}
            {activeSignalTab === 'collusion' && 'Flags synchronized identical syntax typos across exam candidates in the same cohort.'}
          </div>
        </div>

        {/* Features 3, 4, 5 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Feature 3: Timestamped, Explainable Evidence */}
          <div className="card-white" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16A765', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <Clock size={16} />
              <span>03. Timestamped Evidence</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
              Every flagged point links to millisecond timestamps, raw metrics, and a plain-English explanation signed with HMAC-SHA256.
            </p>
          </div>

          {/* Feature 4: Reviewer Prioritization */}
          <div className="card-white" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16A765', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <Users size={16} />
              <span>04. Reviewer Prioritization</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
              Auto-clears 85–90% of genuine sessions, surfacing only prioritized multi-signal anomalies for human review.
            </p>
          </div>

          {/* Feature 5: Candidate Appeals */}
          <div className="card-white" style={{ padding: '1.75rem', backgroundColor: '#FFFFFF', border: '1px solid #E4E7EC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#16A765', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <Scale size={16} />
              <span>05. Candidate Appeals</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475467', lineHeight: 1.6, margin: 0 }}>
              Guaranteed 48-hour rebuttal window allowing candidates to inspect questioned events and submit ISP outage logs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
