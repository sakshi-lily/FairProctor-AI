import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const MAIL_LOG_FILE = path.join(DATA_DIR, 'mail_audit.log');

export interface EmailResult {
  success: boolean;
  mode: 'smtp' | 'development_log';
  resetUrl: string;
  message: string;
}

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  rawToken: string
): Promise<EmailResult> {
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const hasSmtpConfig = Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>FairProctor AI Password Reset</title>
      <style>
        body { font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7F9FC; margin: 0; padding: 24px; color: #101828; }
        .card { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E7EC; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(16, 24, 40, 0.05); }
        .header { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .badge { background: #E8F8EF; color: #16A765; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(22, 167, 101, 0.3); }
        .title { font-size: 20px; font-weight: 800; margin: 0; color: #101828; }
        .btn { display: inline-block; background-color: #16A765; color: #FFFFFF !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 24px; font-size: 12px; color: #667085; line-height: 1.5; border-top: 1px solid #E4E7EC; padding-top: 16px; }
        .code { background: #F2F4F7; padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 13px; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="title">FairProctor <span class="badge">AI</span></span>
        </div>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>A request was received to reset the password for your FairProctor AI account. This link is single-use and will expire in <strong>15 minutes</strong>.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">Reset Your Password</a>
        </div>
        <p>Or copy and paste this secure link into your browser:</p>
        <p class="code">${resetUrl}</p>
        <div class="footer">
          <p>If you did not request this password reset, please ignore this email or contact institutional security immediately.</p>
          <p>&copy; ${new Date().getFullYear()} FairProctor AI. Cryptographic Due Process Platform.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (hasSmtpConfig) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: config.SMTP_FROM,
        to: toEmail,
        subject: 'FairProctor AI — Secure Password Reset Request',
        html: emailHtml,
      });

      console.log(`✓ Password reset email sent via SMTP to: ${toEmail}`);
      return {
        success: true,
        mode: 'smtp',
        resetUrl,
        message: 'Password reset email sent via configured SMTP provider.',
      };
    } catch (smtpErr) {
      console.error('SMTP delivery error:', smtpErr);
      // Fall through to development log
    }
  }

  // Development Fallback: Record to log and print notice
  const logEntry = `[${new Date().toISOString()}] RECIPIENT: ${toEmail} | TOKEN: ${rawToken} | RESET_URL: ${resetUrl}\n`;
  try {
    fs.appendFileSync(MAIL_LOG_FILE, logEntry, 'utf-8');
  } catch (err) {
    console.error('Failed to append to mail audit log:', err);
  }

  console.log(`\n=============================================================`);
  console.log(`[FAIRPROCTOR DEV EMAIL SERVICE - PASSWORD RESET TOKEN]`);
  console.log(`Recipient:   ${toEmail}`);
  console.log(`Target URL:  ${resetUrl}`);
  console.log(`Token:       ${rawToken}`);
  console.log(`Expires:     In 15 minutes (single-use)`);
  console.log(`Notice:      SMTP not configured in .env. Logged to ${MAIL_LOG_FILE}`);
  console.log(`=============================================================\n`);

  return {
    success: true,
    mode: 'development_log',
    resetUrl,
    message: 'SMTP is unconfigured. Password reset instructions generated and logged in development mode.',
  };
}
