import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const isProd = process.env.NODE_ENV === 'production';

export const config = {
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fairproctor_auth',
  
  // Security / JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fairproctor_dev_secret_key_8f3d9b1c5a7e24680123456789abcdef',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fairproctor_dev_refresh_secret_key_9e8d7c6b5a4132047819238471',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '1d',
  JWT_REMEMBER_ME_EXPIRES_IN: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d',
  
  // Cookies
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'fairproctor_dev_cookie_secret_key_7718293041928374',
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || isProd,
  COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE || 'lax') as 'lax' | 'strict' | 'none',
  
  // Password Reset Token Expiry (15 minutes default)
  PASSWORD_RESET_TOKEN_EXPIRY_MS: parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MS || '900000', 10),
  
  // Email / SMTP
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '"FairProctor AI Security" <security@fairproctor.ai>',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10), // 5 attempts per window
};
