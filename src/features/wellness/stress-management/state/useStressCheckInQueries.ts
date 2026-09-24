import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stressCheckInService, type CreateStressEntryInput } from '../services/stressCheckInService';

/**
 * Home's tracker signals read the same store this feature writes to (see
 * `stressCheckInService`'s module doc). Invalidated by literal key rather
 * than importing `homeQueryKeys` from `features/home/state` to avoid a
 * circular import (Home already imports this module's `stressCheckInQueryKeys`).
 */
const homeQueryKeyRoot = ['home'] as const;

export const stressCheckInQueryKeys = {
  all: ['stressCheckIn'] as const,
  history: () => [...stressCheckInQueryKeys.all, 'history'] as const,
  today: () => [...stressCheckInQueryKeys.all, 'today'] as const,
  entry: (id: string) => [...stressCheckInQueryKeys.all, 'entry', id] as const,
  trend: (days: number) => [...stressCheckInQueryKeys.all, 'trend', days] as const,
};

export function useStressHistoryQuery() {
  return useQuery({
    queryKey: stressCheckInQueryKeys.history(),
    queryFn: stressCheckInService.listEntries,
  });
}

export function useTodayStressQuery() {
  return useQuery({
    queryKey: stressCheckInQueryKeys.today(),
    queryFn: stressCheckInService.getTodayEntry,
  });
}

export function useStressTrendQuery(days: 7 | 30) {
  return useQuery({
    queryKey: stressCheckInQueryKeys.trend(days),
    queryFn: () => stressCheckInService.getTrend(days),
  });
}

export function useStressEntryQuery(id: string) {
  return useQuery({
    queryKey: stressCheckInQueryKeys.entry(id),
    queryFn: () => stressCheckInService.getEntry(id),
  });
}

export function useCreateStressEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStressEntryInput) => stressCheckInService.createEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stressCheckInQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: homeQueryKeyRoot });
    },
  });
}

export function useDeleteStressEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stressCheckInService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stressCheckInQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: homeQueryKeyRoot });
    },
  });
}
