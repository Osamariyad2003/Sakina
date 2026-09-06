import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface HomeSectionHeaderProps {
  title: string;
  /** Omit for sections that have nowhere further to go. */
  onSeeAll?: () => void;
}

/**
 * The "Section title … See All" row the reference Home uses to separate its
 * blocks. Factored out so every Home section gets the same heading treatment
 * and the same 44pt tap target on the See-All affordance.
 */
export function HomeSectionHeader({ title, onSeeAll }: HomeSectionHeaderProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <AppText variant="titleLg" style={{ flex: 1 }}>
        {title}
      </AppText>
      {onSeeAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.seeAll')}
          onPress={onSeeAll}
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, minHeight: theme.sizes.touchTarget, paddingStart: theme.spacing.xs }}
        >
          <AppText variant="label" color={theme.colors.brand.primaryDark}>
            {t('home.seeAll')}
          </AppText>
          <Ionicons
            name={isArabic ? 'chevron-back' : 'chevron-forward'}
            size={16}
            color={theme.colors.brand.primaryDark}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
