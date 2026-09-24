import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearAllLocalContentData } from '../../../core/storage/mmkv';
import { profileService } from '../services/profileService';

/**
 * Profile writes, as mutations rather than bare service calls from the screen
 * (docs/architecture-review.md §6.4). Beyond consistency, this is where the
 * cache consequences of each write live — a screen calling the service
 * directly has no way to express them.
 */

export function useUpdateDisplayNameMutation() {
  return useMutation({
    mutationFn: (displayName: string) => profileService.updateProfile({ displayName }),
  });
}

/**
 * "Clear my data" (spec §26). Order matters and is deliberate:
 *
 * 1. server first — if that fails, nothing local is touched, so the two
 *    sides never drift apart;
 * 2. then local MMKV content;
 * 3. then the React Query cache — without this step every screen already
 *    mounted keeps rendering the data the user was just told was deleted.
 *    `clear()` drops the cache outright rather than refetching it.
 */
export function useClearMyDataMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await profileService.clearServerData();
      clearAllLocalContentData();
      queryClient.clear();
    },
  });
}
