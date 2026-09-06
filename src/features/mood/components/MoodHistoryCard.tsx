import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodLevels, emotionCatalog } from '../models/moodContent';
import { moodColor } from './moodColors';
import type { MoodEntry } from '../../../types/models';

interface MoodHistoryCardProps {
  entry: MoodEntry;
  onPress?: () => void;
}

export function MoodHistoryCard({ entry, onPress }: MoodHistoryCardProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const moodOption = moodLevels.find((m) => m.level === entry.mood);
  const emotions = entry.emotionIds
    .map((id) => emotionCatalog.find((e) => e.id === id))
    .filter((e): e is (typeof emotionCatalog)[number] => Boolean(e));

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
            backgroundColor: entry.mood ? moodColor(theme, entry.mood) : theme.colors.border.subtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 22 }}>{moodOption?.emoji}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="titleMd">{isArabic ? moodOption?.labelAr : moodOption?.labelEn}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {dateLabel} · {timeLabel}
          </AppText>
        </View>
      </View>

      {emotions.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.xs }}>
          {emotions.map((emotion) => (
            <Badge key={emotion.id} label={`${emotion.emoji} ${isArabic ? emotion.labelAr : emotion.labelEn}`} />
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
