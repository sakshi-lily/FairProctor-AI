import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/connection.js';
import { toSafeUser, UserRole, UserStatus } from '../models/User.js';
import { getAuditLogs, logAuditEvent } from '../services/auditService.js';
import { config } from '../config/env.js';

export const adminRouter = Router();

// Enforce Admin authentication on all admin endpoints
adminRouter.use(authenticateToken);
adminRouter.use(requireRole('admin'));

// -----------------------------------------------------------------------------
// GET /api/admin/users - List All Registered Accounts
// -----------------------------------------------------------------------------
adminRouter.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allUsers = await db.listAllUsers();
    const safeUsers = allUsers.map(toSafeUser);

    res.json({
      success: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (error: any) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user registry.',
    });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/admin/users/:id/role - Promote or Update User Role
// -----------------------------------------------------------------------------
adminRouter.patch('/users/:id/role', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles: UserRole[] = ['candidate', 'reviewer', 'admin'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}`,
      });
      return;
    }

    const targetUser = await db.findUserById(id);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'Target user not found.',
      });
      return;
    }

    // Protection rule: Cannot demote the last remaining active admin
    if (targetUser.role === 'admin' && role !== 'admin') {
      const allUsers = await db.listAllUsers();
      const activeAdmins = allUsers.filter((u) => u.role === 'admin' && u.status === 'active');
      if (activeAdmins.length <= 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot demote the last remaining active Administrator. Promote another administrator first.',
        });
        return;
      }
    }

    const updatedUser = await db.updateUser(id, { role });

    logAuditEvent({
      eventType: 'ROLE_PROMOTED',
      userId: req.user!._id.toString(),
      email: req.user!.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: `Admin ${req.user!.email} changed role of user ${targetUser.email} from '${targetUser.role}' to '${role}'.`,
    });

    res.json({
      success: true,
      message: `User '${targetUser.email}' role updated to '${role}'.`,
      user: toSafeUser(updatedUser || targetUser),
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
    });
  }
});

// -----------------------------------------------------------------------------
// PATCH /api/admin/users/:id/status - Activate or Suspend Account
// -----------------------------------------------------------------------------
adminRouter.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: UserStatus[] = ['active', 'suspended', 'pending'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    // Protection rule: Cannot suspend oneself
    if (id === req.user!._id.toString() && status === 'suspended') {
      res.status(400).json({
        success: false,
        message: 'Administrators cannot suspend their own active session account.',
      });
      return;
    }

    const targetUser = await db.findUserById(id);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'Target user not found.',
      });
      return;
    }

    const updatedUser = await db.updateUser(id, { status });

    logAuditEvent({
      eventType: 'STATUS_CHANGED',
      userId: req.user!._id.toString(),
      email: req.user!.email,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] as string,
      details: `Admin ${req.user!.email} changed status of user ${targetUser.email} to '${status}'.`,
    });

    res.json({
      success: true,
      message: `User account '${targetUser.email}' status changed to '${status}'.`,
      user: toSafeUser(updatedUser || targetUser),
    });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
    });
  }
});

// -----------------------------------------------------------------------------
// GET /api/admin/audit-logs - View Security Audit Trail
// -----------------------------------------------------------------------------
adminRouter.get('/audit-logs', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = getAuditLogs(Math.min(limit, 200));

  res.json({
    success: true,
    count: logs.length,
    logs,
  });
});

// -----------------------------------------------------------------------------
// GET /api/admin/system-status - Inspect Backend Infrastructure & Database Health
// -----------------------------------------------------------------------------
adminRouter.get('/system-status', async (req: AuthenticatedRequest, res: Response) => {
  const dbStatus = db.getStatus();
  const userCount = await db.countUsers();
  const hasSmtp = Boolean(config.SMTP_HOST && config.SMTP_USER);

  res.json({
    success: true,
    environment: config.NODE_ENV,
    serverPort: config.PORT,
    database: {
      mode: dbStatus.mode,
      connected: dbStatus.connected,
      uri: dbStatus.uri,
      storageFile: dbStatus.storageFile,
      totalUsers: userCount,
      driver: dbStatus.mode === 'mongodb' ? 'Mongoose 8.x' : 'Persistent Local JSON Store',
    },
    email: {
      provider: hasSmtp ? 'Configured SMTP' : 'Development Logging Mode (Console & Local Audit)',
      smtpHost: config.SMTP_HOST || 'Not configured in .env',
      smtpPort: config.SMTP_PORT,
      sender: config.SMTP_FROM,
    },
    security: {
      bcryptSaltRounds: 12,
      jwtAlgorithm: 'HS256',
      accessTokenExpiry: config.JWT_ACCESS_EXPIRES_IN,
      refreshTokenExpiry: config.JWT_REFRESH_EXPIRES_IN,
      rememberMeExpiry: config.JWT_REMEMBER_ME_EXPIRES_IN,
      passwordResetExpiry: `${config.PASSWORD_RESET_TOKEN_EXPIRY_MS / 60000} minutes`,
      cookieSecure: config.COOKIE_SECURE,
      cookieSameSite: config.COOKIE_SAME_SITE,
      loginRateLimitMax: config.AUTH_RATE_LIMIT_MAX,
    },
  });
});
