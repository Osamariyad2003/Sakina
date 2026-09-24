import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, AppText, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useMoodTrendQuery } from '../../mood/state/useMoodQueries';
import { MoodChart } from '../../mood/components/MoodChart';
import { errorText } from '../../../core/errors';

/**
 * Structure: reference's mood card with a mini bar chart — reuses the
 * existing Mood-module `MoodChart` at a compact height rather than a new
 * chart implementation (same RTL-aware, token-styled component already
 * used on Mood History).
 * Styling: theme.spacing/theme.colors + our extended `accent.mood` token
 * ("Botanical & warm," confirmed with the product owner) +
 * Card/AppText/SkeletonList/ErrorState + the existing MoodChart — no
 * reference values.
 */
export function MoodSummaryCard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useMoodTrendQuery(7);

  return (
    <Card
      // Tinted block per the reference carousel. Sakina's accents are soft
      // pastels, so body text keeps its normal dark colour on top.
      style={{ width: 280, minHeight: 150, backgroundColor: theme.colors.accent.mood }}
      elevation="md"
    >
      <AppText variant="label" color={theme.colors.text.secondary}>
        {t('home.moodSummaryCardTitle')}
      </AppText>
      <View style={{ marginTop: theme.spacing.xs }}>
        {query.isLoading ? (
          <SkeletonList rows={2} rowHeight={16} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : query.data ? (
          <MoodChart points={query.data} height={90} />
        ) : null}
      </View>
    </Card>
  );
}
