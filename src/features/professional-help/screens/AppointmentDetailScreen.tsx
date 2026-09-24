import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Badge, Button, BottomSheet, LoadingState, ErrorState, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { statusTone } from '../components/AppointmentCard';
import { useAppointmentFormat } from '../components/useAppointmentFormat';
import { useAppointmentQuery, useCancelAppointmentMutation } from '../state/useProfessionalQueries';
import { getProfessional, sessionModeMeta } from '../models/professionalContent';
import type { HomeStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<HomeStackParamList, 'AppointmentDetail'>;

/**
 * One appointment: who, when, how, and the two actions that exist —
 * reschedule (reuses the booking screen) and cancel. Cancelling asks for
 * confirmation in a sheet rather than firing on the first tap, because it
 * can't be undone from the app.
 */
export function AppointmentDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();
  const cancelSheet = useRef<GorhomBottomSheet>(null);
  const { formatDateTime } = useAppointmentFormat();

  const query = useAppointmentQuery(route.params.appointmentId);
  const cancelMutation = useCancelAppointmentMutation();

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState
          message={query.error ? errorText(query.error, t) : t('professionals.appointmentNotFound')}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const appointment = query.data;
  const professional = getProfessional(appointment.professionalId);
  const mode = sessionModeMeta[appointment.mode];
  const isActive = appointment.status !== 'cancelled' && appointment.status !== 'completed';

  const confirmCancel = () => {
    cancelMutation.mutate(appointment.id, {
      onSuccess: () => {
        cancelSheet.current?.close();
        toast.show({ message: t('professionals.cancelled'), tone: 'success' });
      },
      onError: (error) => toast.show({ message: errorText(error, t), tone: 'error' }),
    });
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('professionals.appointmentDetailTitle')}</AppText>

        <Card style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="titleMd" style={{ flex: 1 }}>
              {professional?.fullName ?? t('professionals.unknownProfessional')}
            </AppText>
            <Badge label={t(`professionals.status.${appointment.status}`)} tone={statusTone(appointment.status)} />
          </View>
          {professional ? (
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {isArabic ? professional.titleAr : professional.titleEn}
            </AppText>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.brand.primary} />
            <AppText variant="body">{formatDateTime(appointment.startsAt)}</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name={mode.icon} size={18} color={theme.colors.brand.primary} />
            <AppText variant="body">
              {isArabic ? mode.labelAr : mode.labelEn} · {t('professionals.durationMinutes', { count: appointment.durationMinutes })}
            </AppText>
          </View>
        </Card>

        {appointment.reason ? (
          <Card>
            <AppText variant="titleMd">{t('professionals.reasonTitle')}</AppText>
            <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
              {appointment.reason}
            </AppText>
          </Card>
        ) : null}

        {appointment.status === 'pending' ? (
          <Card>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('professionals.pendingExplainer')}
            </AppText>
          </Card>
        ) : null}

        {isActive ? (
          <View style={{ gap: theme.spacing.xs }}>
            <Button
              label={t('professionals.reschedule')}
              variant="secondary"
              onPress={() =>
                navigation.navigate('BookAppointment', {
                  professionalId: appointment.professionalId,
                  rescheduleAppointmentId: appointment.id,
                })
              }
            />
            <Button label={t('professionals.cancel')} variant="destructive" onPress={() => cancelSheet.current?.expand()} />
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet ref={cancelSheet} snapPoints={['32%']}>
        <AppText variant="titleMd">{t('professionals.cancelConfirmTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xs }}>
          {t('professionals.cancelConfirmBody')}
        </AppText>
        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
          <Button
            label={t('professionals.cancelConfirmAction')}
            variant="destructive"
            loading={cancelMutation.isPending}
            onPress={confirmCancel}
          />
          <Button label={t('common.cancel')} variant="ghost" onPress={() => cancelSheet.current?.close()} />
        </View>
      </BottomSheet>
    </Screen>
  );
}
