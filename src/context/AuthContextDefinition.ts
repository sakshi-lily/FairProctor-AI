import { createContext } from 'react';
import type { User, ViewType } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  resetToken: string | null;
  setResetToken: (token: string | null) => void;
  login: (payload: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  navigateToRolePortal: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
