import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodService, type CreateMoodEntryInput } from '../services/moodService';

export const moodQueryKeys = {
  all: ['mood'] as const,
  history: () => [...moodQueryKeys.all, 'history'] as const,
  today: () => [...moodQueryKeys.all, 'today'] as const,
  entry: (id: string) => [...moodQueryKeys.all, 'entry', id] as const,
  trend: (days: number) => [...moodQueryKeys.all, 'trend', days] as const,
};

export function useMoodHistoryQuery() {
  return useQuery({
    queryKey: moodQueryKeys.history(),
    queryFn: moodService.listEntries,
  });
}

export function useTodayMoodQuery() {
  return useQuery({
    queryKey: moodQueryKeys.today(),
    queryFn: moodService.getTodayEntry,
  });
}

export function useMoodTrendQuery(days: 7 | 30) {
  return useQuery({
    queryKey: moodQueryKeys.trend(days),
    queryFn: () => moodService.getTrend(days),
  });
}

export function useMoodEntryQuery(id: string) {
  return useQuery({
    queryKey: moodQueryKeys.entry(id),
    queryFn: () => moodService.getEntry(id),
  });
}

export function useCreateMoodEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMoodEntryInput) => moodService.createEntry(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodQueryKeys.all });
    },
  });
}

export function useDeleteMoodEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => moodService.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodQueryKeys.all });
    },
  });
}
