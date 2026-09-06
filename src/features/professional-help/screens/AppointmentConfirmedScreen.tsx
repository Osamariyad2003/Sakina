import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, LoadingState, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AppointmentCard } from '../components/AppointmentCard';
import { useAppointmentQuery } from '../state/useProfessionalQueries';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'AppointmentConfirmed'>;

/**
 * Post-booking confirmation. Says "request sent", never "confirmed" — the
 * appointment is `pending` until a real provider accepts it, and the copy
 * has to match the data or the user will show up to a session nobody
 * agreed to.
 */
export function AppointmentConfirmedScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useAppointmentQuery(route.params.appointmentId);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState
          message={(query.error as AppError)?.message ?? t('professionals.appointmentNotFound')}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ alignItems: 'center', gap: theme.spacing.sm, paddingTop: theme.spacing.xl }}>
          <Ionicons name="checkmark-circle-outline" size={64} color={theme.colors.status.success} />
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('professionals.requestSentTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('professionals.requestSentBody')}
          </AppText>
        </View>

        <AppointmentCard appointment={query.data} />

        <Card>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('professionals.pendingExplainer')}
          </AppText>
        </Card>

        <Button label={t('professionals.myAppointments')} onPress={() => navigation.replace('Appointments')} />
        <Button label={t('common.done')} variant="ghost" onPress={() => navigation.navigate('Home')} />
      </ScrollView>
    </Screen>
  );
}
