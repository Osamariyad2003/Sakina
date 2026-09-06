import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { getProfessional, sessionModeMeta } from '../models/professionalContent';
import { useAppointmentFormat } from './useAppointmentFormat';
import type { Appointment, AppointmentStatus } from '../../../types/models';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

export function statusTone(status: AppointmentStatus): 'neutral' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'neutral';
  }
}

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { formatDateTime } = useAppointmentFormat();
  const professional = getProfessional(appointment.professionalId);
  const mode = sessionModeMeta[appointment.mode];

  return (
    <Card onPress={onPress} style={{ gap: theme.spacing.xxs, opacity: appointment.status === 'cancelled' ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="titleMd" style={{ flex: 1 }}>
          {professional?.fullName ?? t('professionals.unknownProfessional')}
        </AppText>
        <Badge label={t(`professionals.status.${appointment.status}`)} tone={statusTone(appointment.status)} />
      </View>
      <AppText variant="body" color={theme.colors.text.secondary}>
        {formatDateTime(appointment.startsAt)}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Ionicons name={mode.icon} size={14} color={theme.colors.text.secondary} />
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {isArabic ? mode.labelAr : mode.labelEn} · {t('professionals.durationMinutes', { count: appointment.durationMinutes })}
        </AppText>
      </View>
    </Card>
  );
}
