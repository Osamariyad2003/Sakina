import { create } from 'zustand';
import { clearTokens, getStoredTokens, storeTokens } from '../storage/secureStore';
import { storage, storageKeys } from '../storage/mmkv';
import type { User } from '../../types/models';

export type AuthStatus = 'restoring' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  /** In-memory only (spec §12) — the durable copy lives in SecureStore. */
  accessToken: string | null;

  /** Reads persisted tokens on cold start and resolves the initial status. */
  restoreSession: () => Promise<void>;
  /** Called by features/authentication after a successful login/register. */
  setSession: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  /** Called by the API client's refresh-token flow after a successful refresh. */
  setAccessToken: (accessToken: string) => void;
  /** Called by features/profile after a successful profile edit. */
  updateProfile: (patch: Partial<Pick<User, 'displayName' | 'language'>>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'restoring',
  user: null,
  accessToken: null,

  restoreSession: async () => {
    const { accessToken, refreshToken } = await getStoredTokens();
    if (accessToken && refreshToken) {
      // [ASSUMPTION] No `/me` endpoint is confirmed yet (backend undefined —
      // product-definition.md Open Question #4). We trust the stored token
      // and the last-known profile cached at login time; features/authentication
      // should replace this with a real session-restore API call once the
      // backend contract exists.
      const cachedUser = storage.getJSON<User>(storageKeys.currentUserProfile) ?? null;
      set({ status: 'authenticated', accessToken, user: cachedUser });
    } else {
      set({ status: 'unauthenticated', accessToken: null, user: null });
    }
  },

  setSession: async (user, accessToken, refreshToken) => {
    await storeTokens(accessToken, refreshToken);
    storage.setJSON(storageKeys.currentUserProfile, user);
    set({ status: 'authenticated', user, accessToken });
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  updateProfile: (patch) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...patch };
      // [ASSUMPTION] Only updates the cached profile, not the mock user
      // table in features/authentication/services/authService.ts — fine
      // for MVP (a real backend would own this instead of two local mocks
      // needing to agree).
      storage.setJSON(storageKeys.currentUserProfile, updated);
      return { user: updated };
    });
  },

  logout: async () => {
    await clearTokens();
    storage.delete(storageKeys.currentUserProfile);
    set({ status: 'unauthenticated', user: null, accessToken: null });
  },
}));
