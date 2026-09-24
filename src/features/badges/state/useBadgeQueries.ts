import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { badgeService } from '../services/badgeService';
import { notificationQueryKeys } from '../../notifications/state/useNotificationQueries';

export const badgeQueryKeys = {
  all: ['badges'] as const,
  list: () => [...badgeQueryKeys.all, 'list'] as const,
  badge: (id: string) => [...badgeQueryKeys.all, 'badge', id] as const,
  signals: () => [...badgeQueryKeys.all, 'signals'] as const,
};

export function useBadgesQuery() {
  return useQuery({
    queryKey: badgeQueryKeys.list(),
    queryFn: () => badgeService.list(),
  });
}

/**
 * The raw derived signals (not badge progress) — for surfaces that want a
 * single number/streak (e.g. WellnessHomeScreen's Mindful Minutes card)
 * without the full badge-evaluation payload.
 */
export function useBadgeSignalsQuery() {
  return useQuery({
    queryKey: badgeQueryKeys.signals(),
    queryFn: () => badgeService.getSignals(),
  });
}

export function useBadgeQuery(id: string | undefined) {
  return useQuery({
    queryKey: badgeQueryKeys.badge(id ?? ''),
    queryFn: () => badgeService.get(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Fires the "you earned this" notifications for anything newly unlocked.
 * A mutation rather than a query because it writes (the seen-set + inbox).
 */
export function useCelebrateBadgesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => badgeService.celebrateNewlyEarned(),
    onSuccess: (fresh) => {
      if (fresh.length === 0) return;
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
