import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { JournalEntry } from '../../../types/models';

interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

export function JournalCard({ entry, onPress }: JournalCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const time = new Date(entry.createdAt).toLocaleTimeString(isArabic ? 'ar-JO' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card onPress={onPress}>
      {entry.title ? (
        <AppText variant="titleMd" numberOfLines={1}>
          {entry.title}
        </AppText>
      ) : null}
      <AppText variant="body" color={theme.colors.text.secondary} numberOfLines={2} style={{ marginTop: entry.title ? 2 : 0 }}>
        {entry.content}
      </AppText>
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
        {time}
      </AppText>
    </Card>
  );
}
