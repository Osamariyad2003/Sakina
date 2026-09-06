import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { ReminderPreference, ReminderPreferences } from '../models/notificationContent';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  inbox: () => [...notificationQueryKeys.all, 'inbox'] as const,
  unread: () => [...notificationQueryKeys.all, 'unread'] as const,
  preferences: () => [...notificationQueryKeys.all, 'preferences'] as const,
};

/**
 * The inbox query *refreshes* (derives new entries from real data) rather
 * than plain-listing, so opening the screen always reflects today's state.
 * Derivation is id-deduplicated, so this can't duplicate entries.
 */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.inbox(),
    queryFn: () => notificationService.refresh(),
  });
}

export function useUnreadNotificationCountQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.unread(),
    queryFn: () => notificationService.unreadCount(),
  });
}

export function useReminderPreferencesQuery() {
  return useQuery({
    queryKey: notificationQueryKeys.preferences(),
    queryFn: () => notificationService.getPreferences(),
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}

export function useClearNotificationsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clearAll(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}

export function useSetReminderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, patch }: { kind: ReminderPreference['kind']; patch: Partial<ReminderPreference> }) =>
      notificationService.setReminder(kind, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}

export function useSetQuietHoursMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quietHours: ReminderPreferences['quietHours']) => notificationService.setQuietHours(quietHours),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all }),
  });
}
