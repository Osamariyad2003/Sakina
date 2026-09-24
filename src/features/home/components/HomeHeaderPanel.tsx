import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText, Avatar } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useAuthStore } from '../../../core/auth/authStore';
import { useTodayMoodQuery } from '../../mood/state/useMoodQueries';
import { moodLevels } from '../../mood/models/moodContent';
import { useTrackerSignalsQuery } from '../state/useHomeQueries';

interface HomeHeaderPanelProps {
  unreadCount: number;
  showBell: boolean;
  onOpenNotifications: () => void;
  onOpenSearch: () => void;
}

/**
 * Structure: the reference Home's header block — one tinted, bottom-rounded
 * panel holding the date row, greeting with status chips and the search
 * field, so the top of the screen reads as a single surface instead of
 * separate rows on the page background.
 *
 * Styling is ours: the panel takes `brand.primaryDark` in light mode and the
 * raised `background.surface` in dark mode (where `primaryDark` is a *light*
 * sage and would invert the contrast), and every child colour derives from
 * that choice rather than from the reference's browns.
 */
export function HomeHeaderPanel({ unreadCount, showBell, onOpenNotifications, onOpenSearch }: HomeHeaderPanelProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const isLight = theme.scheme === 'light';

  const user = useAuthStore((s) => s.user);
  const todayMoodQuery = useTodayMoodQuery();
  const trackersQuery = useTrackerSignalsQuery();
  const todayOption = todayMoodQuery.data ? moodLevels.find((m) => m.level === todayMoodQuery.data!.mood) : null;
  const streak = trackersQuery.data?.find((s) => s.key === 'moodStreak')?.value ?? 0;

  const panelBg = isLight ? theme.colors.brand.primaryDark : theme.colors.background.surface;
  const onPanel = isLight ? theme.colors.text.onBrand : theme.colors.text.primary;
  const onPanelMuted = isLight ? theme.colors.brand.accentSoft : theme.colors.text.secondary;
  // Chips and the search field sit on the panel, so they need their own
  // slightly-lifted fill rather than the page's surface colour.
  const chipBg = isLight ? 'rgba(255,255,255,0.14)' : theme.colors.background.primary;

  const today = new Date().toLocaleDateString(isArabic ? 'ar' : 'en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View
      style={{
        backgroundColor: panelBg,
        borderBottomStartRadius: theme.radius.xl,
        borderBottomEndRadius: theme.radius.xl,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xxs,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xxs,
            borderRadius: theme.radius.pill,
            backgroundColor: chipBg,
          }}
        >
          <Ionicons name="calendar-outline" size={14} color={onPanelMuted} />
          <AppText variant="caption" color={onPanel}>
            {today}
          </AppText>
        </View>
        <View style={{ flex: 1 }} />
        {showBell ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              unreadCount > 0 ? t('notifications.unreadLabel', { count: unreadCount }) : t('notifications.title')
            }
            onPress={onOpenNotifications}
            style={{
              width: theme.sizes.touchTarget,
              height: theme.sizes.touchTarget,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="notifications-outline" size={24} color={onPanel} />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  end: 4,
                  minWidth: 16,
                  height: 16,
                  paddingHorizontal: 4,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.status.error,
                }}
              >
                <AppText variant="caption" color={theme.colors.text.onBrand}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Avatar initials={user?.displayName ?? '?'} size={44} />
        <View style={{ flex: 1 }}>
          <AppText variant="titleLg" color={onPanel}>
            {t('home.greetingMorning')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.xxs }}>
            {todayOption ? (
              <HeaderChip
                background={chipBg}
                color={onPanel}
                label={`${todayOption.emoji} ${isArabic ? todayOption.labelAr : todayOption.labelEn}`}
              />
            ) : null}
            {streak >= 2 ? (
              <HeaderChip background={chipBg} color={onPanel} label={t('home.streakChip', { count: streak })} />
            ) : null}
          </View>
        </View>
      </View>

      {/* Opens the real Search screen — the field itself is never editable here. */}
      <Pressable
        onPress={onOpenSearch}
        accessibilityRole="search"
        accessibilityLabel={t('home.searchPlaceholder')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          minHeight: theme.sizes.touchTarget,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.pill,
          backgroundColor: chipBg,
        }}
      >
        <Ionicons name="search-outline" size={18} color={onPanelMuted} />
        <AppText variant="body" color={onPanelMuted} style={{ flex: 1 }}>
          {t('home.searchPlaceholder')}
        </AppText>
      </Pressable>
    </View>
  );
}

function HeaderChip({ label, background, color }: { label: string; background: string; color: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: theme.radius.pill,
        backgroundColor: background,
      }}
    >
      <AppText variant="caption" color={color}>
        {label}
      </AppText>
    </View>
  );
}
