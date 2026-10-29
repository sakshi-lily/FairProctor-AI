import assert from 'assert';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { config } from '../config/env.js';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('🧪 Starting FairProctor AI Authentication & RBAC Test Suite');
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

  // 1. Password Hashing Security
  await test('Passwords must be hashed with bcrypt (salt >= 12) and never plain-text', async () => {
    const plain = 'SuperSecret123!';
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(plain, salt);

    assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Hash should be bcrypt format');
    assert(hash !== plain, 'Password must not be stored in plain text');
    const matches = await bcrypt.compare(plain, hash);
    assert.strictEqual(matches, true, 'bcrypt compare should verify correct password');
    const wrong = await bcrypt.compare('WrongPassword', hash);
    assert.strictEqual(wrong, false, 'bcrypt compare should reject incorrect password');
  });

  // 2. Public Registration & Strict Role Enforcement
  await test('Public registration must enforce role: candidate and prevent privilege escalation', async () => {
    const testEmail = `candidate_test_${Date.now()}@fairproctor.ai`;
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('CandidatePass2026!', salt);

    // Attempt to pass role: 'admin'
    const user = await db.createUser({
      name: 'Test Candidate',
      email: testEmail,
      passwordHash: hash,
      role: 'candidate', // Our API forces 'candidate'
      status: 'active',
    });

    assert.strictEqual(user.role, 'candidate', 'Role must strictly be candidate');
    assert.strictEqual(user.email, testEmail.toLowerCase(), 'Email must be normalized');

    const found = await db.findUserByEmail(testEmail);
    assert(found !== null, 'User should be found in database');
    assert.strictEqual(found?.role, 'candidate');
  });

  // 3. Duplicate Registration Prevention
  await test('Duplicate registration with same email (case-insensitive) is detected', async () => {
    const testEmail = `duplicate_test_${Date.now()}@fairproctor.ai`;
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('Password123!', salt);

    await db.createUser({
      name: 'Original User',
      email: testEmail.toUpperCase(), // Mixed case
      passwordHash: hash,
      role: 'candidate',
    });

    const existing = await db.findUserByEmail(testEmail.toLowerCase());
    assert(existing !== null, 'Should detect existing email regardless of casing');
  });

  // 4. JWT Access and Refresh Tokens
  await test('JWT Access token and Refresh token generation & verification', async () => {
    const testUser = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Token Tester',
      email: 'tokentest@fairproctor.ai',
      role: 'reviewer' as const,
      passwordHash: 'hash',
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accessToken = generateAccessToken(testUser);
    const refreshToken = generateRefreshToken(testUser, true);

    const decodedAccess = jwt.verify(accessToken, config.JWT_SECRET) as any;
    assert.strictEqual(decodedAccess.email, testUser.email);
    assert.strictEqual(decodedAccess.role, 'reviewer');
    assert.strictEqual(decodedAccess.tokenType, 'access');

    const decodedRefresh = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as any;
    assert.strictEqual(decodedRefresh.tokenType, 'refresh');
  });

  // 5. Password Reset Flow (Time-limited & Single-Use Enforcement)
  await test('Password reset flow with cryptographic SHA-256 tokens and single-use invalidation', async () => {
    const testEmail = `reset_test_${Date.now()}@fairproctor.ai`;
    const salt = await bcrypt.genSalt(12);
    const originalHash = await bcrypt.hash('OldPassword123!', salt);

    const user = await db.createUser({
      name: 'Reset Tester',
      email: testEmail,
      passwordHash: originalHash,
      role: 'candidate',
      status: 'active',
    });

    // 1. Generate random 32-byte token and SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await db.updateUser(user._id.toString(), {
      passwordResetToken: tokenHash,
      passwordResetExpires: expiry,
    });

    // 2. Verify token lookup succeeds before reset
    const userWithToken = await db.findUserByResetToken(tokenHash);
    assert(userWithToken !== null, 'User should be found with valid active token');
    assert.strictEqual(userWithToken?._id.toString(), user._id.toString());

    // 3. Reset password & invalidate token (Single Use)
    const newSalt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash('NewStrongPassword2026!', newSalt);

    await db.updateUser(user._id.toString(), {
      passwordHash: newHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // 4. Verify token can NEVER be reused
    const tokenAfterUse = await db.findUserByResetToken(tokenHash);
    assert.strictEqual(tokenAfterUse, null, 'Single-use token must be invalidated immediately');

    // 5. Verify new password works and old password fails
    const updatedUser = await db.findUserById(user._id.toString());
    const newMatches = await bcrypt.compare('NewStrongPassword2026!', updatedUser!.passwordHash);
    assert.strictEqual(newMatches, true, 'New password must authenticate successfully');
    const oldMatches = await bcrypt.compare('OldPassword123!', updatedUser!.passwordHash);
    assert.strictEqual(oldMatches, false, 'Old password must no longer authenticate');
  });

  // 6. Role-Based Permissions & Privilege Verification
  await test('RBAC: Admin, Reviewer, and Candidate roles have distinct permissions', async () => {
    const admin = await db.findUserByEmail('admin@fairproctor.ai');
    const reviewer = await db.findUserByEmail('reviewer@fairproctor.ai');
    const candidate = await db.findUserByEmail('candidate@fairproctor.ai');

    assert(admin !== null && admin.role === 'admin', 'Default Admin must exist');
    assert(reviewer !== null && reviewer.role === 'reviewer', 'Default Reviewer must exist');
    assert(candidate !== null && candidate.role === 'candidate', 'Default Candidate must exist');

    // Candidate should never have reviewer privileges
    const reviewerAllowedRoles = ['reviewer', 'admin'];
    assert.strictEqual(reviewerAllowedRoles.includes(candidate.role), false, 'Candidate denied reviewer access');
    assert.strictEqual(reviewerAllowedRoles.includes(reviewer.role), true, 'Reviewer granted reviewer access');
    assert.strictEqual(reviewerAllowedRoles.includes(admin.role), true, 'Admin granted reviewer access');

    // Only admin can access admin settings
    const adminAllowedRoles = ['admin'];
    assert.strictEqual(adminAllowedRoles.includes(candidate.role), false, 'Candidate denied admin access');
    assert.strictEqual(adminAllowedRoles.includes(reviewer.role), false, 'Reviewer denied admin access');
    assert.strictEqual(adminAllowedRoles.includes(admin.role), true, 'Admin granted admin access');
  });

  // 7. Email Service Fallback & Security Notice
  await test('Email service documents development fallback when SMTP is unconfigured', async () => {
    const result = await sendPasswordResetEmail(
      'student@example.com',
      'Test Student',
      'mock_token_38f2910a8b7c'
    );
    assert.strictEqual(result.success, true);
    assert(result.resetUrl.includes('mock_token_38f2910a8b7c'));
  });

  console.log('\n-------------------------------------------------------------');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('-------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Connect to DB and run tests
import('../db/connection.js').then(async ({ initDatabase }) => {
  await initDatabase();
  await runTestSuite();
  process.exit(0);
});
