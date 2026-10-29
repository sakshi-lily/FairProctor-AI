import React, { useEffect, useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ProctorRoleProvider, useProctorRole } from './context/ProctorRoleContext';
import { Navbar } from './components/Navbar';
import { NavigationTabs, PageId } from './components/NavigationTabs';
import { BackendOfflineAlert } from './components/BackendOfflineAlert';
import { OverviewPage } from './pages/OverviewPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { SessionDetailPage } from './pages/SessionDetailPage';
import { EnvironmentalFairnessPage } from './pages/EnvironmentalFairnessPage';
import { DecisionsPage } from './pages/DecisionsPage';

import {
  checkBackendHealth,
  fetchOverviewStats,
  fetchSessionList,
  fetchSessionDetail,
  submitReviewerDecision,
  subscribeToEventStream,
} from './api/client';
import { CandidatePortal } from './candidate/CandidatePortal';
import { MobileEnvironmentCheckPage } from './candidate/MobileEnvironmentCheckPage';
import {
  OverviewStats,
  ReviewDecisionType,
  SessionDetail,
  SessionSummaryItem,
} from './types/proctoring';
import {
  FALLBACK_OVERVIEW_STATS,
  FALLBACK_SESSIONS,
  toSummaryItems,
} from './data/fallbackSessions';

const DashboardInner: React.FC = () => {
  const { activeRole, reviewerId } = useProctorRole();
  const [appMode, setAppMode] = useState<'reviewer' | 'candidate' | 'mobile_check'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile_check' || params.get('pairing_token') || params.get('token')) {
      return 'mobile_check';
    }
    return 'reviewer';
  });
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [sessions, setSessions] = useState<SessionSummaryItem[]>(toSummaryItems(FALLBACK_SESSIONS));
  const [currentSessionDetail, setCurrentSessionDetail] = useState<SessionDetail | null>(null);

  // Status & loading states
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Health
      const health = await checkBackendHealth();
      setIsBackendHealthy(health.isHealthy);

      if (health.isHealthy) {
        // 2. Overview Stats
        const statsRes = await fetchOverviewStats();
        if (statsRes.data) {
          setStats(statsRes.data);
        }

        // 3. Session List
        const listRes = await fetchSessionList();
        if (listRes.data && listRes.data.length > 0) {
          setSessions(listRes.data);
        }
      } else {
        // Use fallback seeded fixtures
        setStats(FALLBACK_OVERVIEW_STATS);
        setSessions(toSummaryItems(FALLBACK_SESSIONS));
      }
    } catch {
      setIsBackendHealthy(false);
      setStats(FALLBACK_OVERVIEW_STATS);
      setSessions(toSummaryItems(FALLBACK_SESSIONS));
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Background health ping every 20 seconds
    const interval = setInterval(async () => {
      const h = await checkBackendHealth();
      setIsBackendHealthy(h.isHealthy);
    }, 20000);
    return () => clearInterval(interval);
  }, [loadData]);

  // SSE Real-time subscription for live candidate session events
  useEffect(() => {
    if (!isBackendHealthy) return;

    const unsubscribe = subscribeToEventStream((msg) => {
      if (
        msg.event === 'event_added' ||
        msg.event === 'session_created' ||
        msg.event === 'session_completed' ||
        msg.event === 'update'
      ) {
        // Refresh session list quietly
        fetchSessionList().then((res) => {
          if (res.data && res.data.length > 0) {
            setSessions(res.data);
          }
        });
        // Refresh overview stats
        fetchOverviewStats().then((res) => {
          if (res.data) setStats(res.data);
        });
        // If currently viewing details of this session, refresh detail
        const eventSessionId = msg.data?.session_id;
        if (selectedSessionId && (!eventSessionId || eventSessionId === selectedSessionId)) {
          fetchSessionDetail(selectedSessionId).then((res) => {
            if (res.data) setCurrentSessionDetail(res.data);
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isBackendHealthy, selectedSessionId]);

  // Navigate to session details
  const handleSelectSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActivePage('detail');

    if (isBackendHealthy) {
      const res = await fetchSessionDetail(sessionId);
      if (res.data) {
        setCurrentSessionDetail(res.data);
        return;
      }
    }

    // Fallback lookup
    const local = FALLBACK_SESSIONS.find(s => s.session_id === sessionId);
    if (local) {
      setCurrentSessionDetail(local);
    }
  };

  // Human Reviewer Decision Submission
  const handleSubmitDecision = async (
    decision: ReviewDecisionType,
    notes: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentSessionDetail) {
      return { success: false, error: 'No active session selected' };
    }

    setIsSubmittingDecision(true);
    try {
      if (isBackendHealthy) {
        const res = await submitReviewerDecision(currentSessionDetail.session_id, {
          reviewer_id: reviewerId,
          reviewer_role: activeRole,
          decision,
          notes,
        });

        if (res.data) {
          // Update in-memory session detail
          const updatedDetail: SessionDetail = {
            ...currentSessionDetail,
            review_status: decision,
            decision_record: res.data,
          };
          setCurrentSessionDetail(updatedDetail);

          // Update summary items list
          setSessions(prev =>
            prev.map(s =>
              s.session_id === currentSessionDetail.session_id
                ? { ...s, review_status: decision, decision_record: res.data }
                : s
            )
          );

          // Refresh stats
          const statsRes = await fetchOverviewStats();
          if (statsRes.data) setStats(statsRes.data);

          return { success: true };
        } else {
          return { success: false, error: res.error || 'Failed to submit decision' };
        }
      } else {
        // Fallback local update
        const localRecord = {
          session_id: currentSessionDetail.session_id,
          decision,
          reviewer_id: reviewerId,
          reviewer_role: activeRole,
          notes,
          decision_timestamp: new Date().toISOString(),
        };

        setCurrentSessionDetail({
          ...currentSessionDetail,
          review_status: decision,
          decision_record: localRecord,
        });

        setSessions(prev =>
          prev.map(s =>
            s.session_id === currentSessionDetail.session_id
              ? { ...s, review_status: decision, decision_record: localRecord }
              : s
          )
        );

        return {
          success: true,
          error: undefined,
        };
      }
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleRetryConnection = () => {
    setIsRetrying(true);
    loadData();
  };

  const pendingCount = sessions.filter(s => s.review_status === 'PENDING_REVIEW').length;
  const envCount = sessions.reduce((acc, s) => acc + s.environmental_warnings_count, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      
      {/* Mode 0: Mobile Environment Check Page (Dedicated Mobile Route) */}
      {appMode === 'mobile_check' && (
        <MobileEnvironmentCheckPage
          onDone={() => {
            window.history.replaceState({}, '', window.location.pathname);
            setAppMode('reviewer');
          }}
        />
      )}

      {/* Desktop Views (Reviewer Dashboard or Candidate Portal) */}
      {appMode !== 'mobile_check' && (
        <>
          {/* Top Navbar */}
          <Navbar
            isBackendHealthy={isBackendHealthy}
            modelVersion={stats?.model_version || '2.0.0'}
            onRefreshHealth={handleRetryConnection}
            appMode={appMode}
            onToggleAppMode={setAppMode}
          />

          {/* Mode 1: Candidate Examination Portal */}
          {appMode === 'candidate' && (
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <CandidatePortal
                onReturnToReviewer={(sessionId) => {
                  setAppMode('reviewer');
                  if (sessionId) {
                    handleSelectSession(sessionId);
                  } else {
                    setActivePage('queue');
                  }
                  loadData();
                }}
              />
            </main>
          )}

      {/* Mode 2: Reviewer Dashboard */}
      {appMode === 'reviewer' && (
        <>
          {/* Navigation Tabs */}
          <NavigationTabs
            activePage={activePage}
            onSelectPage={setActivePage}
            queueCount={pendingCount}
            environmentalNoticeCount={envCount}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            
            {/* Backend Offline Banner */}
            {!isBackendHealthy && (
              <BackendOfflineAlert
                onRetry={handleRetryConnection}
                isRetrying={isRetrying}
              />
            )}

            {/* Page Routing */}
            {activePage === 'overview' && (
              <OverviewPage
                stats={stats}
                sessions={sessions}
                isBackendHealthy={isBackendHealthy}
                onNavigateToQueue={() => setActivePage('queue')}
                onNavigateToFairness={() => setActivePage('fairness')}
              />
            )}

            {activePage === 'queue' && (
              <ReviewQueuePage
                sessions={sessions}
                isLoading={isLoading}
                onSelectSession={handleSelectSession}
                onRefresh={loadData}
              />
            )}

            {activePage === 'detail' && (
              <SessionDetailPage
                session={currentSessionDetail}
                onBackToQueue={() => setActivePage('queue')}
                onSubmitDecision={handleSubmitDecision}
                isSubmittingDecision={isSubmittingDecision}
              />
            )}

            {activePage === 'fairness' && (
              <EnvironmentalFairnessPage
                sessions={sessions}
                onSelectSession={handleSelectSession}
              />
            )}

            {activePage === 'decisions' && (
              <DecisionsPage
                sessions={sessions}
                onSelectSession={handleSelectSession}
              />
            )}

          </main>
        </>
      )}
      </>
      )}

      {/* Accessible Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FairProctor-AI &middot; Explainable Decision-Support Proctoring &middot; Visual Model v2.0.0</span>
          <span>Policy IM-102: Proctoring That Does Not Punish a Shared Room</span>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ProctorRoleProvider>
        <DashboardInner />
      </ProctorRoleProvider>
    </ThemeProvider>
  );
}

export default App;
