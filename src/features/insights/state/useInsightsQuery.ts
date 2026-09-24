import { useMemo } from 'react';
import { useMoodHistoryQuery, useMoodTrendQuery } from '../../mood/state/useMoodQueries';
import { useJournalListQuery } from '../../journal/state/useJournalQueries';
import { moodSuggestions } from '../../mood/models/moodContent';
import {
  computeJournalStats,
  computePositivePatterns,
  computeTopEmotions,
  computeTopTriggers,
  computeWeeklyChange,
} from '../services/insightsService';

/**
 * Insights is a *view* over Mood + Journal data (product-definition.md §8:
 * "consumes Mood/Journal data") rather than a data source of its own —
 * hence composing the existing feature queries instead of a dedicated
 * insightsService fetch.
 */
export function useInsightsQuery() {
  const historyQuery = useMoodHistoryQuery();
  const trendQuery = useMoodTrendQuery(7);
  const journalQuery = useJournalListQuery();

  const isLoading = historyQuery.isLoading || trendQuery.isLoading || journalQuery.isLoading;
  const isError = historyQuery.isError || trendQuery.isError || journalQuery.isError;
  const error = historyQuery.error ?? trendQuery.error ?? journalQuery.error;

  const moodEntries = historyQuery.data ?? [];
  const journalEntries = journalQuery.data ?? [];

  const data = useMemo(() => {
    const topEmotions = computeTopEmotions(moodEntries, 5);
    const topTriggers = computeTopTriggers(moodEntries, 5);
    const weeklyChange = computeWeeklyChange(moodEntries);
    const journalStats = computeJournalStats(journalEntries);
    const positivePatterns = computePositivePatterns(moodEntries, journalEntries, topEmotions[0]);
    // Declining week → the coping-focused suggestion; otherwise the connection one.
    const suggestion = weeklyChange.avgImprovementPercent < 0 ? moodSuggestions[0] : moodSuggestions[1] ?? moodSuggestions[0];

    return { topEmotions, topTriggers, weeklyChange, journalStats, positivePatterns, suggestion };
  }, [moodEntries, journalEntries]);

  return {
    isLoading,
    isError,
    error,
    isEmpty: !isLoading && !isError && moodEntries.length === 0 && journalEntries.length === 0,
    trend: trendQuery.data ?? [],
    refetch: () => Promise.all([historyQuery.refetch(), trendQuery.refetch(), journalQuery.refetch()]),
    ...data,
  };
}
