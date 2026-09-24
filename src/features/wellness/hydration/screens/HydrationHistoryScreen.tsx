import React, { useMemo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useHydrationHistoryQuery } from '../state/useHydrationQueries';
import { DateHeader } from '../../../journal/components/DateHeader';
import type { HydrationLog } from '../models/hydrationContent';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'HydrationHistory'>;

type ListItem = { kind: 'header'; date: string } | { kind: 'entry'; log: HydrationLog };

/** Same grouped-by-date pattern as `JournalListScreen` — reuses its `DateHeader` component directly. */
function groupByDate(logs: HydrationLog[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  for (const log of logs) {
    const date = log.createdAt.slice(0, 10);
    if (date !== lastDate) {
      items.push({ kind: 'header', date });
      lastDate = date;
    }
    items.push({ kind: 'entry', log });
  }
  return items;
}

/**
 * Structure: reference's Hydration "history list."
 * Styling: theme.spacing/theme.colors + Screen/AppText/Card/SkeletonList/
 * ErrorState/EmptyState — no reference values.
 */
export function HydrationHistoryScreen({ navigation: _navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useHydrationHistoryQuery();
  const items = useMemo(() => groupByDate(query.data ?? []), [query.data]);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg }}>
        <AppText variant="displayMd">{t('hydration.historyTitle')}</AppText>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('hydration.historyEmptyTitle')} description={t('hydration.historyEmptyBody')} />
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => (item.kind === 'header' ? `header-${item.date}` : item.log.id)}
            renderItem={({ item }) =>
              item.kind === 'header' ? (
                <DateHeader isoDate={item.date} />
              ) : (
                <Card style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="body">{t('hydration.mlValue', { count: item.log.sizeMl })}</AppText>
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {new Date(item.log.createdAt).toLocaleTimeString(isArabic ? 'ar-JO' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </AppText>
                </Card>
              )
            }
          />
        )}
      </View>
    </Screen>
  );
}
