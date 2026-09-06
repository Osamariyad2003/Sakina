import React, { useMemo, useState } from 'react';
import { View, ScrollView, Switch } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Chip, Button, SegmentedControl, SkeletonList } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { MoodHistoryCard } from '../components/MoodHistoryCard';
import { useMoodHistoryQuery } from '../state/useMoodQueries';
import { moodLevels } from '../models/moodContent';
import type { MoodLevel } from '../../../types/models';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodFilter'>;

type Range = 'week' | 'month' | 'all';

/**
 * Filter mood — mood types + time range + "only improvements", applied live
 * over the history with a matching-count CTA and the resulting list inline
 * (self-contained; no global filter state needed). Structure follows the SH
 * Freud filter frame; styling is 100% Sakina tokens/primitives.
 */
export function MoodFilterScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const historyQuery = useMoodHistoryQuery();

  const [selectedMoods, setSelectedMoods] = useState<MoodLevel[]>([]);
  const [range, setRange] = useState<Range>('week');
  const [improvingOnly, setImprovingOnly] = useState(false);

  const entries = historyQuery.data ?? [];

  const filtered = useMemo(() => {
    const now = Date.now();
    const windowMs = range === 'week' ? 7 : range === 'month' ? 30 : Infinity;
    const weightOf = (m: MoodLevel) => moodLevels.findIndex((o) => o.level === m);
    return entries.filter((e, i) => {
      if (selectedMoods.length > 0 && !selectedMoods.includes(e.mood)) return false;
      if (windowMs !== Infinity && now - new Date(e.createdAt).getTime() > windowMs * 86400000) return false;
      if (improvingOnly) {
        const prev = entries[i + 1]; // next in the newest-first list = the older one
        if (!prev || weightOf(e.mood) <= weightOf(prev.mood)) return false;
      }
      return true;
    });
  }, [entries, selectedMoods, range, improvingOnly]);

  const toggleMood = (level: MoodLevel) =>
    setSelectedMoods((list) => (list.includes(level) ? list.filter((m) => m !== level) : [...list, level]));

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('mood.filterTitle')}</AppText>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('mood.filterMoodType')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {moodLevels.map((m) => (
              <Chip
                key={m.level}
                label={`${m.emoji} ${isArabic ? m.labelAr : m.labelEn}`}
                selected={selectedMoods.includes(m.level)}
                onPress={() => toggleMood(m.level)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('mood.filterRange')}</AppText>
          <SegmentedControl
            segments={[
              { key: 'week', label: t('mood.rangeWeek') },
              { key: 'month', label: t('mood.rangeMonth') },
              { key: 'all', label: t('mood.rangeAll') },
            ]}
            value={range}
            onChange={(k) => setRange(k as Range)}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="body">{t('mood.showImprovement')}</AppText>
          <Switch
            value={improvingOnly}
            onValueChange={setImprovingOnly}
            trackColor={{ true: theme.colors.brand.primary, false: theme.colors.border.default }}
            thumbColor={theme.colors.background.surface}
          />
        </View>

        <Button label={t('mood.filterCta', { count: filtered.length })} onPress={() => {}} />

        {historyQuery.isLoading ? (
          <SkeletonList rows={3} />
        ) : (
          filtered.map((entry) => (
            <MoodHistoryCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('MoodDetail', { entryId: entry.id })}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
