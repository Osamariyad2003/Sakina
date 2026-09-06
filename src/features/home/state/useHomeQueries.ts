import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { homeService } from '../services/homeService';
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

export function useSetStressLevelMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (level: StressLevel) => homeService.setStressLevel(level),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: homeQueryKeys.all }),
  });
}
