import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeService } from '../services/homeService';
import { stressCheckInQueryKeys } from '../../wellness/stress-management/state/useStressCheckInQueries';
import type { StressLevel } from '../models/homeContent';

export const homeQueryKeys = {
  all: ['home'] as const,
  reflection: () => [...homeQueryKeys.all, 'reflection'] as const,
  trackers: () => [...homeQueryKeys.all, 'trackers'] as const,
};

export function useWellbeingReflectionQuery() {
  return useQuery({
    queryKey: homeQueryKeys.reflection(),
    queryFn: () => homeService.getWellbeingReflection(),
  });
}

export function useTrackerSignalsQuery() {
  return useQuery({
    queryKey: homeQueryKeys.trackers(),
    queryFn: () => homeService.getTrackerSignals(),
  });
}

/**
 * Writes through `stressCheckInService` (see homeService.setStressLevel), so
 * it invalidates both query trees — Home's own tracker signals *and* the
 * full Stress check-in/history feature's queries — to keep the two surfaces
 * over one store in sync.
 */
export function useSetStressLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (level: StressLevel) => homeService.setStressLevel(level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: stressCheckInQueryKeys.all });
    },
  });
}
