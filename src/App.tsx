import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustedAssessment } from './components/TrustedAssessment';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { Workflow } from './components/Workflow';
import { MobilePreTestPreview } from './components/MobilePreTestPreview';
import { PrivacyFairness } from './components/PrivacyFairness';
import { Footer } from './components/Footer';
import { PreTestModal } from './components/PreTestModal';
import { AppealModal } from './components/AppealModal';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { CandidatePortal } from './components/portals/CandidatePortal';
import { ReviewerPortal } from './components/portals/ReviewerPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { UnauthorizedPage } from './components/portals/UnauthorizedPage';
import { MOCK_SESSIONS } from './data/mockData';
import type { CandidateSession } from './types';

function AppContent() {
  const { activeView, loading } = useAuth();
  const [isPreTestOpen, setIsPreTestOpen] = useState<boolean>(false);
  const [appealSession, setAppealSession] = useState<CandidateSession | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F7F9FC',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E4E7EC',
            borderTopColor: '#16A765',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <p style={{ fontSize: '0.875rem', color: '#475467', fontWeight: 600 }}>
          Authenticating FairProctor AI Session...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Slim Professional Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingTop: '68px' }}>
        {activeView === 'login' && <LoginPage />}
        {activeView === 'register' && <RegisterPage />}
        {activeView === 'forgot-password' && <ForgotPasswordPage />}
        {activeView === 'reset-password' && <ResetPasswordPage />}
        {activeView === 'unauthorized' && <UnauthorizedPage />}

        {activeView === 'candidate-portal' && (
          <CandidatePortal
            onOpenPreTest={() => setIsPreTestOpen(true)}
            onOpenAppeal={() => setAppealSession(MOCK_SESSIONS[0])}
          />
        )}

        {activeView === 'reviewer-portal' && <ReviewerPortal />}

        {activeView === 'admin-portal' && <AdminPortal />}

        {activeView === 'landing' && (
          <>
            {/* Hero Section */}
            <Hero
              onExploreDemo={() => scrollToSection('interactive-demo')}
              onSeeHowItWorks={() => scrollToSection('workflow')}
            />

            {/* Section A — Trusted Assessment Experience */}
            <TrustedAssessment />

            {/* Section B — Interactive Product Preview */}
            <InteractiveDashboard onOpenAppealModal={(session) => setAppealSession(session)} />

            {/* Section C — How It Works */}
            <Workflow />

            {/* Section D — Mobile Pre-Test Check */}
            <MobilePreTestPreview onOpenDiagnosticModal={() => setIsPreTestOpen(true)} />

            {/* Section F — Privacy and Fairness */}
            <PrivacyFairness />

            {/* Section G — Closing CTA Banner & Footer */}
            <Footer onExploreDemo={() => scrollToSection('interactive-demo')} />
          </>
        )}
      </main>

      {/* Global Interactive Diagnostics & Rebuttal Modals */}
      <PreTestModal isOpen={isPreTestOpen} onClose={() => setIsPreTestOpen(false)} />

      <AppealModal
        isOpen={!!appealSession}
        session={appealSession}
        onClose={() => setAppealSession(null)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
