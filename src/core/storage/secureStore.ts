import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Tokens only. Never store auth tokens in MMKV/AsyncStorage (spec §12/§33).
 */
export const tokenKeys = {
  accessToken: 'sakina.accessToken',
  refreshToken: 'sakina.refreshToken',
} as const;

// expo-secure-store has no web implementation (its ExpoSecureStore.web module is
// an empty stub), so every native call throws "... is not a function" in the
// browser. Fall back to localStorage on web; this is NOT secure storage, but it
// keeps the web dev target functional. See https://docs.expo.dev/versions/v57.0.0/sdk/securestore/.
export const secureStorage =
  Platform.OS === 'web'
    ? {
        async getItem(key: string): Promise<string | null> {
          if (typeof window === 'undefined') return null;
          return window.localStorage.getItem(key);
        },
        async setItem(key: string, value: string): Promise<void> {
          if (typeof window === 'undefined') return;
          window.localStorage.setItem(key, value);
        },
        async deleteItem(key: string): Promise<void> {
          if (typeof window === 'undefined') return;
          window.localStorage.removeItem(key);
        },
      }
    : {
        async getItem(key: string): Promise<string | null> {
          return SecureStore.getItemAsync(key);
        },
        async setItem(key: string, value: string): Promise<void> {
          await SecureStore.setItemAsync(key, value);
        },
        async deleteItem(key: string): Promise<void> {
          await SecureStore.deleteItemAsync(key);
        },
      };

export async function getStoredTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    secureStorage.getItem(tokenKeys.accessToken),
    secureStorage.getItem(tokenKeys.refreshToken),
  ]);
  return { accessToken, refreshToken };
}

export async function storeTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    secureStorage.setItem(tokenKeys.accessToken, accessToken),
    secureStorage.setItem(tokenKeys.refreshToken, refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    secureStorage.deleteItem(tokenKeys.accessToken),
    secureStorage.deleteItem(tokenKeys.refreshToken),
  ]);
}
