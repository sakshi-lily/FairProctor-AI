import axios from 'axios';
import {
  CandidateAnswerRequest,
  CandidateEventPayload,
  CandidateEventRecord,
  CandidateStartSessionRequest,
  CandidateSubmitExamRequest,
  CreatePairingResponse,
  PairingStatusResponse,
  MobileEnvironmentCheckSubmitRequest,
  OverviewStats,
  ReviewDecisionType,
  ReviewPriority,
  ReviewerDecisionRecord,
  ReviewerDecisionRequest,
  SessionDetail,
  SessionSummaryItem,
  SystemHealthStatus,
} from '../types/proctoring';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
  isBackendOffline: boolean;
}

export async function checkBackendHealth(): Promise<{ isHealthy: boolean; statusData: SystemHealthStatus | null }> {
  try {
    const res = await apiClient.get<SystemHealthStatus>('/api/v1/health');
    return { isHealthy: res.status === 200, statusData: res.data };
  } catch {
    return { isHealthy: false, statusData: null };
  }
}

export async function fetchOverviewStats(): Promise<ApiResult<OverviewStats>> {
  try {
    const res = await apiClient.get<OverviewStats>('/api/v1/overview');
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch overview metrics',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function fetchSessionList(params?: {
  search?: string;
  priority?: ReviewPriority;
  status?: ReviewDecisionType;
}): Promise<ApiResult<SessionSummaryItem[]>> {
  try {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.priority) queryParams.priority = params.priority;
    if (params?.status) queryParams.status = params.status;

    const res = await apiClient.get<{ total: number; sessions: SessionSummaryItem[] }>('/api/v1/sessions', {
      params: queryParams,
    });
    return { data: res.data.sessions, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Failed to fetch session review queue',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function fetchSessionDetail(sessionId: string): Promise<ApiResult<SessionDetail>> {
  try {
    const res = await apiClient.get<SessionDetail>(`/api/v1/sessions/${encodeURIComponent(sessionId)}`);
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || `Session ${sessionId} could not be retrieved`,
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function submitReviewerDecision(
  sessionId: string,
  decisionReq: ReviewerDecisionRequest
): Promise<ApiResult<ReviewerDecisionRecord>> {
  try {
    const res = await apiClient.post<ReviewerDecisionRecord>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/decisions`,
      decisionReq
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    const detailMsg = err.response?.data?.detail || err.message || 'Failed to record decision';
    return {
      data: null,
      error: detailMsg,
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

// ----------------------------------------------------------------------
// Candidate Portal API Calls
// ----------------------------------------------------------------------

export async function startCandidateSession(
  req: CandidateStartSessionRequest
): Promise<ApiResult<SessionDetail>> {
  try {
    const res = await apiClient.post<SessionDetail>('/api/v1/candidate/sessions/start', req);
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not start examination session',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function getCandidateSession(
  sessionId: string
): Promise<ApiResult<SessionDetail>> {
  try {
    const res = await apiClient.get<SessionDetail>(`/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}`);
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Session not found',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function recordCandidateEvent(
  sessionId: string,
  payload: CandidateEventPayload
): Promise<ApiResult<CandidateEventRecord>> {
  try {
    const res = await apiClient.post<CandidateEventRecord>(
      `/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}/events`,
      payload
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not record event',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function recordCandidateAnswer(
  sessionId: string,
  req: CandidateAnswerRequest
): Promise<ApiResult<CandidateEventRecord>> {
  try {
    const res = await apiClient.post<CandidateEventRecord>(
      `/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}/answers`,
      req
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not record answer',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function submitCandidateExam(
  sessionId: string,
  req: CandidateSubmitExamRequest
): Promise<ApiResult<SessionDetail>> {
  try {
    const res = await apiClient.post<SessionDetail>(
      `/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}/submit`,
      req
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not submit exam',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

// ----------------------------------------------------------------------
// QR-Based Mobile Environment Check API Client
// ----------------------------------------------------------------------

export async function createPairingSession(
  sessionId: string,
  frontendOrigin?: string
): Promise<ApiResult<CreatePairingResponse>> {
  try {
    const res = await apiClient.post<CreatePairingResponse>(
      `/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}/pairing/create`,
      { frontend_origin: frontendOrigin }
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not generate QR pairing token',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function getPairingStatus(
  tokenOrCodeOrSid: string
): Promise<ApiResult<PairingStatusResponse>> {
  try {
    const res = await apiClient.get<PairingStatusResponse>(
      `/api/v1/candidate/pairing/${encodeURIComponent(tokenOrCodeOrSid)}`
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not query pairing status',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function getSessionPairingStatus(
  sessionId: string
): Promise<ApiResult<PairingStatusResponse>> {
  try {
    const res = await apiClient.get<PairingStatusResponse>(
      `/api/v1/candidate/sessions/${encodeURIComponent(sessionId)}/pairing/status`
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not query session pairing status',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function startMobileCheck(
  pairingToken: string
): Promise<ApiResult<PairingStatusResponse>> {
  try {
    const res = await apiClient.post<PairingStatusResponse>(
      `/api/v1/candidate/pairing/${encodeURIComponent(pairingToken)}/start`
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not initiate mobile environment check',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

export async function submitMobileEnvironmentCheck(
  req: MobileEnvironmentCheckSubmitRequest
): Promise<ApiResult<PairingStatusResponse>> {
  try {
    const res = await apiClient.post<PairingStatusResponse>(
      `/api/v1/candidate/pairing/${encodeURIComponent(req.pairing_token)}/submit`,
      req
    );
    return { data: res.data, error: null, status: res.status, isBackendOffline: false };
  } catch (err: any) {
    const isOffline = !err.response;
    return {
      data: null,
      error: err.response?.data?.detail || err.message || 'Could not submit environment check results',
      status: err.response?.status || 0,
      isBackendOffline: isOffline,
    };
  }
}

// ----------------------------------------------------------------------
// Server-Sent Events (SSE) Live Stream Subscription
// ----------------------------------------------------------------------

export function subscribeToEventStream(
  onMessage: (msg: { event: string; data: any }) => void,
  sessionId?: string
): () => void {
  const url = sessionId
    ? `${BASE_URL}/api/v1/sessions/${encodeURIComponent(sessionId)}/stream`
    : `${BASE_URL}/api/v1/events/stream`;

  let eventSource: EventSource | null = null;
  try {
    eventSource = new EventSource(url);

    eventSource.addEventListener('connected', (e: MessageEvent) => {
      try {
        onMessage({ event: 'connected', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'connected', data: e.data });
      }
    });

    eventSource.addEventListener('session_created', (e: MessageEvent) => {
      try {
        onMessage({ event: 'session_created', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'session_created', data: e.data });
      }
    });

    eventSource.addEventListener('event_added', (e: MessageEvent) => {
      try {
        onMessage({ event: 'event_added', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'event_added', data: e.data });
      }
    });

    eventSource.addEventListener('session_completed', (e: MessageEvent) => {
      try {
        onMessage({ event: 'session_completed', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'session_completed', data: e.data });
      }
    });

    eventSource.addEventListener('pairing_created', (e: MessageEvent) => {
      try {
        onMessage({ event: 'pairing_created', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'pairing_created', data: e.data });
      }
    });

    eventSource.addEventListener('pairing_updated', (e: MessageEvent) => {
      try {
        onMessage({ event: 'pairing_updated', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'pairing_updated', data: e.data });
      }
    });

    eventSource.addEventListener('pairing_completed', (e: MessageEvent) => {
      try {
        onMessage({ event: 'pairing_completed', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'pairing_completed', data: e.data });
      }
    });

    eventSource.onmessage = (e: MessageEvent) => {
      try {
        onMessage({ event: 'update', data: JSON.parse(e.data) });
      } catch {
        onMessage({ event: 'update', data: e.data });
      }
    };

    eventSource.onerror = () => {
      // Reconnection handled automatically by browser EventSource
    };
  } catch (err) {
    console.warn('SSE subscription error:', err);
  }

  // Return teardown function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
