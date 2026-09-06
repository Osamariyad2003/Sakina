import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { NotificationRow } from '../components/NotificationRow';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearNotificationsMutation,
} from '../state/useNotificationQueries';
import type { NotificationTarget } from '../models/notificationContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Notifications'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * The inbox. Every entry is app-generated from the user's own data (see
 * notificationService.refresh) — there is no push channel, so nothing here
 * can arrive from outside.
 */
export function NotificationsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useNotificationsQuery();
  const markRead = useMarkNotificationReadMutation();
  const markAllRead = useMarkAllNotificationsReadMutation();
  const clearAll = useClearNotificationsMutation();

  const notifications = query.data ?? [];
  const hasUnread = notifications.some((n) => !n.readAt);

  /**
   * Targets are a closed union (not stored route names), so a stored inbox
   * entry can never navigate somewhere the app didn't intend.
   */
  const openTarget = (target: NotificationTarget | undefined) => {
    if (!target) return;
    switch (target.kind) {
      case 'moodCheckIn':
        navigation.navigate('MoodTab', { screen: 'MoodCheckIn' });
        return;
      case 'journal':
        navigation.navigate('JournalTab', { screen: 'JournalList' });
        return;
      case 'wellness':
        navigation.navigate('WellnessTab', { screen: 'WellnessHome' });
        return;
      case 'appointments':
        navigation.navigate('Appointments');
        return;
      case 'appointment':
        navigation.navigate('AppointmentDetail', { appointmentId: target.appointmentId });
        return;
      case 'community':
        navigation.navigate('Community');
        return;
      case 'badges':
        navigation.navigate('ProfileTab', { screen: 'Badges' });
        return;
      case 'safety':
        navigation.navigate('ProfileTab', { screen: 'Safety' });
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd" style={{ flex: 1 }}>
            {t('notifications.title')}
          </AppText>
          <Button label={t('notifications.settings')} size="md" variant="secondary" onPress={() => navigation.navigate('ReminderSettings')} />
        </View>
        {notifications.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {hasUnread ? (
              <Button label={t('notifications.markAllRead')} size="md" variant="ghost" onPress={() => markAllRead.mutate()} />
            ) : null}
            <Button label={t('notifications.clearAll')} size="md" variant="ghost" onPress={() => clearAll.mutate()} />
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title={t('notifications.emptyTitle')}
            description={t('notifications.emptyBody')}
            actionLabel={t('notifications.settings')}
            onAction={() => navigation.navigate('ReminderSettings')}
          />
        ) : (
          <FlashList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <NotificationRow
                  notification={item}
                  onPress={() => {
                    markRead.mutate(item.id);
                    openTarget(item.target);
                  }}
                />
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
