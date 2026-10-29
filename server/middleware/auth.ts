import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { db } from '../db/connection.js';
import { IUser, UserRole } from '../models/User.js';
import { logAuditEvent } from '../services/auditService.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  csrfToken?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
}

export function generateAccessToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenType: 'access',
  };
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function generateRefreshToken(user: IUser, rememberMe: boolean): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenType: 'refresh',
  };
  const expiry = rememberMe ? config.JWT_REMEMBER_ME_EXPIRES_IN : config.JWT_REFRESH_EXPIRES_IN;
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: expiry as any,
  });
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string, rememberMe: boolean): void {
  const maxAgeMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  res.cookie('fp_access_token', accessToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    maxAge: 15 * 60 * 1000, // 15 mins
    path: '/',
  });

  res.cookie('fp_refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    maxAge: maxAgeMs,
    path: '/',
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('fp_access_token', {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    path: '/',
  });
  res.clearCookie('fp_refresh_token', {
    httpOnly: true,
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    path: '/',
  });
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  // Check Authorization header first (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.fp_access_token) {
    // Fall back to HttpOnly cookie
    token = req.cookies.fp_access_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required. No token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    if (decoded.tokenType !== 'access') {
      res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid token type.',
      });
      return;
    }

    const user = await db.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'Account not found.',
      });
      return;
    }

    if (user.status === 'suspended') {
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        userId: user._id.toString(),
        email: user.email,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] as string,
        details: 'Suspended user attempted to authenticate',
      });

      res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session access token expired. Refresh required.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid or forged authentication token.',
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        userId: req.user._id.toString(),
        email: req.user.email,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] as string,
        details: `Access denied to ${req.originalUrl}. Role '${req.user.role}' is not in allowed roles: [${allowedRoles.join(', ')}]`,
      });

      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Forbidden: Access restricted. Requires [${allowedRoles.join('/')}] privileges.`,
      });
      return;
    }

    next();
  };
}

export function issueCsrfToken(res: Response): string {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('fp_csrf_token', token, {
    httpOnly: false, // Accessible to client JavaScript to include in state-changing headers
    secure: config.COOKIE_SECURE,
    sameSite: config.COOKIE_SAME_SITE,
    path: '/',
  });
  return token;
}

export function verifyCsrf(req: Request, res: Response, next: NextFunction): void {
  // Safe read-only HTTP methods do not require CSRF token
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // If request uses Authorization Bearer header, browser CSRF vulnerabilities do not apply
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies ? req.cookies.fp_csrf_token : null;
  const headerToken = (req.headers['x-csrf-token'] || req.headers['x-xsrf-token']) as string;

  // In development, if CSRF header isn't supplied yet, allow graceful fallback while logging warning
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    if (config.NODE_ENV === 'development' && !cookieToken) {
      return next();
    }

    res.status(403).json({
      success: false,
      code: 'CSRF_MISMATCH',
      message: 'Invalid or missing CSRF token. State-changing requests must supply X-CSRF-Token.',
    });
    return;
  }

  next();
}
