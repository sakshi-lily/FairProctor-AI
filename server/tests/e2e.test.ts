import assert from 'assert';

const BASE_URL = 'http://127.0.0.1:5000';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, headers: res.headers, data };
}

async function runE2ETests() {
  console.log('\n=============================================================');
  console.log('🚀 Running Complete End-to-End Authentication & RBAC Test Suite');
  console.log(`Target: ${BASE_URL}`);
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message || err}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Backend Health check returns status healthy and database connected', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.strictEqual(res.data.database.connected, true);
  });

  // 2. CSRF Token issuance
  let csrfToken = '';
  await test('GET /api/auth/csrf issues secure CSRF token', async () => {
    const res = await request('/api/auth/csrf');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(typeof res.data.csrfToken === 'string' && res.data.csrfToken.length > 20);
    csrfToken = res.data.csrfToken;
  });

  // 3. Candidate Registration
  const testCandidateEmail = `cand_${Date.now()}@fairproctor.ai`;
  let candidateToken = '';
  let candidateId = '';

  await test('POST /api/auth/register creates Candidate account with normalized email', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        name: 'Jordan Smith',
        email: testCandidateEmail.toUpperCase(), // Test normalization
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.user.role, 'candidate');
    assert.strictEqual(res.data.user.email, testCandidateEmail.toLowerCase());
    candidateToken = res.data.token;
    candidateId = res.data.user.id;
  });

  // 4. Privilege Escalation Prevention on Public Register
  await test('Public registration strictly prevents self-assigning Admin or Reviewer role', async () => {
    const maliciousEmail = `hacker_${Date.now()}@fairproctor.ai`;
    const res = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        name: 'Attacker Attempting Escalation',
        email: maliciousEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
        role: 'admin', // Malicious payload
      }),
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.user.role, 'candidate', 'Server MUST override requested role with candidate');
  });

  // 5. Duplicate Email Detection
  await test('Duplicate registration with same email returns 409 Conflict', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        name: 'Duplicate Jordan',
        email: testCandidateEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        termsAccepted: true,
      }),
    });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('already exists'));
  });

  // 6. Invalid Credentials Handling
  await test('Login with incorrect password returns 401 with generic message (no enumeration)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        email: testCandidateEmail,
        password: 'WrongPassword999!',
      }),
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.message, 'Invalid email address or password.');
  });

  // 7. Successful Login for Admin, Reviewer, and Candidate
  let adminToken = '';
  let reviewerToken = '';

  await test('Login as default Admin succeeds with role admin', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        email: 'admin@fairproctor.ai',
        password: 'Admin@FairProctor2026!',
        rememberMe: true,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'admin');
    assert(typeof res.data.token === 'string');
    adminToken = res.data.token;
  });

  await test('Login as default Reviewer succeeds with role reviewer', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        email: 'reviewer@fairproctor.ai',
        password: 'Reviewer@FairProctor2026!',
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'reviewer');
    reviewerToken = res.data.token;
  });

  // 8. Session Verification (GET /api/auth/me)
  await test('GET /api/auth/me returns authenticated user profile', async () => {
    const res = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.email, 'admin@fairproctor.ai');
    assert.strictEqual(res.data.user.role, 'admin');
  });

  // 9. Server-Enforced Role-Based Access Control (RBAC)
  await test('Candidate access to Reviewer API returns 403 Forbidden', async () => {
    const res = await request('/api/reviewer/sessions', {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Forbidden'));
  });

  await test('Candidate access to Admin API returns 403 Forbidden', async () => {
    const res = await request('/api/admin/users', {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Forbidden'));
  });

  await test('Reviewer access to Admin API returns 403 Forbidden', async () => {
    const res = await request('/api/admin/users', {
      headers: { Authorization: `Bearer ${reviewerToken}` },
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  await test('Reviewer access to Reviewer API returns 200 OK with triage sessions', async () => {
    const res = await request('/api/reviewer/sessions', {
      headers: { Authorization: `Bearer ${reviewerToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(Array.isArray(res.data.sessions));
  });

  await test('Admin access to Admin API returns 200 OK with user registry', async () => {
    const res = await request('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(Array.isArray(res.data.users));
    assert(res.data.users.length >= 3);
  });

  // 10. Admin Role Promotion (Candidate -> Reviewer)
  await test('Admin can promote Candidate to Reviewer role', async () => {
    const res = await request(`/api/admin/users/${candidateId}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ role: 'reviewer' }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'reviewer');
  });

  // 11. Last Admin Demotion Safeguard
  await test('Admin cannot demote the last remaining active administrator', async () => {
    const adminMe = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const myAdminId = adminMe.data.user.id;

    const res = await request(`/api/admin/users/${myAdminId}/role`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify({ role: 'candidate' }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert(res.data.message.includes('Cannot demote the last remaining active Administrator'));
  });

  // 12. Password Reset Request Flow
  let resetRawToken = '';
  await test('POST /api/auth/forgot-password generates recovery token with devNotice', async () => {
    const res = await request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ email: testCandidateEmail }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert(res.data.devNotice && res.data.devNotice.rawToken);
    resetRawToken = res.data.devNotice.rawToken;
  });

  // 13. Password Reset Execution
  const newPasswordForCandidate = 'BrandNewPassword2026!';
  await test('POST /api/auth/reset-password updates password using valid token', async () => {
    const res = await request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        token: resetRawToken,
        newPassword: newPasswordForCandidate,
        confirmPassword: newPasswordForCandidate,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 14. Single-Use Token Invalidation
  await test('Reusing the same password reset token is strictly rejected', async () => {
    const res = await request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        token: resetRawToken,
        newPassword: 'AnotherPassword123!',
        confirmPassword: 'AnotherPassword123!',
      }),
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.code, 'TOKEN_INVALID_OR_EXPIRED');
  });

  // 15. Verify login with the updated password
  await test('Login with newly updated password succeeds', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        email: testCandidateEmail,
        password: newPasswordForCandidate,
      }),
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  // 16. Logout & Session Invalidation
  await test('POST /api/auth/logout invalidates session', async () => {
    const res = await request('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'X-CSRF-Token': csrfToken,
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`End-to-End Test Suite: ${passed} passed, ${failed} failed`);
  console.log('-------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E test failure:', err);
  process.exit(1);
});
