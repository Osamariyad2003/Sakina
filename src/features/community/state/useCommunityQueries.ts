import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/communityService';
import type { CommunityProfile } from '../models/communityContent';

export const communityQueryKeys = {
  all: ['community'] as const,
  groups: () => [...communityQueryKeys.all, 'groups'] as const,
  threads: (groupId: string) => [...communityQueryKeys.all, 'threads', groupId] as const,
  thread: (threadId: string) => [...communityQueryKeys.all, 'thread', threadId] as const,
  profile: () => [...communityQueryKeys.all, 'profile'] as const,
};

export function useCommunityGroupsQuery() {
  return useQuery({
    queryKey: communityQueryKeys.groups(),
    queryFn: () => communityService.listGroups(),
  });
}

export function useCommunityThreadsQuery(groupId: string | undefined) {
  return useQuery({
    queryKey: communityQueryKeys.threads(groupId ?? ''),
    queryFn: () => communityService.listThreads(groupId as string),
    enabled: Boolean(groupId),
  });
}

export function useCommunityThreadQuery(threadId: string | undefined) {
  return useQuery({
    queryKey: communityQueryKeys.thread(threadId ?? ''),
    queryFn: () => communityService.getThread(threadId as string),
    enabled: Boolean(threadId),
  });
}

export function useCommunityProfileQuery() {
  return useQuery({
    queryKey: communityQueryKeys.profile(),
    queryFn: () => communityService.getProfile(),
  });
}

export function useSaveCommunityProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile: CommunityProfile) => communityService.saveProfile(profile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}

export function useCreateThreadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, title, body }: { groupId: string; title: string; body: string }) =>
      communityService.createThread(groupId, title, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}

export function useReplyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) => communityService.reply(threadId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}

export function useToggleSupportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.toggleSupport(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}

export function useReportPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.report(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}

export function useDeleteMyPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.deleteMyPost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityQueryKeys.all }),
  });
}
