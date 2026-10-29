import React, { useState, useEffect, useCallback } from 'react';
import type { User, ViewType } from '../types/auth';
import { authClient } from '../api/authClient';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveViewInternal] = useState<ViewType>('landing');
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Sync activeView with window hash/query parameters
  const parseUrlLocation = useCallback((): { view: ViewType; token: string | null } => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryToken = searchParams.get('token');
    const hash = window.location.hash.replace('#', '').toLowerCase();

    if (queryToken || hash.startsWith('reset-password')) {
      return { view: 'reset-password', token: queryToken };
    }
    if (hash === 'login') return { view: 'login', token: null };
    if (hash === 'register') return { view: 'register', token: null };
    if (hash === 'forgot-password') return { view: 'forgot-password', token: null };
    if (hash === 'candidate-portal' || hash === 'candidate') return { view: 'candidate-portal', token: null };
    if (hash === 'reviewer-portal' || hash === 'reviewer') return { view: 'reviewer-portal', token: null };
    if (hash === 'admin-portal' || hash === 'admin') return { view: 'admin-portal', token: null };

    return { view: 'landing', token: null };
  }, []);

  const setActiveView = (view: ViewType) => {
    setActiveViewInternal(view);
    if (view === 'landing') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      window.history.pushState(null, '', `#${view}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to appropriate authorized portal
  const navigateToRolePortal = useCallback(() => {
    if (!user) {
      setActiveView('login');
      return;
    }

    if (user.role === 'admin') {
      setActiveView('admin-portal');
    } else if (user.role === 'reviewer') {
      setActiveView('reviewer-portal');
    } else {
      setActiveView('candidate-portal');
    }
  }, [user]);

  // Initial user session verification
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        await authClient.fetchCsrf();
        const currentUser = await authClient.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          const { view, token } = parseUrlLocation();
          if (token) setResetToken(token);

          // Route Guard: If user navigated to a portal URL
          if (view === 'admin-portal') {
            if (!currentUser) setActiveViewInternal('login');
            else if (currentUser.role !== 'admin') setActiveViewInternal('unauthorized');
            else setActiveViewInternal('admin-portal');
          } else if (view === 'reviewer-portal') {
            if (!currentUser) setActiveViewInternal('login');
            else if (currentUser.role !== 'reviewer' && currentUser.role !== 'admin') setActiveViewInternal('unauthorized');
            else setActiveViewInternal('reviewer-portal');
          } else if (view === 'candidate-portal') {
            if (!currentUser) setActiveViewInternal('login');
            else setActiveViewInternal('candidate-portal');
          } else {
            setActiveViewInternal(view);
          }
        }
      } catch {
        if (mounted) {
          setUser(null);
          const { view, token } = parseUrlLocation();
          if (token) setResetToken(token);
          setActiveViewInternal(view);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const { view, token } = parseUrlLocation();
      if (token) setResetToken(token);
      setActiveViewInternal(view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      mounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseUrlLocation]);

  const login = async (payload: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await authClient.login(payload);
    if (res.user) {
      setUser(res.user);
      // Redirect based on authorized role
      if (res.user.role === 'admin') {
        setActiveView('admin-portal');
      } else if (res.user.role === 'reviewer') {
        setActiveView('reviewer-portal');
      } else {
        setActiveView('candidate-portal');
      }
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }) => {
    const res = await authClient.register(payload);
    if (res.user) {
      setUser(res.user);
      // Public registrations are guaranteed candidate role
      setActiveView('candidate-portal');
    }
  };

  const logout = async () => {
    await authClient.logout();
    setUser(null);
    setActiveView('landing');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeView,
        setActiveView,
        resetToken,
        setResetToken,
        login,
        register,
        logout,
        navigateToRolePortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
