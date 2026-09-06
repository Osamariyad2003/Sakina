import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { getTopic, type ResourceArticle } from '../models/resourceContent';

interface ResourceCardProps {
  article: ResourceArticle;
  onPress: () => void;
  /** Compact variant for the Home carousel — fixed width, summary trimmed to two lines. */
  compact?: boolean;
}

export function ResourceCard({ article, onPress, compact = false }: ResourceCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const topic = getTopic(article.topic);
  const accent = topic ? theme.colors.accent[topic.accent] : theme.colors.brand.primary;

  return (
    <Card
      onPress={onPress}
      elevation={compact ? 'md' : 'sm'}
      style={{
        gap: theme.spacing.xs,
        borderTopWidth: 3,
        borderTopColor: accent,
        ...(compact ? { width: 240 } : null),
      }}
    >
      {topic ? <Badge label={isArabic ? topic.labelAr : topic.labelEn} color={accent} /> : null}
      <AppText variant="titleMd" numberOfLines={compact ? 2 : undefined}>
        {isArabic ? article.titleAr : article.titleEn}
      </AppText>
      <AppText variant="caption" color={theme.colors.text.secondary} numberOfLines={compact ? 2 : undefined}>
        {isArabic ? article.summaryAr : article.summaryEn}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('resources.readMinutes', { count: article.readMinutes })}
        </AppText>
      </View>
    </Card>
  );
}
