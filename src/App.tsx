import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedAssessment } from './components/TrustedAssessment';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { Workflow } from './components/Workflow';
import { SignatureFeatures } from './components/SignatureFeatures';
import { MobilePreTestPreview } from './components/MobilePreTestPreview';
import { PrivacyFairness } from './components/PrivacyFairness';
import { Footer } from './components/Footer';
import { PreTestModal } from './components/PreTestModal';
import { AppealModal } from './components/AppealModal';
import type { CandidateSession } from './types';

export function App() {
  const [isPreTestOpen, setIsPreTestOpen] = useState<boolean>(false);
  const [appealSession, setAppealSession] = useState<CandidateSession | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Slim Professional Navigation Bar */}
      <Navbar onOpenPreTest={() => setIsPreTestOpen(true)} />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        {/* Hero Section (Spacious Corporate Navy Hero) */}
        <Hero
          onExploreDemo={() => scrollToSection('interactive-demo')}
          onSeeHowItWorks={() => scrollToSection('workflow')}
          onOpenPreTest={() => setIsPreTestOpen(true)}
        />

        {/* Section A — Trusted Assessment Experience (Light Blue-Grey Section) */}
        <TrustedAssessment />

        {/* Section B — Interactive Product Preview (Reviewer Triage Dashboard) */}
        <InteractiveDashboard onOpenAppealModal={(session) => setAppealSession(session)} />

        {/* Section C — How It Works (Visual Connected Workflow) */}
        <Workflow />

        {/* Section D — Signature Features (5 Core Capabilities) */}
        <SignatureFeatures />

        {/* Section E — Mobile Pre-Test Check (Mobile Phone Preview & Troubleshooting) */}
        <MobilePreTestPreview onOpenDiagnosticModal={() => setIsPreTestOpen(true)} />

        {/* Section F — Privacy and Fairness (Contrasting Light Section & Due Process) */}
        <PrivacyFairness />
      </main>

      {/* Section G — Closing CTA Banner & Corporate Footer */}
      <Footer
        onExploreDemo={() => scrollToSection('interactive-demo')}
        onOpenPreTest={() => setIsPreTestOpen(true)}
      />

      {/* Interactive Diagnostics & Rebuttal Modals */}
      <PreTestModal isOpen={isPreTestOpen} onClose={() => setIsPreTestOpen(false)} />

      <AppealModal
        isOpen={!!appealSession}
        session={appealSession}
        onClose={() => setAppealSession(null)}
      />
    </div>
  );
}

export default App;
