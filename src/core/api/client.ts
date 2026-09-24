import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config';
import { useAuthStore } from '../auth/authStore';
import { getStoredTokens, storeTokens, clearTokens } from '../storage/secureStore';
import { mapError } from '../errors/errorMapper';
import { unwrap, type ApiSuccess } from './envelope';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use((requestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return requestConfig;
});

// --- 401 refresh-token flow -------------------------------------------------
// Only active when the real API is on (`config.useMockServices` false). Request shape
// (`POST /auth/refresh { refreshToken }`) is confirmed against the backend's
// validation; the success body is assumed to mirror login's
// (`{ success, data: { accessToken, refreshToken? } }`) — if the backend
// rotates refresh tokens it returns a new one, otherwise the stored one is kept.

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = await getStoredTokens();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<ApiSuccess<{ accessToken: string; refreshToken?: string }>>(
      `${config.apiBaseUrl}/auth/refresh`,
      { refreshToken },
    );
    const { accessToken, refreshToken: rotatedRefreshToken } = unwrap(response);
    await storeTokens(accessToken, rotatedRefreshToken ?? refreshToken);
    useAuthStore.getState().setAccessToken(accessToken);
    return accessToken;
  } catch {
    await clearTokens();
    await useAuthStore.getState().logout();
    return null;
  }
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      config.useMockServices || // mock auth never goes through the real refresh flow
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      // A 401 from login/register/refresh means bad credentials/token, not an expired session.
      originalRequest.url?.startsWith('/auth/')
    ) {
      return Promise.reject(mapError(error));
    }

    originalRequest._retried = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;
    if (!newAccessToken) {
      return Promise.reject(mapError(error));
    }

    originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
    return apiClient(originalRequest);
  },
);
