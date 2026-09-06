import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { BadgeProgress } from '../models/badgeContent';

interface BadgeTileProps {
  progress: BadgeProgress;
  onPress: () => void;
}

/**
 * A locked badge shows the same icon at low opacity plus a progress bar,
 * rather than a padlock or a silhouette — the point is "here is how far you
 * are", not "here is what you failed to get".
 */
export function BadgeTile({ progress, onPress }: BadgeTileProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const { definition, earned, ratio, current } = progress;
  const accent = theme.colors.accent[definition.accent];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: earned }}
      accessibilityLabel={`${isArabic ? definition.titleAr : definition.titleEn} — ${
        earned ? t('badges.earned') : t('badges.progressLabel', { current, total: definition.threshold })
      }`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: '46%',
        gap: theme.spacing.xs,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.background.surface,
        borderWidth: 1,
        borderColor: earned ? accent : theme.colors.border.subtle,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: earned ? accent : theme.colors.border.subtle,
        }}
      >
        <Ionicons
          name={definition.icon}
          size={24}
          color={earned ? theme.colors.text.onBrand : theme.colors.text.secondary}
        />
      </View>

      <AppText variant="label" numberOfLines={2}>
        {isArabic ? definition.titleAr : definition.titleEn}
      </AppText>

      {earned ? (
        <AppText variant="caption" color={accent}>
          {t('badges.earned')}
        </AppText>
      ) : (
        <View style={{ gap: theme.spacing.xxs }}>
          <View style={{ height: 4, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.subtle }}>
            <View
              style={{
                width: `${Math.round(ratio * 100)}%`,
                height: 4,
                borderRadius: theme.radius.pill,
                backgroundColor: accent,
              }}
            />
          </View>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('badges.progressLabel', { current, total: definition.threshold })}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
