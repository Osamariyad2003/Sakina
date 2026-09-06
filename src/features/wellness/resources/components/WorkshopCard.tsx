import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { getTopic, type Workshop } from '../models/resourceContent';

interface WorkshopCardProps {
  workshop: Workshop;
  onPress: () => void;
  registered?: boolean;
}

export function WorkshopCard({ workshop, onPress, registered = false }: WorkshopCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const topic = getTopic(workshop.topic);
  const accent = topic ? theme.colors.accent[topic.accent] : theme.colors.brand.primary;
  const when = new Date(workshop.startsAt).toLocaleString(isArabic ? 'ar-JO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card onPress={onPress} style={{ gap: theme.spacing.xs, borderTopWidth: 3, borderTopColor: accent }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        {topic ? <Badge label={isArabic ? topic.labelAr : topic.labelEn} color={accent} /> : null}
        {registered ? <Badge label={t('resources.registered')} tone="success" /> : null}
      </View>
      <AppText variant="titleMd">{isArabic ? workshop.titleAr : workshop.titleEn}</AppText>
      <AppText variant="caption" color={theme.colors.text.secondary}>
        {isArabic ? workshop.summaryAr : workshop.summaryEn}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Ionicons name="calendar-outline" size={14} color={theme.colors.text.secondary} />
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ flex: 1 }}>
          {when}
        </AppText>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Ionicons name={workshop.online ? 'videocam-outline' : 'location-outline'} size={14} color={theme.colors.text.secondary} />
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {workshop.online ? t('resources.online') : t('resources.inPerson')} ·{' '}
          {t('resources.durationMinutes', { count: workshop.durationMinutes })}
        </AppText>
      </View>
    </Card>
  );
}
