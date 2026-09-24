import { config } from '../../../config';
import { apiClient } from '../../../core/api';
import type { User } from '../../../types/models';

/**
 * Server-side half of Profile. The local half (the cached user in `authStore`,
 * the local content wipe) stays with the callers; when the real API is off
 * these are no-ops because there is no server to keep in step.
 *   PATCH /profile        { displayName?, language? }
 *   POST  /profile/clear-data   deletes the account's mood, stress, sleep,
 *   hydration, journal, symptom-checker, companion and wellness data (keeps
 *   the account and onboarding answers).
 */

async function updateProfile(patch: Partial<Pick<User, 'displayName' | 'language'>>): Promise<void> {
  if (config.useMockServices) return;
  await apiClient.patch('/profile', patch);
}

async function clearServerData(): Promise<void> {
  if (config.useMockServices) return;
  await apiClient.post('/profile/clear-data');
}

export const profileService = { updateProfile, clearServerData };
