import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { config } from '../config/env.js';
import { toSafeUser } from '../models/User.js';
import {
  authenticateToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  issueCsrfToken,
  AuthenticatedRequest,
  TokenPayload,
} from '../middleware/auth.js';
import { loginRateLimiter, passwordResetLimiter } from '../middleware/rateLimiter.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { logAuditEvent } from '../services/auditService.js';

export const authRouter = Router();

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

// -----------------------------------------------------------------------------
// GET /api/auth/csrf - Obtain a fresh CSRF token
// -----------------------------------------------------------------------------
authRouter.get('/csrf', (req: Request, res: Response) => {
  const token = issueCsrfToken(res);
  res.json({ success: true, csrfToken: token });
});

// -----------------------------------------------------------------------------
// POST /api/auth/register - Candidate Registration
// -----------------------------------------------------------------------------
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, termsAccepted } = req.body;

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        field: 'name',
        message: 'Full name is required and must be at least 2 characters long.',
      });
      return;
    }

    // Validate Email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please provide a valid email address.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate Password
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      res.status(400).json({
        success: false,
        field: 'password',
        message: passwordCheck.reason,
      });
      return;
    }

    // Check Password Confirmation
    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Passwords do not match.',
      });
      return;
    }

    // Verify Terms Acknowledgement
    if (!termsAccepted) {
      res.status(400).json({
        success: false,
        field: 'termsAccepted',
        message: 'You must acknowledge the terms and integrity privacy charter to register.',
      });
      return;
    }

    // Check for duplicate account
    const existingUser = await db.findUserByEmail(normalizedEmail);
    if (existingUser) {
      res.status(409).json({
        success: false,
        field: 'email',
        message: 'An account with this email address already exists. Please log in or use password reset.',
      });
      return;
    }

    // Hash password with bcrypt (salt rounds = 12)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // SECURITY RBAC RULE: Public registration ALWAYS defaults to 'candidate'.
    // Reviewer and Admin roles CANNOT be self-assigned.
    const newUser = await db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'candidate', // Strict enforcement
      status: 'active',
      rememberMe: false,
    });

    logAuditEvent({
      eventType: 'USER_REGISTERED',
      userId: newUser._id.toString(),
      email: newUser.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: `New candidate account registered. Role enforced as 'candidate'.`,
    });

    // Generate tokens and session
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser, false);
    setAuthCookies(res, accessToken, refreshToken, false);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered as Candidate.',
      user: toSafeUser(newUser),
      token: accessToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during registration. Please try again.',
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/login - Secure User Authentication
// -----------------------------------------------------------------------------
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email address and password are required.',
      });
      return;
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const user = await db.findUserByEmail(normalizedEmail);

    // Constant-time protection against timing attacks: always compare even if user not found
    const dummyHash = '$2a$12$e80yE6M7xH6B3e7jXzD8OeZqO1y.Q.Lw9R5/uV3R4nJkP4x/q6rXG';
    const hashToCompare = user ? user.passwordHash : dummyHash;
    const isPasswordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordMatch) {
      logAuditEvent({
        eventType: 'LOGIN_FAILED',
        email: normalizedEmail,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] as string,
        details: 'Failed login attempt: incorrect email or password.',
      });

      // Safe generic message — never reveal whether user exists
      res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
      return;
    }

    // Verify account status
    if (user.status === 'suspended') {
      logAuditEvent({
        eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        userId: user._id.toString(),
        email: user.email,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] as string,
        details: 'Suspended user blocked from logging in.',
      });

      res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account has been suspended. Please contact institutional administration.',
      });
      return;
    }

    // Update last login timestamp and rememberMe preference
    const isRememberMe = Boolean(rememberMe);
    const updatedUser = await db.updateUser(user._id.toString(), {
      lastLoginAt: new Date(),
      rememberMe: isRememberMe,
    });

    const activeUser = updatedUser || user;

    logAuditEvent({
      eventType: 'LOGIN_SUCCESS',
      userId: activeUser._id.toString(),
      email: activeUser.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: `Successful login as role '${activeUser.role}'. RememberMe: ${isRememberMe}`,
    });

    const accessToken = generateAccessToken(activeUser);
    const refreshToken = generateRefreshToken(activeUser, isRememberMe);
    setAuthCookies(res, accessToken, refreshToken, isRememberMe);

    res.json({
      success: true,
      message: 'Login successful.',
      user: toSafeUser(activeUser),
      token: accessToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred during authentication. Please try again.',
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/logout - Invalidate Session and Clear Cookies
// -----------------------------------------------------------------------------
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    logAuditEvent({
      eventType: 'LOGOUT',
      userId: req.user._id.toString(),
      email: req.user.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: 'User logged out and session cookies invalidated.',
    });
  }

  clearAuthCookies(res);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// -----------------------------------------------------------------------------
// GET /api/auth/me - Retrieve Authenticated User Profile
// -----------------------------------------------------------------------------
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: toSafeUser(req.user!),
  });
});

// -----------------------------------------------------------------------------
// POST /api/auth/refresh - Refresh Access Token
// -----------------------------------------------------------------------------
authRouter.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  let refreshToken = req.cookies?.fp_refresh_token || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      code: 'NO_REFRESH_TOKEN',
      message: 'Refresh token not found.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as TokenPayload;
    if (decoded.tokenType !== 'refresh') {
      res.status(401).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid refresh token.',
      });
      return;
    }

    const user = await db.findUserById(decoded.userId);
    if (!user || user.status === 'suspended') {
      clearAuthCookies(res);
      res.status(401).json({
        success: false,
        code: 'USER_INACTIVE',
        message: 'Account no longer active.',
      });
      return;
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user, user.rememberMe ?? false);
    setAuthCookies(res, newAccessToken, newRefreshToken, user.rememberMe ?? false);

    logAuditEvent({
      eventType: 'SESSION_REFRESHED',
      userId: user._id.toString(),
      email: user.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: 'Access token refreshed successfully.',
    });

    res.json({
      success: true,
      token: newAccessToken,
      user: toSafeUser(user),
    });
  } catch {
    clearAuthCookies(res);
    res.status(401).json({
      success: false,
      code: 'REFRESH_EXPIRED',
      message: 'Refresh session expired. Please log in again.',
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/forgot-password - Secure Password Reset Initiation
// -----------------------------------------------------------------------------
authRouter.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await db.findUserByEmail(normalizedEmail);

    let devResult: any = undefined;

    if (user && user.status === 'active') {
      // Generate cryptographically secure random token (32 bytes = 64 hex characters)
      const rawToken = crypto.randomBytes(32).toString('hex');
      // Store SHA-256 hash in database
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + config.PASSWORD_RESET_TOKEN_EXPIRY_MS);

      await db.updateUser(user._id.toString(), {
        passwordResetToken: tokenHash,
        passwordResetExpires: expiresAt,
      });

      const emailResult = await sendPasswordResetEmail(user.email, user.name, rawToken);

      logAuditEvent({
        eventType: 'PASSWORD_RESET_REQUESTED',
        userId: user._id.toString(),
        email: user.email,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] as string,
        details: `Password reset token generated (expires ${expiresAt.toISOString()}). Mode: ${emailResult.mode}`,
      });

      if (config.NODE_ENV === 'development') {
        devResult = {
          rawToken,
          resetUrl: emailResult.resetUrl,
          mode: emailResult.mode,
        };
      }
    } else {
      // Fake delay to prevent user enumeration via timing
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    // CRITICAL SECURITY: Never reveal whether the email exists
    res.json({
      success: true,
      message: 'If an account associated with this email exists, password reset instructions have been dispatched.',
      devNotice: config.NODE_ENV === 'development' && devResult ? devResult : undefined,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred. Please try again later.',
    });
  }
});

// -----------------------------------------------------------------------------
// POST /api/auth/reset-password - Verify Token and Update Password
// -----------------------------------------------------------------------------
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'A valid password reset token is required.',
      });
      return;
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      res.status(400).json({
        success: false,
        message: passwordCheck.reason,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
      return;
    }

    // Compute SHA-256 hash of the incoming token to match stored hash
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const user = await db.findUserByResetToken(tokenHash);

    if (!user) {
      res.status(400).json({
        success: false,
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'This password reset link is invalid or has expired. Please request a new link.',
      });
      return;
    }

    // Hash the new password with salt rounds 12
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // SINGLE-USE ENFORCEMENT: Clear token and expiry immediately
    await db.updateUser(user._id.toString(), {
      passwordHash: newPasswordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    logAuditEvent({
      eventType: 'PASSWORD_RESET_COMPLETED',
      userId: user._id.toString(),
      email: user.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: 'Password was successfully reset using single-use token.',
    });

    // Clear any existing cookies to ensure clean login with new credentials
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Your password has been successfully updated. You may now log in with your new credentials.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal error occurred while updating your password. Please try again.',
    });
  }
});
