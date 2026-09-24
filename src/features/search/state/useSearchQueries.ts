import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { searchService } from '../services/searchService';
import { MIN_QUERY_LENGTH, type SearchScope } from '../models/searchContent';

export const searchQueryKeys = {
  all: ['search'] as const,
  results: (query: string, scope: SearchScope, language: string) =>
    [...searchQueryKeys.all, 'results', query, scope, language] as const,
  recent: () => [...searchQueryKeys.all, 'recent'] as const,
};

export function useSearchQuery(query: string, scope: SearchScope) {
  // Results match Arabic or English labels, so the language is both an input
  // to the search and part of its cache key.
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: searchQueryKeys.results(query.trim(), scope, i18n.language),
    queryFn: () => searchService.search(query, scope, i18n.language !== 'en'),
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
