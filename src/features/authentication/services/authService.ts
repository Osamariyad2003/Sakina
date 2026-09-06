import { config } from '../../../config';
import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import i18n from '../../../i18n';
import type { User } from '../../../types/models';
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../models/auth';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4). This mock persists a fake user table to MMKV so register → logout →
 * login round-trips correctly during development, and is gated entirely
 * behind `config.useMockServices`. The "password hashing" here is NOT real
 * security — it exists only so two different mock passwords compare
 * unequal. Replace this whole file with real `apiClient` calls once a
 * backend contract exists; the exported function signatures are the
 * contract the rest of the app depends on, so they shouldn't need to change.
 */

interface MockStoredUser extends User {
  password: string;
}

function readMockUsers(): MockStoredUser[] {
  return storage.getJSON<MockStoredUser[]>(storageKeys.mockUsers) ?? [];
}

function writeMockUsers(users: MockStoredUser[]) {
  storage.setJSON(storageKeys.mockUsers, users);
}

function fakeDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function issueTokensFor(user: User): { accessToken: string; refreshToken: string } {
  return {
    accessToken: `mock-access-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
  };
}

async function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  await fakeDelay();
  const users = readMockUsers();
  const found = users.find((u) => u.email === payload.email && u.password === payload.password);
  if (!found) {
    throw new AppError(i18n.t('auth.invalidCredentials'), 'validation', 401);
  }
  const { password: _password, ...user } = found;
  return { user, ...issueTokensFor(user) };
}

async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await fakeDelay();
  const users = readMockUsers();
  if (users.some((u) => u.email === payload.email)) {
    throw new AppError(i18n.t('auth.emailAlreadyUsed'), 'validation', 409);
  }
  const newUser: MockStoredUser = {
    id: `user-${Date.now()}`,
    displayName: payload.displayName,
    email: payload.email,
    language: (i18n.language as 'ar' | 'en') ?? 'ar',
    createdAt: new Date().toISOString(),
    password: payload.password,
  };
  writeMockUsers([...users, newUser]);
  const { password: _password, ...user } = newUser;
  return { user, ...issueTokensFor(user) };
}

const MOCK_RESET_TOKEN_PREFIX = 'mock-reset:';

/**
 * Mock-only: encodes the email into the "reset token" so resetPassword can
 * find the right user without a real email-delivery backend. NOT secure —
 * plain text, not even base64 — replace entirely with server-issued,
 * single-use, opaque tokens.
 */
async function mockForgotPassword(payload: ForgotPasswordPayload): Promise<{ resetToken: string }> {
  await fakeDelay();
  const users = readMockUsers();
  const exists = users.some((u) => u.email === payload.email);
  if (!exists) {
    // Deliberately same response shape whether or not the email exists,
    // to avoid confirming account existence to an attacker.
    return { resetToken: `${MOCK_RESET_TOKEN_PREFIX}unknown-${Date.now()}` };
  }
  return { resetToken: `${MOCK_RESET_TOKEN_PREFIX}${payload.email}` };
}

async function mockResetPassword(payload: ResetPasswordPayload): Promise<void> {
  await fakeDelay();
  if (!payload.token.startsWith(MOCK_RESET_TOKEN_PREFIX)) {
    throw new AppError(i18n.t('auth.invalidResetToken'), 'validation', 400);
  }
  const email = payload.token.slice(MOCK_RESET_TOKEN_PREFIX.length);
  const users = readMockUsers();
  const index = users.findIndex((u) => u.email === email);
  if (index === -1) {
    throw new AppError(i18n.t('auth.invalidResetToken'), 'validation', 400);
  }
  users[index] = { ...users[index], password: payload.newPassword };
  writeMockUsers(users);
}

if (!config.useMockServices) {
  // Real backend doesn't exist yet — see file header. This guard exists so
  // flipping the flag surfaces a loud, obvious failure instead of silently
  // continuing to hit the mock.
  throw new AppError('authService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const authService = {
  login: mockLogin,
  register: mockRegister,
  forgotPassword: mockForgotPassword,
  resetPassword: mockResetPassword,
};
