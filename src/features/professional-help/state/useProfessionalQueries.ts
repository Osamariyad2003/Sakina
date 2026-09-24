import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { professionalService, type BookingInput } from '../services/professionalService';
import type { DirectoryFilter } from '../models/professionalContent';

export const professionalQueryKeys = {
  all: ['professionals'] as const,
  directory: (filter: DirectoryFilter, language: string) =>
    [...professionalQueryKeys.all, 'directory', filter, language] as const,
  professional: (id: string) => [...professionalQueryKeys.all, 'professional', id] as const,
  availability: (id: string, isoDate: string) => [...professionalQueryKeys.all, 'availability', id, isoDate] as const,
  appointments: () => [...professionalQueryKeys.all, 'appointments'] as const,
  appointment: (id: string) => [...professionalQueryKeys.all, 'appointment', id] as const,
};

export function useProfessionalsQuery(filter: DirectoryFilter) {
  // Search matches specialty labels, which differ per language — so the
  // language is part of the cache key, and the use case is told explicitly
  // rather than reading a global (docs/architecture-review.md §6.5).
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  return useQuery({
    queryKey: professionalQueryKeys.directory(filter, i18n.language),
    queryFn: () => professionalService.listProfessionals(filter, isArabic),
  });
}

export function useProfessionalQuery(id: string | undefined) {
  return useQuery({
    queryKey: professionalQueryKeys.professional(id ?? ''),
    queryFn: () => professionalService.getProfessionalById(id as string),
    enabled: Boolean(id),
  });
}

export function useAvailabilityQuery(professionalId: string | undefined, isoDate: string) {
  return useQuery({
    queryKey: professionalQueryKeys.availability(professionalId ?? '', isoDate),
    queryFn: () => professionalService.getAvailability(professionalId as string, isoDate),
    enabled: Boolean(professionalId && isoDate),
  });
}

export function useAppointmentsQuery() {
  return useQuery({
    queryKey: professionalQueryKeys.appointments(),
    queryFn: () => professionalService.listAppointments(),
  });
}

export function useAppointmentQuery(id: string | undefined) {
  return useQuery({
    queryKey: professionalQueryKeys.appointment(id ?? ''),
    queryFn: () => professionalService.getAppointment(id as string),
    enabled: Boolean(id),
  });
}

export function useBookAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingInput) => professionalService.book(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: professionalQueryKeys.all }),
  });
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, startsAt }: { id: string; startsAt: string }) => professionalService.reschedule(id, startsAt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: professionalQueryKeys.all }),
  });
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => professionalService.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: professionalQueryKeys.all }),
  });
}
