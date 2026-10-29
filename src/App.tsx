import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { Features } from './components/Features';
import { Workflow } from './components/Workflow';
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
    <div className="bg-grid-subtle" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <Navbar onOpenPreTest={() => setIsPreTestOpen(true)} />

      {/* Main Content Sections */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <Hero
          onExploreDemo={() => scrollToSection('interactive-demo')}
          onSeeHowItWorks={() => scrollToSection('workflow')}
          onOpenPreTest={() => setIsPreTestOpen(true)}
        />

        {/* Product Preview: Interactive Reviewer Dashboard */}
        <InteractiveDashboard onOpenAppealModal={(session) => setAppealSession(session)} />

        {/* 6 Visually Distinct Feature Sections (A to F) */}
        <Features onOpenPreTest={() => setIsPreTestOpen(true)} />

        {/* End-to-End Workflow Section (01 to 05) */}
        <Workflow />
      </main>

      {/* Closing Section & Footer */}
      <Footer
        onExploreDemo={() => scrollToSection('interactive-demo')}
        onOpenPreTest={() => setIsPreTestOpen(true)}
      />

      {/* Interactive Modals */}
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
