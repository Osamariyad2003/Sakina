import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  sleepService,
  type CreateSleepRecordInput,
  type SleepRecommendation,
} from '../services/sleepService';
import type { SleepScheduleDraft } from '../models/sleepContent';

export const sleepQueryKeys = {
  all: ['sleep'] as const,
  schedules: () => [...sleepQueryKeys.all, 'schedules'] as const,
  records: () => [...sleepQueryKeys.all, 'records'] as const,
  record: (id: string) => [...sleepQueryKeys.all, 'record', id] as const,
};

export function useSleepSchedulesQuery() {
  return useQuery({
    queryKey: sleepQueryKeys.schedules(),
    queryFn: () => sleepService.listSchedules(),
  });
}

export function useSleepRecordsQuery() {
  return useQuery({
    queryKey: sleepQueryKeys.records(),
    queryFn: () => sleepService.listRecords(),
  });
}

export function useSleepRecordQuery(id: string) {
  return useQuery({
    queryKey: sleepQueryKeys.record(id),
    queryFn: () => sleepService.getRecord(id),
  });
}

export function useCreateSleepScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: SleepScheduleDraft) => sleepService.createSchedule(draft),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sleepQueryKeys.schedules() }),
  });
}

export function useToggleSleepScheduleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => sleepService.setScheduleEnabled(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sleepQueryKeys.schedules() }),
  });
}

export function useCreateSleepRecordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSleepRecordInput) => sleepService.createRecord(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sleepQueryKeys.records() }),
  });
}

export function useDeleteSleepRecordMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sleepService.deleteRecord(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sleepQueryKeys.all }),
  });
}

export function useSleepRecommendationMutation() {
  return useMutation<SleepRecommendation, unknown, { wakeUp: string; inBed: string }>({
    mutationFn: (answers) => sleepService.recommend(answers),
  });
}
