import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hydrationService } from '../services/hydrationService';

export const hydrationQueryKeys = {
  all: ['hydration'] as const,
  today: () => [...hydrationQueryKeys.all, 'today'] as const,
  history: () => [...hydrationQueryKeys.all, 'history'] as const,
};

export function useHydrationTodayQuery() {
  return useQuery({
    queryKey: hydrationQueryKeys.today(),
    queryFn: () => hydrationService.getToday(),
  });
}

export function useHydrationHistoryQuery() {
  return useQuery({
    queryKey: hydrationQueryKeys.history(),
    queryFn: () => hydrationService.listHistory(),
  });
}

export function useLogDrinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sizeMl: number) => hydrationService.logDrink(sizeMl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hydrationQueryKeys.all }),
  });
}

export function useSetHydrationGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ml: number) => hydrationService.setGoal(ml),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hydrationQueryKeys.all }),
  });
}
