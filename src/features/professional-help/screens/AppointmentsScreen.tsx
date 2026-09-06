import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, SegmentedControl, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AppointmentCard } from '../components/AppointmentCard';
import { useAppointmentsQuery } from '../state/useProfessionalQueries';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Appointments'>;

type Filter = 'upcoming' | 'past';

/** Upcoming / past split, matching the reference's two-tab appointments list. */
export function AppointmentsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const query = useAppointmentsQuery();

  const appointments = useMemo(() => {
    const all = query.data ?? [];
    const now = Date.now();
    if (filter === 'upcoming') {
      return all.filter((a) => a.status !== 'cancelled' && new Date(a.startsAt).getTime() >= now);
    }
    return all
      .filter((a) => a.status === 'cancelled' || new Date(a.startsAt).getTime() < now)
      .sort((a, b) => (a.startsAt < b.startsAt ? 1 : -1));
  }, [query.data, filter]);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="displayMd">{t('professionals.myAppointments')}</AppText>
        <SegmentedControl
          segments={[
            { key: 'upcoming', label: t('professionals.filterUpcoming') },
            { key: 'past', label: t('professionals.filterPast') },
          ]}
          value={filter}
          onChange={(key) => setFilter(key as Filter)}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={3} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : appointments.length === 0 ? (
          <EmptyState
            title={filter === 'upcoming' ? t('professionals.noUpcomingTitle') : t('professionals.noPastTitle')}
            description={filter === 'upcoming' ? t('professionals.noUpcomingBody') : undefined}
            actionLabel={filter === 'upcoming' ? t('professionals.findTherapist') : undefined}
            onAction={filter === 'upcoming' ? () => navigation.navigate('TherapistDirectory') : undefined}
          />
        ) : (
          <FlashList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <AppointmentCard
                  appointment={item}
                  onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
                />
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
