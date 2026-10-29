export type UserRole = 'candidate' | 'reviewer' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  code?: string;
  devNotice?: {
    rawToken: string;
    resetUrl: string;
    mode: string;
  };
}

export type ViewType =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'candidate-portal'
  | 'reviewer-portal'
  | 'admin-portal'
  | 'unauthorized';
