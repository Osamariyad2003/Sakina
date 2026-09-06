import React from 'react';
import { View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodColor } from '../../mood/components/moodColors';
import { moodLevels } from '../../mood/models/moodContent';
import type { MoodLevel } from '../../../types/models';

interface MoodCheckInRowProps {
  /** Today's already-logged mood, if there is one. */
  todayMood?: MoodLevel | null;
  onSelect: (mood: MoodLevel) => void;
}

/**
 * The reference Home's inline "How are you feeling today?" row.
 *
 * Tapping an emoji does not silently log it — it opens the full check-in with
 * that mood pre-selected, so the user still confirms and can add context. A
 * one-tap silent log would make it far too easy to record a mood by accident,
 * and the whole point of the history is that the user trusts it.
 *
 * When today is already logged the row shows that instead, and tapping still
 * opens the flow so it can be corrected.
 */
export function MoodCheckInRow({ todayMood, onSelect }: MoodCheckInRowProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const logged = todayMood ? moodLevels.find((m) => m.level === todayMood) : null;

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <AppText variant="titleMd" style={{ textAlign: 'center' }}>
        {logged
          ? t('home.checkInLoggedTitle', { mood: isArabic ? logged.labelAr : logged.labelEn })
          : t('home.checkInPrompt')}
      </AppText>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {moodLevels.map((option) => {
          const selected = option.level === todayMood;
          return (
            <Pressable
              key={option.level}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={isArabic ? option.labelAr : option.labelEn}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onSelect(option.level);
              }}
              style={({ pressed }) => ({
                width: theme.sizes.touchTarget,
                height: theme.sizes.touchTarget,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: selected ? 2 : 0,
                borderColor: moodColor(theme, option.level),
                backgroundColor: selected ? theme.colors.background.primary : 'transparent',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <AppText variant="titleLg">{option.emoji}</AppText>
            </Pressable>
          );
        })}
      </View>
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
        {t('home.checkInSubtitle')}
      </AppText>
    </Card>
  );
}
