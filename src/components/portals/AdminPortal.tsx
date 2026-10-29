import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Database,
  Mail,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { authClient } from '../../api/authClient';
import type { User, UserRole } from '../../types/auth';

export const AdminPortal: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'system' | 'audit'>('users');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await authClient.getAdminUsers();
      if (res.users) {
        setUsersList(res.users);
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to load user registry.',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch system status
  const loadSystemStatus = async () => {
    try {
      const res = await authClient.getAdminSystemStatus();
      setSystemStatus(res);
    } catch {
      // Handle error
    }
  };

  // Fetch audit logs
  const loadAuditLogs = async () => {
    try {
      const res = await authClient.getAdminAuditLogs(50);
      if (res.logs) {
        setAuditLogs(res.logs);
      }
    } catch {
      // Handle error
    }
  };

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!ignore) {
        await loadUsers();
        await loadSystemStatus();
        await loadAuditLogs();
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleChange = async (targetUser: User, newRole: UserRole) => {
    if (targetUser.role === newRole) return;

    try {
      const res = await authClient.updateAdminUserRole(targetUser.id, newRole);
      setActionFeedback({
        type: 'success',
        text: res.message || `Updated role of ${targetUser.email} to ${newRole}.`,
      });
      loadUsers();
      loadAuditLogs();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to update user role.',
      });
    }
  };

  const handleStatusToggle = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';

    try {
      const res = await authClient.updateAdminUserStatus(targetUser.id, nextStatus);
      setActionFeedback({
        type: 'success',
        text: res.message || `User ${targetUser.email} status is now ${nextStatus}.`,
      });
      loadUsers();
      loadAuditLogs();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to update user status.',
      });
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', backgroundColor: '#F7F9FC', padding: '2.5rem 1.5rem' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '12px',
            padding: '1.5rem 2rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Crown size={22} color="#16A765" />
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#101828' }}>
                System Administration & Governance Console
              </h1>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475467', marginTop: '0.2rem' }}>
              Authenticated as: <strong>{user?.name}</strong> ({user?.email}) &middot; Institutional Root Privileges
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#F2F4F7', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'users' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'users' ? '#101828' : '#475467',
                boxShadow: activeTab === 'users' ? '0 1px 3px rgba(16, 24, 40, 0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Users size={16} />
              <span>User Registry ({usersList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'system' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'system' ? '#101828' : '#475467',
                boxShadow: activeTab === 'system' ? '0 1px 3px rgba(16, 24, 40, 0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Database size={16} />
              <span>System Health</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'audit' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'audit' ? '#101828' : '#475467',
                boxShadow: activeTab === 'audit' ? '0 1px 3px rgba(16, 24, 40, 0.1)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Activity size={16} />
              <span>Security Audit Trail</span>
            </button>
          </div>
        </motion.div>

        {/* Global Action Feedback Alert */}
        {actionFeedback && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: actionFeedback.type === 'success' ? '#ECFDF3' : '#FEF2F2',
              border: `1px solid ${actionFeedback.type === 'success' ? '#A6F4C5' : '#FCA5A5'}`,
              color: actionFeedback.type === 'success' ? '#027A48' : '#B91C1C',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {actionFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{actionFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
            >
              &times;
            </button>
          </div>
        )}

        {/* TAB 1: User Management */}
        {activeTab === 'users' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            {/* Top Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} color="#667085" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, or role..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.25rem',
                    fontSize: '0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #D0D5DD',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={loadUsers}
                className="btn btn-outline-navy btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={14} className={loadingUsers ? 'spin' : ''} />
                <span>Refresh Registry</span>
              </button>
            </div>

            {/* User Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E4E7EC', backgroundColor: '#F8F9FC' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#344054' }}>User / Identity</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#344054' }}>Role & Privileges</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#344054' }}>Account Status</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#344054' }}>Registered</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#344054', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#667085' }}>
                        No matching users found in registry.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #E4E7EC' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: '#101828', display: 'block' }}>{u.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#667085' }}>{u.email}</span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: '1px solid #D0D5DD',
                              backgroundColor:
                                u.role === 'admin' ? '#FEF3F2' : u.role === 'reviewer' ? '#F0F9FF' : '#E8F8EF',
                              color:
                                u.role === 'admin' ? '#B42318' : u.role === 'reviewer' ? '#026AA2' : '#027A48',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="candidate">Candidate</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className={u.status === 'active' ? 'badge badge-green' : 'badge badge-danger'}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: '#667085' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(u)}
                            disabled={u.id === user?.id}
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: '4px',
                              border: '1px solid #D0D5DD',
                              backgroundColor: '#FFFFFF',
                              color: u.status === 'active' ? '#DC2626' : '#16A765',
                              cursor: u.id === user?.id ? 'not-allowed' : 'pointer',
                              opacity: u.id === user?.id ? 0.5 : 1,
                            }}
                            title={u.id === user?.id ? 'Cannot suspend your own account' : undefined}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: System Health & Infrastructure */}
        {activeTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Database Health Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                padding: '1.75rem',
                boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <Database size={22} color="#16A765" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#101828' }}>
                  Database Engine & State
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Active Persistence Mode:</span>
                  <span className="badge badge-green" style={{ textTransform: 'uppercase' }}>
                    {systemStatus?.database?.mode || 'mongodb'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Connection Status:</span>
                  <span style={{ fontWeight: 700, color: '#16A765' }}>
                    {systemStatus?.database?.connected ? '✓ Connected' : 'Local Fallback'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Target URI:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {systemStatus?.database?.uri || 'mongodb://127.0.0.1:27017/fairproctor_auth'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Registered User Documents:</span>
                  <span style={{ fontWeight: 700, color: '#101828' }}>
                    {systemStatus?.database?.totalUsers || usersList.length}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475467' }}>ODM Driver:</span>
                  <span style={{ fontWeight: 600 }}>{systemStatus?.database?.driver || 'Mongoose 8.x'}</span>
                </div>
              </div>
            </div>

            {/* Email / SMTP Configuration Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                padding: '1.75rem',
                boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <Mail size={22} color="#0284C7" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#101828' }}>
                  Email & Password Reset Dispatcher
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Dispatcher Provider:</span>
                  <span style={{ fontWeight: 600, color: '#101828' }}>
                    {systemStatus?.email?.provider || 'Development Logging Mode'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Sender Address:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {systemStatus?.email?.sender || 'security@fairproctor.ai'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Token Validity Window:</span>
                  <span style={{ fontWeight: 700, color: '#16A765' }}>15 minutes (Single-Use)</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#667085', lineHeight: 1.45, margin: 0 }}>
                  ℹ When SMTP host credentials are not present in .env, tokens are securely written to server/data/mail_audit.log and displayed on the console.
                </p>
              </div>
            </div>

            {/* Cryptographic Security Policies Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                padding: '1.75rem',
                boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <ShieldCheck size={22} color="#16A765" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#101828' }}>
                  Cryptographic Security Architecture
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Password KDF:</span>
                  <span style={{ fontWeight: 700 }}>bcrypt (Salt factor = 12)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Session Tokens:</span>
                  <span style={{ fontWeight: 600 }}>JWT Access (15m) + Refresh (30d)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #F2F4F7' }}>
                  <span style={{ color: '#475467' }}>Cookie Policy:</span>
                  <span style={{ fontWeight: 600 }}>HttpOnly, SameSite=Lax, Secure</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475467' }}>Login Rate Limiter:</span>
                  <span style={{ fontWeight: 700, color: '#16A765' }}>5 attempts / 15m window</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              padding: '1.75rem',
              boxShadow: '0 2px 6px rgba(16, 24, 40, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#101828' }}>
                  Security & Access Event Trail
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#667085' }}>
                  Real-time tamper-evident records of authentication attempts, role updates, and password recoveries.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                className="btn btn-outline-navy btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RefreshCw size={14} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '500px', overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#667085' }}>
                  No security audit events recorded yet.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: '8px',
                      backgroundColor: '#F8F9FC',
                      border: '1px solid #E4E7EC',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              log.eventType.includes('FAILED') || log.eventType.includes('UNAUTHORIZED')
                                ? '#FEE4E2'
                                : log.eventType.includes('REGISTER') || log.eventType.includes('PROMOTED')
                                ? '#E8F8EF'
                                : '#EFF8FF',
                            color:
                              log.eventType.includes('FAILED') || log.eventType.includes('UNAUTHORIZED')
                                ? '#B42318'
                                : log.eventType.includes('REGISTER') || log.eventType.includes('PROMOTED')
                                ? '#027A48'
                                : '#175CD3',
                          }}
                        >
                          {log.eventType}
                        </span>
                        {log.email && (
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#101828' }}>
                            {log.email}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475467', margin: 0 }}>{log.details}</p>
                    </div>

                    <span style={{ fontSize: '0.75rem', color: '#667085', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
