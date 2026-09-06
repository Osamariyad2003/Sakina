import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stressService, type CreateStressSessionInput } from '../services/stressService';

export const stressQueryKeys = {
  all: ['stress'] as const,
  techniques: () => [...stressQueryKeys.all, 'techniques'] as const,
};

export function useStressTechniquesQuery() {
  return useQuery({
    queryKey: stressQueryKeys.techniques(),
    queryFn: () => stressService.listTechniques(),
  });
}

export function useCreateStressSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStressSessionInput) => stressService.createSession(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stressQueryKeys.all }),
  });
}
