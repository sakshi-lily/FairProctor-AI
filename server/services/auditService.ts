import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'security_audit.json');

export type AuditEventType =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'ROLE_PROMOTED'
  | 'STATUS_CHANGED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'SESSION_REFRESHED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  details: string;
}

const inMemoryLogs: AuditLogEntry[] = [];

// Load existing audit logs from file on startup
try {
  if (fs.existsSync(AUDIT_FILE)) {
    const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
    if (raw.trim()) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        inMemoryLogs.push(...parsed.slice(-200));
      }
    }
  }
} catch {
  // Silent fallback
}

function persistLogs(): void {
  try {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(inMemoryLogs.slice(-200), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write security audit log:', err);
  }
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const fullEntry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  inMemoryLogs.unshift(fullEntry);
  if (inMemoryLogs.length > 200) {
    inMemoryLogs.pop();
  }

  persistLogs();
  return fullEntry;
}

export function getAuditLogs(limit: number = 50): AuditLogEntry[] {
  return inMemoryLogs.slice(0, limit);
}
