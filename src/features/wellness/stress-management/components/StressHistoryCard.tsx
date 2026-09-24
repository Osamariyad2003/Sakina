import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { triggerCatalog } from '../../../mood/models/moodContent';
import { stressLevelOptions } from '../models/stressContent';
import type { StressEntry } from '../../../../types/models';

interface StressHistoryCardProps {
  entry: StressEntry;
  onPress?: () => void;
}

/** Mirrors MoodHistoryCard's layout (icon chip + date + tags + note) for the same at-a-glance recognizability. */
export function StressHistoryCard({ entry, onPress }: StressHistoryCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const levelOption = stressLevelOptions.find((o) => o.level === entry.level);
  const triggers = entry.triggerIds
    .map((id) => triggerCatalog.find((t) => t.id === id))
    .filter((t): t is (typeof triggerCatalog)[number] => Boolean(t));

  const levelColor =
    entry.level === 'high' ? theme.colors.status.error : entry.level === 'medium' ? theme.colors.status.warning : theme.colors.status.success;

  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short' });
  const timeLabel = date.toLocaleTimeString(isArabic ? 'ar-JO' : 'en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.pill,
            backgroundColor: levelColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 16 }} color={theme.colors.text.onBrand}>
            {isArabic ? levelOption?.labelAr.charAt(0) : levelOption?.labelEn.charAt(0)}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="titleMd">{isArabic ? levelOption?.labelAr : levelOption?.labelEn}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {dateLabel} · {timeLabel}
          </AppText>
        </View>
      </View>

      {triggers.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.xs }}>
          {triggers.map((trigger) => (
            <Badge key={trigger.id} label={isArabic ? trigger.labelAr : trigger.labelEn} />
          ))}
        </View>
      ) : null}

      {entry.note ? (
        <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xs }}>
          {entry.note}
        </AppText>
      ) : null}
    </Card>
  );
}
