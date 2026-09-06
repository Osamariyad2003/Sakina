import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config';
import { useAuthStore } from '../auth/authStore';
import { getStoredTokens, storeTokens, clearTokens } from '../storage/secureStore';
import { mapError } from '../errors/errorMapper';

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
// [ASSUMPTION] The refresh endpoint's shape (path, request/response body) is
// unconfirmed — no backend contract exists yet (product-definition.md Open
// Question #4). Wire the real call in `refreshAccessToken` once it does.

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = await getStoredTokens();
  if (!refreshToken) return null;

  try {
    // Placeholder request — replace with the real refresh endpoint.
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${config.apiBaseUrl}/auth/refresh`,
      { refreshToken },
    );
    await storeTokens(data.accessToken, data.refreshToken);
    useAuthStore.getState().setAccessToken(data.accessToken);
    return data.accessToken;
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
      config.useMockServices || // mock services never go through the real refresh flow
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried
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
