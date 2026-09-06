import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { searchService } from '../services/searchService';
import { MIN_QUERY_LENGTH, type SearchScope } from '../models/searchContent';

export const searchQueryKeys = {
  all: ['search'] as const,
  results: (query: string, scope: SearchScope) => [...searchQueryKeys.all, 'results', query, scope] as const,
  recent: () => [...searchQueryKeys.all, 'recent'] as const,
};

export function useSearchQuery(query: string, scope: SearchScope) {
  return useQuery({
    queryKey: searchQueryKeys.results(query.trim(), scope),
    queryFn: () => searchService.search(query, scope),
    enabled: query.trim().length >= MIN_QUERY_LENGTH,
  });
}

export function useRecentSearchesQuery() {
  return useQuery({
    queryKey: searchQueryKeys.recent(),
    queryFn: () => searchService.getRecentSearches(),
  });
}

export function useRememberSearchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (query: string) => searchService.rememberSearch(query),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: searchQueryKeys.recent() }),
  });
}

export function useClearRecentSearchesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => searchService.clearRecentSearches(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: searchQueryKeys.recent() }),
  });
}
