import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import { storage, storageKeys } from '../core/storage/mmkv';

export type AppLanguage = 'ar' | 'en';

export function getPersistedLanguage(): AppLanguage {
  const stored = storage.getString(storageKeys.language);
  return stored === 'en' ? 'en' : 'ar'; // Arabic is the default (spec §9)
}

export function isRTLLanguage(lang: AppLanguage): boolean {
  return lang === 'ar';
}

/**
 * Aligns the native layout direction with `lang`. Returns true if a native
 * reload is required to take effect (I18nManager.forceRTL only affects
 * layout on the NEXT native render pass, not the current one — spec §9).
 */
export function ensureLayoutDirection(lang: AppLanguage): boolean {
  const shouldBeRTL = isRTLLanguage(lang);
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    return true;
  }
  return false;
}

/**
 * Call when the user explicitly changes language (onboarding Language step,
 * Profile/Settings). Persists the choice, flips native RTL if needed, and
 * reloads the app so the new layout direction actually applies — handled
 * gracefully (no crash) if reload isn't available, e.g. on web.
 */
export async function setLanguageAndReloadIfNeeded(lang: AppLanguage): Promise<void> {
  storage.set(storageKeys.language, lang);
  const needsReload = ensureLayoutDirection(lang);

  if (needsReload && Platform.OS !== 'web') {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.warn(
        '[rtl] Auto-reload after language change failed — a manual app restart is required to fully apply RTL layout.',
        error,
      );
    }
  }
}
