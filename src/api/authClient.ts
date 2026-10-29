import type { User, AuthResponse } from '../types/auth';

class AuthApiClient {
  private token: string | null = null;
  private csrfToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('fp_access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('fp_access_token', token);
    } else {
      localStorage.removeItem('fp_access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async fetchCsrf(): Promise<string | null> {
    try {
      const res = await fetch('/api/auth/csrf', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        this.csrfToken = data.csrfToken;
        return data.csrfToken;
      }
    } catch {
      // Ignore CSRF fetch failure
    }
    return null;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Include HttpOnly cookies
    };

    let response = await fetch(endpoint, config);

    // If access token expired, try to refresh once
    if (response.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/refresh') {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.token}`;
        response = await fetch(endpoint, { ...config, headers });
      }
    }

    const data = await response.json().catch(() => ({
      success: false,
      message: `HTTP Error: ${response.status} ${response.statusText}`,
    }));

    if (!response.ok) {
      const error: any = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          this.setToken(data.token);
          return true;
        }
      }
    } catch {
      // Refresh failed
    }
    this.setToken(null);
    return false;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const data = await this.request<{ success: boolean; user: User }>('/api/auth/me');
      return data.user;
    } catch {
      return null;
    }
  }

  async login(payload: { email: string; password: string; rememberMe?: boolean }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Candidate API
  async getCandidateOverview() {
    return this.request('/api/candidate/overview');
  }

  async submitCandidatePretest(payload: { metrics: any[]; browserInfo: any }) {
    return this.request('/api/candidate/pretest-submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitCandidateAppeal(payload: { sessionId: string; explanation: string; attachTelemetry?: boolean }) {
    return this.request('/api/candidate/appeal-submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Reviewer API
  async getReviewerSessions() {
    return this.request('/api/reviewer/sessions');
  }

  async submitReviewerVerdict(payload: { sessionId: string; decision: string; justificationNotes?: string }) {
    return this.request('/api/reviewer/verdict', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin API
  async getAdminUsers() {
    return this.request('/api/admin/users');
  }

  async updateAdminUserRole(userId: string, role: string) {
    return this.request(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateAdminUserStatus(userId: string, status: string) {
    return this.request(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminAuditLogs(limit: number = 50) {
    return this.request(`/api/admin/audit-logs?limit=${limit}`);
  }

  async getAdminSystemStatus() {
    return this.request('/api/admin/system-status');
  }
}

export const authClient = new AuthApiClient();
