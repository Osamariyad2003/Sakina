import React, { useRef, useState } from 'react';
import { View, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Chip, BottomSheet, LoadingState, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import {
  useReminderPreferencesQuery,
  useSetReminderMutation,
  useSetQuietHoursMutation,
} from '../state/useNotificationQueries';
import { notificationScheduler } from '../services/notificationScheduler';
import { reminderMeta, timeOptions, type ReminderKind } from '../models/notificationContent';
import type { AppError } from '../../../core/errors';

/**
 * Reminder preferences. Every reminder is opt-in and quiet hours win over
 * every individual time — and when a reminder the user enabled falls inside
 * quiet hours, the screen says so instead of silently swallowing it.
 */
export function ReminderSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useReminderPreferencesQuery();
  const setReminder = useSetReminderMutation();
  const setQuietHours = useSetQuietHoursMutation();

  const timeSheet = useRef<GorhomBottomSheet>(null);
  const [editing, setEditing] = useState<{ kind: ReminderKind | 'quietFrom' | 'quietTo' } | null>(null);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState message={(query.error as AppError)?.message ?? t('errors.unknown')} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const preferences = query.data;
  const suppressed = new Set(notificationScheduler.suppressedByQuietHours(preferences).map((r) => r.kind));

  const pickTime = (time: string) => {
    if (!editing) return;
    if (editing.kind === 'quietFrom') {
      setQuietHours.mutate({ ...preferences.quietHours, from: time });
    } else if (editing.kind === 'quietTo') {
      setQuietHours.mutate({ ...preferences.quietHours, to: time });
    } else {
      setReminder.mutate({ kind: editing.kind, patch: { time } });
    }
    timeSheet.current?.close();
    setEditing(null);
  };

  const openTimePicker = (kind: ReminderKind | 'quietFrom' | 'quietTo') => {
    setEditing({ kind });
    timeSheet.current?.expand();
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('notifications.settingsTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('notifications.settingsIntro')}
        </AppText>

        {preferences.reminders.map((reminder) => (
          <Card key={reminder.kind} style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name={reminderMeta[reminder.kind].icon} size={22} color={theme.colors.brand.primary} />
              <View style={{ flex: 1 }}>
                <AppText variant="titleMd">{t(`notifications.reminder.${reminder.kind}Title`)}</AppText>
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {t(`notifications.reminder.${reminder.kind}Body`)}
                </AppText>
              </View>
              <Switch
                value={reminder.enabled}
                onValueChange={(enabled) => setReminder.mutate({ kind: reminder.kind, patch: { enabled } })}
                trackColor={{ true: theme.colors.brand.primary }}
                accessibilityLabel={t(`notifications.reminder.${reminder.kind}Title`)}
              />
            </View>

            {reminder.enabled && reminder.kind !== 'appointment' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Chip label={reminder.time} onPress={() => openTimePicker(reminder.kind)} />
                {suppressed.has(reminder.kind) ? (
                  <AppText variant="caption" color={theme.colors.status.warning} style={{ flex: 1 }}>
                    {t('notifications.suppressedByQuietHours')}
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </Card>
        ))}

        <Card style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="moon-outline" size={22} color={theme.colors.accent.sleep} />
            <View style={{ flex: 1 }}>
              <AppText variant="titleMd">{t('notifications.quietHoursTitle')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('notifications.quietHoursBody')}
              </AppText>
            </View>
            <Switch
              value={preferences.quietHours.enabled}
              onValueChange={(enabled) => setQuietHours.mutate({ ...preferences.quietHours, enabled })}
              trackColor={{ true: theme.colors.brand.primary }}
              accessibilityLabel={t('notifications.quietHoursTitle')}
            />
          </View>
          {preferences.quietHours.enabled ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('notifications.quietFrom')}
              </AppText>
              <Chip label={preferences.quietHours.from} onPress={() => openTimePicker('quietFrom')} />
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('notifications.quietTo')}
              </AppText>
              <Chip label={preferences.quietHours.to} onPress={() => openTimePicker('quietTo')} />
            </View>
          ) : null}
        </Card>

        {/* Honest about the current limit rather than implying background delivery. */}
        <Card style={{ borderTopWidth: 3, borderTopColor: theme.colors.status.info }}>
          <AppText variant="titleMd">{t('notifications.deliveryNoticeTitle')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('notifications.deliveryNoticeBody')}
          </AppText>
        </Card>
      </ScrollView>

      <BottomSheet ref={timeSheet} snapPoints={['55%']}>
        <AppText variant="titleMd">{t('notifications.pickTime')}</AppText>
        <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, paddingVertical: theme.spacing.md }}>
          {timeOptions().map((time) => (
            <Chip key={time} label={time} onPress={() => pickTime(time)} />
          ))}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}
