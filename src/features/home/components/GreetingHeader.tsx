import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useAuthStore } from '../../../core/auth/authStore';
import { useTodayMoodQuery } from '../../mood/state/useMoodQueries';
import { useTrackerSignalsQuery } from '../state/useHomeQueries';
import { moodLevels } from '../../mood/models/moodContent';

/**
 * Structure: reference's greeting row — avatar + greeting + light status
 * chips (today's logged mood, streak) — replaces the previous plain-text
 * greeting block. Same `Avatar` usage as `ProfileScreen` (initials from
 * `user.displayName`, sliced internally by the primitive).
 * Styling: theme.spacing/theme.colors + our extended `accent.*` tokens
 * ("Botanical & warm" direction, confirmed with the product owner — see
 * ASSUMPTIONS.md) + Avatar/AppText/Badge — no reference values.
 */
export function GreetingHeader() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const user = useAuthStore((s) => s.user);
  const todayMoodQuery = useTodayMoodQuery();
  const trackersQuery = useTrackerSignalsQuery();
  const todayOption = todayMoodQuery.data ? moodLevels.find((m) => m.level === todayMoodQuery.data!.mood) : null;
  const streak = trackersQuery.data?.find((s) => s.key === 'moodStreak')?.value ?? 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <Avatar initials={user?.displayName ?? '?'} size={44} />
      <View style={{ flex: 1 }}>
        <AppText variant="displayLg">{t('home.greetingMorning')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.xxs }}>
          {todayOption ? (
            <Badge
              label={`${todayOption.emoji} ${isArabic ? todayOption.labelAr : todayOption.labelEn}`}
              color={theme.colors.accent.mood}
            />
          ) : null}
          {streak >= 2 ? (
            <Badge label={t('home.streakChip', { count: streak })} color={theme.colors.accent.journaling} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
