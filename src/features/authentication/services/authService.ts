import { config } from '../../../config';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { apiClient, parseContract, unwrap, type ApiSuccess } from '../../../core/api';
import type { User } from '../../../types/models';
import { AuthResponseSchema } from '../models/auth';
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '../models/auth';

/**
 * Two implementations behind `config.useMockServices`: the real backend
 * (bottom of this file) and a mock, used when it is on.
 * [ASSUMPTION] The mock persists a fake user table to MMKV so register → logout →
 * login round-trips correctly during development. The mock is gated
 * by `config.useMockServices`. The "password hashing" here is NOT real
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


function issueTokensFor(user: User): { accessToken: string; refreshToken: string } {
  return {
    accessToken: `mock-access-${user.id}-${Date.now()}`,
    refreshToken: `mock-refresh-${user.id}-${Date.now()}`,
  };
}

async function mockLogin(payload: LoginPayload): Promise<AuthResponse> {
  await simulateLatency();
  const users = readMockUsers();
  const found = users.find((u) => u.email === payload.email && u.password === payload.password);
  if (!found) {
    throw AppError.withKey('auth.invalidCredentials', 'validation', 401);
  }
  const { password: _password, ...user } = found;
  return { user, ...issueTokensFor(user) };
}

async function mockRegister(payload: RegisterPayload): Promise<AuthResponse> {
  await simulateLatency();
  const users = readMockUsers();
  if (users.some((u) => u.email === payload.email)) {
    throw AppError.withKey('auth.emailAlreadyUsed', 'validation', 409);
  }
  const newUser: MockStoredUser = {
    id: `user-${Date.now()}`,
    displayName: payload.displayName,
    email: payload.email,
    // Set from the app's current language by the caller (see RegisterPayload).
    language: payload.language ?? 'ar',
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
  await simulateLatency();
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
  await simulateLatency();
  if (!payload.token.startsWith(MOCK_RESET_TOKEN_PREFIX)) {
    throw AppError.withKey('auth.invalidResetToken', 'validation', 400);
  }
  const email = payload.token.slice(MOCK_RESET_TOKEN_PREFIX.length);
  const users = readMockUsers();
  const index = users.findIndex((u) => u.email === email);
  if (index === -1) {
    throw AppError.withKey('auth.invalidResetToken', 'validation', 400);
  }
  users[index] = { ...users[index], password: payload.newPassword };
  writeMockUsers(users);
}

// --- Real backend (config.useMockServices false) ------------------------
// Endpoints under `apiBaseUrl` (…/api/v1): POST /auth/login, /auth/register,
// /auth/forgot-password, /auth/reset-password. Bodies/responses are wrapped in
// the `{ success, data }` envelope (core/api/envelope.ts). `apiClient` already
// maps transport/HTTP failures to AppError; here we only translate the
// auth-specific ones (bad credentials, duplicate email, bad reset token).

async function liveLogin(payload: LoginPayload): Promise<AuthResponse> {
  try {
    return parseContract(
      AuthResponseSchema,
      unwrap(await apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', payload)),
      'POST /auth/login',
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 401) {
      throw AppError.withKey('auth.invalidCredentials', 'validation', 401);
    }
    throw error;
  }
}

async function liveRegister(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    // `consent` is required by the backend. The user can't reach the Auth
    // stack without having ticked the explicit privacy-policy agreement on
    // onboarding's ConsentScreen (its CTA is disabled until they do), so `true`
    // records a real, prior consent rather than a fabricated one.
    return parseContract(
      AuthResponseSchema,
      unwrap(
        await apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', {
          displayName: payload.displayName,
          email: payload.email,
          password: payload.password,
          consent: true,
        }),
      ),
      'POST /auth/register',
    );
  } catch (error) {
    if (error instanceof AppError && error.status === 409) {
      throw AppError.withKey('auth.emailAlreadyUsed', 'validation', 409);
    }
    throw error;
  }
}

/** The backend always answers with a generic "if an account exists…" message and emails the link — no token comes back. */
async function liveForgotPassword(payload: ForgotPasswordPayload): Promise<{ resetToken?: string }> {
  await apiClient.post('/auth/forgot-password', payload);
  return {};
}

async function liveResetPassword(payload: ResetPasswordPayload): Promise<void> {
  try {
    await apiClient.post('/auth/reset-password', payload);
  } catch (error) {
    if (error instanceof AppError && error.kind === 'validation') {
      throw AppError.withKey('auth.invalidResetToken', 'validation', error.status);
    }
    throw error;
  }
}

export const authService = !config.useMockServices
  ? {
      login: liveLogin,
      register: liveRegister,
      forgotPassword: liveForgotPassword,
      resetPassword: liveResetPassword,
    }
  : {
      login: mockLogin,
      register: mockRegister,
      forgotPassword: mockForgotPassword as (payload: ForgotPasswordPayload) => Promise<{ resetToken?: string }>,
      resetPassword: mockResetPassword,
    };
