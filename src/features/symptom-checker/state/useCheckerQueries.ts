import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkerService, type AnalyzeInput } from '../services/checkerService';

export const checkerQueryKeys = {
  all: ['checker'] as const,
  sessions: () => [...checkerQueryKeys.all, 'sessions'] as const,
};

export function useCheckerSessionsQuery() {
  return useQuery({
    queryKey: checkerQueryKeys.sessions(),
    queryFn: () => checkerService.listSessions(),
  });
}

export function useAnalyzeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnalyzeInput) => checkerService.analyze(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: checkerQueryKeys.sessions() }),
  });
}
