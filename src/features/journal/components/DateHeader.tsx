import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface DateHeaderProps {
  isoDate: string; // YYYY-MM-DD
}

export function DateHeader({ isoDate }: DateHeaderProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const label = new Date(isoDate).toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
      <AppText variant="label" color={theme.colors.text.secondary}>
        {label}
      </AppText>
    </View>
  );
}
