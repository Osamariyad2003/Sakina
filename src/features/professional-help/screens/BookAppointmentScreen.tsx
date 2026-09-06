import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Chip, Button, TextArea, LoadingState, ErrorState, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { SlotPicker } from '../components/SlotPicker';
import { useAppointmentFormat } from '../components/useAppointmentFormat';
import {
  useProfessionalQuery,
  useAvailabilityQuery,
  useBookAppointmentMutation,
  useRescheduleAppointmentMutation,
} from '../state/useProfessionalQueries';
import { bookingDateKeys, sessionModeMeta } from '../models/professionalContent';
import type { AppError } from '../../../core/errors';
import type { SessionMode } from '../../../types/models';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookAppointment'>;

/**
 * Booking flow on a single screen: pick a day, a session type, a slot, and
 * optionally say what you'd like to talk about. One screen rather than a
 * wizard because there are only three required choices and the reference's
 * multi-step flow adds friction without adding clarity.
 *
 * With `rescheduleAppointmentId` the same screen moves an existing booking
 * instead of creating a second one.
 */
export function BookAppointmentScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();
  const { formatDateShort } = useAppointmentFormat();

  const { professionalId, rescheduleAppointmentId } = route.params;
  const isReschedule = Boolean(rescheduleAppointmentId);

  const dates = useMemo(() => bookingDateKeys(), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [reason, setReason] = useState('');

  const professionalQuery = useProfessionalQuery(professionalId);
  const availabilityQuery = useAvailabilityQuery(professionalId, selectedDate);
  const bookMutation = useBookAppointmentMutation();
  const rescheduleMutation = useRescheduleAppointmentMutation();

  const professional = professionalQuery.data;
  const effectiveMode = mode ?? professional?.sessionModes[0] ?? null;
  const submitting = bookMutation.isPending || rescheduleMutation.isPending;
  const canSubmit = Boolean(selectedSlot && effectiveMode) && !submitting;

  if (professionalQuery.isLoading) return <LoadingState />;
  if (professionalQuery.isError || !professional) {
    return (
      <Screen>
        <ErrorState
          message={(professionalQuery.error as AppError)?.message ?? t('professionals.notFound')}
          onRetry={() => professionalQuery.refetch()}
        />
      </Screen>
    );
  }

  const submit = () => {
    if (!selectedSlot || !effectiveMode) return;
    if (isReschedule && rescheduleAppointmentId) {
      rescheduleMutation.mutate(
        { id: rescheduleAppointmentId, startsAt: selectedSlot },
        {
          onSuccess: (appointment) => {
            toast.show({ message: t('professionals.rescheduled'), tone: 'success' });
            navigation.replace('AppointmentConfirmed', { appointmentId: appointment.id });
          },
          onError: (error) => toast.show({ message: (error as AppError).message, tone: 'error' }),
        },
      );
      return;
    }
    bookMutation.mutate(
      { professionalId, startsAt: selectedSlot, mode: effectiveMode, reason },
      {
        onSuccess: (appointment) => navigation.replace('AppointmentConfirmed', { appointmentId: appointment.id }),
        onError: (error) => toast.show({ message: (error as AppError).message, tone: 'error' }),
      },
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMd">{isReschedule ? t('professionals.rescheduleTitle') : t('professionals.bookTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {professional.fullName} · {isArabic ? professional.titleAr : professional.titleEn}
        </AppText>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('professionals.pickDay')}</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
            {dates.map((date) => {
              const active = date === selectedDate;
              return (
                <Pressable
                  key={date}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  style={{
                    minWidth: 72,
                    minHeight: theme.sizes.touchTarget + theme.spacing.xs,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                    borderWidth: active ? 0 : 1,
                    borderColor: theme.colors.border.default,
                    backgroundColor: active ? theme.colors.brand.primaryDark : theme.colors.background.surface,
                  }}
                >
                  <AppText variant="label" color={active ? theme.colors.text.onBrand : theme.colors.text.primary}>
                    {formatDateShort(date)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {!isReschedule ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="titleMd">{t('professionals.pickMode')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {professional.sessionModes.map((key) => (
                <Chip
                  key={key}
                  label={isArabic ? sessionModeMeta[key].labelAr : sessionModeMeta[key].labelEn}
                  selected={effectiveMode === key}
                  onPress={() => setMode(key)}
                  icon={
                    <Ionicons
                      name={sessionModeMeta[key].icon}
                      size={14}
                      color={effectiveMode === key ? theme.colors.text.onBrand : theme.colors.text.primary}
                    />
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('professionals.pickTime')}</AppText>
          <SlotPicker
            slots={availabilityQuery.data}
            isLoading={availabilityQuery.isLoading}
            error={availabilityQuery.isError ? (availabilityQuery.error as AppError) : null}
            onRetry={() => availabilityQuery.refetch()}
            selected={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </View>

        {!isReschedule ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="titleMd">{t('professionals.reasonTitle')}</AppText>
            <TextArea
              placeholder={t('professionals.reasonPlaceholder')}
              value={reason}
              onChangeText={setReason}
              accessibilityLabel={t('professionals.reasonTitle')}
            />
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('professionals.reasonPrivacyNote')}
            </AppText>
          </View>
        ) : null}

        <Card>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('professionals.pendingExplainer')}
          </AppText>
        </Card>

        <Button
          label={isReschedule ? t('professionals.confirmReschedule') : t('professionals.confirmBooking')}
          disabled={!canSubmit}
          loading={submitting}
          onPress={submit}
        />
      </ScrollView>
    </Screen>
  );
}
