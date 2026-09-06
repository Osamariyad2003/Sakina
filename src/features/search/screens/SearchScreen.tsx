import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Chip, Button, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { SearchResultRow } from '../components/SearchResultRow';
import {
  useSearchQuery,
  useRecentSearchesQuery,
  useRememberSearchMutation,
  useClearRecentSearchesMutation,
} from '../state/useSearchQueries';
import { MIN_QUERY_LENGTH, type SearchResult, type SearchScope } from '../models/searchContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Search'>,
  BottomTabScreenProps<AppTabsParamList>
>;

const scopes: SearchScope[] = ['all', 'mine', 'learn', 'support'];

/**
 * Global search. Everything runs on-device (see `searchService`), so the
 * screen can search the user's private journal without that query leaving the
 * phone.
 */
export function SearchScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [query, setQuery] = useState(route.params?.initialQuery ?? '');
  const [scope, setScope] = useState<SearchScope>('all');

  const searchQuery = useSearchQuery(query, scope);
  const recentQuery = useRecentSearchesQuery();
  const rememberSearch = useRememberSearchMutation();
  const clearRecent = useClearRecentSearchesMutation();

  const results = searchQuery.data ?? [];
  const isSearching = query.trim().length >= MIN_QUERY_LENGTH;

  /**
   * Results carry a closed `kind`, so this switch is exhaustive and no stored
   * value can send the user to an arbitrary route.
   */
  const openResult = (result: SearchResult) => {
    rememberSearch.mutate(query);
    switch (result.kind) {
      case 'journal':
        navigation.navigate('JournalTab', { screen: 'JournalEntry', params: { entryId: result.entityId } });
        return;
      case 'mood':
        navigation.navigate('MoodTab', { screen: 'MoodDetail', params: { entryId: result.entityId } });
        return;
      case 'article':
        navigation.navigate('WellnessTab', { screen: 'ResourceDetail', params: { resourceId: result.entityId } });
        return;
      case 'workshop':
        navigation.navigate('WellnessTab', { screen: 'WorkshopDetail', params: { workshopId: result.entityId } });
        return;
      case 'exercise':
        navigation.navigate('WellnessTab', { screen: 'ExerciseDetails', params: { exerciseId: result.entityId } });
        return;
      case 'therapist':
        navigation.navigate('TherapistDetail', { professionalId: result.entityId });
        return;
      case 'help':
        navigation.navigate('ProfileTab', { screen: 'HelpArticle', params: { articleId: result.entityId } });
        return;
      case 'communityThread':
        navigation.navigate('CommunityThread', { threadId: result.entityId });
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="displayMd">{t('search.title')}</AppText>
        <TextField
          placeholder={t('search.placeholder')}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => rememberSearch.mutate(query)}
          accessibilityLabel={t('search.placeholder')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
          {scopes.map((item) => (
            <Chip key={item} label={t(`search.scope.${item}`)} selected={scope === item} onPress={() => setScope(item)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }} keyboardShouldPersistTaps="handled">
        {!isSearching ? (
          <>
            {(recentQuery.data ?? []).length > 0 ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AppText variant="titleMd">{t('search.recentTitle')}</AppText>
                  <Button label={t('search.clearRecent')} size="md" variant="ghost" onPress={() => clearRecent.mutate()} />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                  {(recentQuery.data ?? []).map((item) => (
                    <Chip key={item} label={item} onPress={() => setQuery(item)} />
                  ))}
                </View>
              </>
            ) : null}
            <EmptyState title={t('search.startTitle')} description={t('search.startBody')} />
          </>
        ) : searchQuery.isLoading ? (
          <SkeletonList rows={4} />
        ) : searchQuery.isError ? (
          <ErrorState message={(searchQuery.error as AppError).message} onRetry={() => searchQuery.refetch()} />
        ) : results.length === 0 ? (
          <EmptyState title={t('search.noResultsTitle')} description={t('search.noResultsBody', { query: query.trim() })} />
        ) : (
          results.map((result) => <SearchResultRow key={result.key} result={result} onPress={() => openResult(result)} />)
        )}
      </ScrollView>
    </Screen>
  );
}
