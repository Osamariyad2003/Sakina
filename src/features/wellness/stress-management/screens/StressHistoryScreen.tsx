import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { MoodChart } from '../../../mood/components/MoodChart';
import { StressHistoryCard } from '../components/StressHistoryCard';
import { useStressHistoryQuery, useStressTrendQuery } from '../state/useStressCheckInQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'StressHistory'>;

/**
 * Stress history/overview — a 7-day trend chart (the same `MoodChart`
 * component Mood uses, just charted 1-3 instead of 1-5) plus the recent
 * check-ins list. Combines what Mood splits across Overview/History into
 * one screen, per Feature 2's brief ("history/overview screen").
 */
export function StressHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const historyQuery = useStressHistoryQuery();
  const trendQuery = useStressTrendQuery(7);
  const entries = historyQuery.data ?? [];

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd">{t('stressCheckIn.historyTitle')}</AppText>
          <Button label={t('stressCheckIn.newCheckIn')} size="md" variant="ghost" onPress={() => navigation.navigate('StressCheckIn')} />
        </View>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('stressCheckIn.totalCheckIns', { count: entries.length })}
        </AppText>

        <Card>
          <AppText variant="titleMd" style={{ marginBottom: theme.spacing.xs }}>
            {t('stressCheckIn.trendTitle')}
          </AppText>
          {trendQuery.isLoading ? (
            <SkeletonList rows={1} rowHeight={140} />
          ) : trendQuery.isError ? (
            <ErrorState message={errorText(trendQuery.error, t)} onRetry={() => trendQuery.refetch()} />
          ) : (
            <MoodChart points={trendQuery.data ?? []} maxValue={3} />
          )}
        </Card>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
        {historyQuery.isLoading ? (
          <SkeletonList rows={5} />
        ) : historyQuery.isError ? (
          <ErrorState message={errorText(historyQuery.error, t)} onRetry={() => historyQuery.refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState
            title={t('stressCheckIn.emptyTitle')}
            description={t('stressCheckIn.emptyBody')}
            actionLabel={t('stressCheckIn.newCheckIn')}
            onAction={() => navigation.navigate('StressCheckIn')}
          />
        ) : (
          <>
            <AppText variant="titleMd" style={{ marginBottom: theme.spacing.sm }}>
              {t('stressCheckIn.recentTitle')}
            </AppText>
            <FlashList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ marginBottom: theme.spacing.sm }}>
                  <StressHistoryCard entry={item} onPress={() => navigation.navigate('StressDetail', { entryId: item.id })} />
                </View>
              )}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
