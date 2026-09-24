import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, SegmentedControl, SkeletonList, ErrorState, EmptyState, Card, IconButton, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useMoodHistoryQuery } from '../state/useMoodQueries';
import { MoodHistoryCard } from '../components/MoodHistoryCard';
import { MoodCalendar } from '../components/MoodCalendar';
import type { MoodStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodHistory'>;

/**
 * Mood history — List and Calendar views over all check-ins, with a filter
 * shortcut and a + to add one. Structure follows the SH Freud history frame;
 * styling is 100% Sakina tokens/primitives (calendar/list are RTL-aware).
 */
export function MoodHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [cursor, setCursor] = useState(() => new Date());

  const historyQuery = useMoodHistoryQuery();
  const entries = historyQuery.data ?? [];

  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map((d) => t(`mood.weekdayShort.${d}`));
  const monthLabel = cursor.toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'ar-JO', { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd">{t('mood.historyTitle')}</AppText>
          <Button label={t('mood.filter')} variant="ghost" size="md" onPress={() => navigation.navigate('MoodFilter')} />
        </View>

        <SegmentedControl
          segments={[
            { key: 'list', label: t('mood.listView') },
            { key: 'calendar', label: t('mood.calendarView') },
          ]}
          value={view}
          onChange={(k) => setView(k as 'list' | 'calendar')}
        />

        <AppText variant="label" color={theme.colors.text.secondary}>
          {t('mood.allMoods', { count: entries.length })}
        </AppText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.md }}>
        {historyQuery.isLoading ? (
          <SkeletonList rows={5} />
        ) : historyQuery.isError ? (
          <ErrorState message={errorText(historyQuery.error, t)} onRetry={() => historyQuery.refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState
            title={t('mood.emptyTitle')}
            description={t('mood.emptyBody')}
            icon={<AnimatedLottie source={require('../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
            actionLabel={t('mood.newCheckIn')}
            onAction={() => navigation.navigate('MoodCheckIn')}
          />
        ) : view === 'list' ? (
          <FlashList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <MoodHistoryCard entry={item} onPress={() => navigation.navigate('MoodDetail', { entryId: item.id })} />
              </View>
            )}
          />
        ) : (
          <ScrollView contentContainerStyle={{ gap: theme.spacing.md, paddingBottom: theme.spacing.lg }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                <IconButton
                  accessibilityLabel={t('mood.prevMonth')}
                  icon={<Ionicons name="chevron-back" size={20} color={theme.colors.brand.primary} />}
                  onPress={() => shiftMonth(-1)}
                />
                <AppText variant="titleMd">{monthLabel}</AppText>
                <IconButton
                  accessibilityLabel={t('mood.nextMonth')}
                  icon={<Ionicons name="chevron-forward" size={20} color={theme.colors.brand.primary} />}
                  onPress={() => shiftMonth(1)}
                />
              </View>
              <MoodCalendar
                entries={entries}
                year={cursor.getFullYear()}
                month={cursor.getMonth()}
                weekdayLabels={weekdayLabels}
                onSelectDay={(entryId) => navigation.navigate('MoodDetail', { entryId })}
              />
            </Card>
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}
