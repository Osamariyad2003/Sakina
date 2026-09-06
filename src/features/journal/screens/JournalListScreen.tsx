import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Button, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useJournalListQuery } from '../state/useJournalQueries';
import { JournalCard } from '../components/JournalCard';
import { DateHeader } from '../components/DateHeader';
import type { AppError } from '../../../core/errors';
import type { JournalEntry } from '../../../types/models';
import type { JournalStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalList'>;

type ListItem = { kind: 'header'; date: string } | { kind: 'entry'; entry: JournalEntry };

function groupByDate(entries: JournalEntry[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = '';
  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10);
    if (date !== lastDate) {
      items.push({ kind: 'header', date });
      lastDate = date;
    }
    items.push({ kind: 'entry', entry });
  }
  return items;
}

export function JournalListScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const query = useJournalListQuery(searchTerm);

  const items = useMemo(() => groupByDate(query.data ?? []), [query.data]);
  const isSearching = searchTerm.trim().length > 0;

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd">{t('tabs.journal')}</AppText>
          <Button label={t('journal.newEntry')} size="md" onPress={() => navigation.navigate('JournalEntry', undefined)} />
        </View>
        <TextField
          placeholder={t('journal.searchPlaceholder')}
          value={searchTerm}
          onChangeText={setSearchTerm}
          accessibilityLabel={t('journal.searchPlaceholder')}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          isSearching ? (
            <EmptyState title={t('journal.noSearchResultsTitle')} description={t('journal.noSearchResultsBody')} />
          ) : (
            <EmptyState
              title={t('journal.emptyTitle')}
              description={t('journal.emptyBody')}
              actionLabel={t('journal.newEntry')}
              onAction={() => navigation.navigate('JournalEntry', undefined)}
            />
          )
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => (item.kind === 'header' ? `header-${item.date}` : item.entry.id)}
            renderItem={({ item }) =>
              item.kind === 'header' ? (
                <DateHeader isoDate={item.date} />
              ) : (
                <View style={{ marginBottom: theme.spacing.sm }}>
                  <JournalCard entry={item.entry} onPress={() => navigation.navigate('JournalEntry', { entryId: item.entry.id })} />
                </View>
              )
            }
          />
        )}
      </View>
    </Screen>
  );
}
