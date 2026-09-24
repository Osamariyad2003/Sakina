import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useStressTrendQuery } from '../../wellness/stress-management/state/useStressCheckInQueries';
import { MoodChart } from '../../mood/components/MoodChart';
import { errorText } from '../../../core/errors';

/**
 * Stress's Home summary — deliberately identical card shape/chart to
 * `MoodSummaryCard` (Feature 6/2's "keep the two visually consistent"),
 * just charted 1-3 instead of 1-5 and keyed to `accent.stress` instead of
 * `accent.mood`.
 */
export function StressSummaryCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useStressTrendQuery(7);

  return (
    <Card
      // Tinted block per the reference carousel. Sakina's accents are soft
      // pastels, so body text keeps its normal dark colour on top.
      style={{ width: 280, minHeight: 150, backgroundColor: theme.colors.accent.stress }}
      elevation="md"
    >
      <AppText variant="label" color={theme.colors.text.secondary}>
        {t('home.stressSummaryCardTitle')}
      </AppText>
      <View style={{ marginTop: theme.spacing.xs }}>
        {query.isLoading ? (
          <SkeletonList rows={2} rowHeight={16} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : query.data ? (
          <MoodChart points={query.data} height={90} maxValue={3} />
        ) : null}
      </View>
    </Card>
  );
}
