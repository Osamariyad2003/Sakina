import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { journalService, type JournalEntryInput } from '../services/journalService';

export const journalQueryKeys = {
  all: ['journal'] as const,
  list: (search?: string) => [...journalQueryKeys.all, 'list', search ?? ''] as const,
  entry: (id: string) => [...journalQueryKeys.all, 'entry', id] as const,
};

export function useJournalListQuery(searchTerm?: string) {
  return useQuery({
    queryKey: journalQueryKeys.list(searchTerm),
    queryFn: () => journalService.list(searchTerm),
  });
}

export function useJournalEntryQuery(id: string | undefined) {
  return useQuery({
    queryKey: journalQueryKeys.entry(id ?? ''),
    queryFn: () => journalService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateJournalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JournalEntryInput) => journalService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: journalQueryKeys.all }),
  });
}

export function useUpdateJournalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: JournalEntryInput }) => journalService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: journalQueryKeys.all }),
  });
}

export function useDeleteJournalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journalService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: journalQueryKeys.all }),
  });
}
