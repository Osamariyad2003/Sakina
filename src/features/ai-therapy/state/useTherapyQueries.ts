import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { therapyService, type CreateConversationInput } from '../services/therapyService';

export const therapyQueryKeys = {
  all: ['therapy'] as const,
  conversations: () => [...therapyQueryKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...therapyQueryKeys.all, 'conversation', id] as const,
};

export function useTherapyConversationsQuery() {
  return useQuery({
    queryKey: therapyQueryKeys.conversations(),
    queryFn: () => therapyService.listConversations(),
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConversationInput) => therapyService.createConversation(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: therapyQueryKeys.conversations() }),
  });
}

export function useTrashConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, trashed }: { id: string; trashed: boolean }) => therapyService.setTrashed(id, trashed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: therapyQueryKeys.conversations() }),
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => therapyService.deleteForever(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: therapyQueryKeys.all }),
  });
}
