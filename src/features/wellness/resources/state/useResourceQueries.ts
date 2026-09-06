import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceService, type ArticleFilter } from '../services/resourceService';
import type { ResourceTopic } from '../models/resourceContent';

export const resourceQueryKeys = {
  all: ['resources'] as const,
  articles: (filter: ArticleFilter) => [...resourceQueryKeys.all, 'articles', filter] as const,
  article: (id: string) => [...resourceQueryKeys.all, 'article', id] as const,
  workshops: (topic: ResourceTopic | null | undefined) => [...resourceQueryKeys.all, 'workshops', topic ?? ''] as const,
  workshop: (id: string) => [...resourceQueryKeys.all, 'workshop', id] as const,
  saved: () => [...resourceQueryKeys.all, 'saved'] as const,
  savedFlag: (id: string) => [...resourceQueryKeys.all, 'savedFlag', id] as const,
  registrations: () => [...resourceQueryKeys.all, 'registrations'] as const,
  registrationFlag: (id: string) => [...resourceQueryKeys.all, 'registrationFlag', id] as const,
};

export function useArticlesQuery(filter: ArticleFilter) {
  return useQuery({
    queryKey: resourceQueryKeys.articles(filter),
    queryFn: () => resourceService.listArticles(filter),
  });
}

export function useArticleQuery(id: string | undefined) {
  return useQuery({
    queryKey: resourceQueryKeys.article(id ?? ''),
    queryFn: () => resourceService.getArticleById(id as string),
    enabled: Boolean(id),
  });
}

export function useWorkshopsQuery(topic: ResourceTopic | null) {
  return useQuery({
    queryKey: resourceQueryKeys.workshops(topic),
    queryFn: () => resourceService.listWorkshops(topic),
  });
}

export function useWorkshopQuery(id: string | undefined) {
  return useQuery({
    queryKey: resourceQueryKeys.workshop(id ?? ''),
    queryFn: () => resourceService.getWorkshopById(id as string),
    enabled: Boolean(id),
  });
}

export function useSavedResourcesQuery() {
  return useQuery({
    queryKey: resourceQueryKeys.saved(),
    queryFn: () => resourceService.listSaved(),
  });
}

export function useIsSavedQuery(id: string | undefined) {
  return useQuery({
    queryKey: resourceQueryKeys.savedFlag(id ?? ''),
    queryFn: () => resourceService.isSaved(id as string),
    enabled: Boolean(id),
  });
}

export function useToggleSavedMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resourceService.toggleSaved(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceQueryKeys.all }),
  });
}

export function useWorkshopRegistrationsQuery() {
  return useQuery({
    queryKey: resourceQueryKeys.registrations(),
    queryFn: () => resourceService.listRegistrations(),
  });
}

export function useIsRegisteredQuery(workshopId: string | undefined) {
  return useQuery({
    queryKey: resourceQueryKeys.registrationFlag(workshopId ?? ''),
    queryFn: () => resourceService.isRegistered(workshopId as string),
    enabled: Boolean(workshopId),
  });
}

export function useToggleRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workshopId: string) => resourceService.toggleRegistration(workshopId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: resourceQueryKeys.all }),
  });
}
