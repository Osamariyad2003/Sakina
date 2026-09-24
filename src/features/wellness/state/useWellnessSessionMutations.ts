import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wellnessSessionService, type CreateWellnessSessionInput } from '../services/wellnessSessionService';
import { badgeQueryKeys } from '../../badges/state/useBadgeQueries';

/** Home's tracker signals key ('home'); invalidated by literal to avoid a circular import with features/home/state. */
const homeQueryKeyRoot = ['home'] as const;

/**
 * Records a completed general-Wellness exercise session (feeds Home's
 * "wellnessMinutes" tracker and the badge engine's `wellnessSessionCount` /
 * `wellnessMinutes` / `mindfulMinutes` / `mindfulStreak` signals — see
 * `wellnessSessionService`'s module doc for why this write didn't exist
 * before). Invalidates both query trees so WellnessHomeScreen's Mindful
 * Minutes card, Home's tracker row, and Badges all pick it up immediately.
 */
export function useCreateWellnessSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWellnessSessionInput) => wellnessSessionService.createSession(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgeQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: homeQueryKeyRoot });
    },
  });
}
