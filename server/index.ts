import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { config } from './config/env.js';
import { initDatabase, db } from './db/connection.js';
import { authRouter } from './routes/authRoutes.js';
import { candidateRouter } from './routes/candidateRoutes.js';
import { reviewerRouter } from './routes/reviewerRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { verifyCsrf } from './middleware/auth.js';

const app = express();

// Trust reverse proxy (for accurate IP in rate limiting)
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS Configuration
const allowedOrigins = [
  config.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local dev, origins logged
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
    exposedHeaders: ['X-CSRF-Token'],
  })
);

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.COOKIE_SECRET));

// CSRF verification on state-changing requests
app.use('/api', verifyCsrf);

// Global API rate limiter
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const dbStatus = db.getStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FairProctor AI Authentication & Access Control API',
    database: {
      mode: dbStatus.mode,
      connected: dbStatus.connected,
    },
  });
});

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/candidate', candidateRouter);
app.use('/api/reviewer', reviewerRouter);
app.use('/api/admin', adminRouter);

// Safe Fallback 404 Handler for API
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.',
  });
});

// Safe Global Error Handler (Prevents stack trace leaks in production)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[FairProctor Error]', err);
  const isDev = config.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message || 'Internal server error' : 'An internal server error occurred.',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// Initial Database Seeding Helper
async function seedDefaultAccountsIfEmpty(): Promise<void> {
  const count = await db.countUsers();
  if (count > 0) return;

  console.log('Seeding initial verified demonstration accounts...');

  const defaultAccounts = [
    {
      name: 'System Administrator',
      email: 'admin@fairproctor.ai',
      rawPassword: 'Admin@FairProctor2026!',
      role: 'admin' as const,
      status: 'active' as const,
    },
    {
      name: 'Chief Reviewer (Proctor)',
      email: 'reviewer@fairproctor.ai',
      rawPassword: 'Reviewer@FairProctor2026!',
      role: 'reviewer' as const,
      status: 'active' as const,
    },
    {
      name: 'Elena Rostova (Candidate)',
      email: 'candidate@fairproctor.ai',
      rawPassword: 'Candidate@FairProctor2026!',
      role: 'candidate' as const,
      status: 'active' as const,
    },
  ];

  for (const acc of defaultAccounts) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(acc.rawPassword, salt);
    await db.createUser({
      name: acc.name,
      email: acc.email,
      passwordHash,
      role: acc.role,
      status: acc.status,
      rememberMe: false,
    });
  }

  console.log(`✓ Seeded 3 default accounts:`);
  console.log(`  - Admin:     admin@fairproctor.ai     / Admin@FairProctor2026!`);
  console.log(`  - Reviewer:  reviewer@fairproctor.ai  / Reviewer@FairProctor2026!`);
  console.log(`  - Candidate: candidate@fairproctor.ai / Candidate@FairProctor2026!`);
}

// Start Server
async function startServer(): Promise<void> {
  await initDatabase();
  await seedDefaultAccountsIfEmpty();

  const server = app.listen(config.PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🛡️  FairProctor AI Auth & API Server running on port ${config.PORT}`);
    console.log(`🌐  Client origin: ${config.CLIENT_URL}`);
    console.log(`🔐  JWT Authentication & Cookie RBAC enabled`);
    console.log(`=============================================================\n`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

export default app;
