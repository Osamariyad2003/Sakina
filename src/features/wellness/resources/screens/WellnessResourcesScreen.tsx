import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Tabs, Chip, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { ResourceCard } from '../components/ResourceCard';
import { WorkshopCard } from '../components/WorkshopCard';
import {
  useArticlesQuery,
  useWorkshopsQuery,
  useSavedResourcesQuery,
  useWorkshopRegistrationsQuery,
} from '../state/useResourceQueries';
import { resourceTopics, type ResourceTopic } from '../models/resourceContent';
import type { AppError } from '../../../../core/errors';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'WellnessResources'>;

type Section = 'articles' | 'workshops' | 'saved';

/** Reading, workshops, and the user's own saved list — three tabs over one catalogue. */
export function WellnessResourcesScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const [section, setSection] = useState<Section>('articles');
  const [topic, setTopic] = useState<ResourceTopic | null>(null);
  const [search, setSearch] = useState('');

  const articleFilter = useMemo(() => ({ topic, search }), [topic, search]);
  const articlesQuery = useArticlesQuery(articleFilter);
  const workshopsQuery = useWorkshopsQuery(topic);
  const savedQuery = useSavedResourcesQuery();
  const registrationsQuery = useWorkshopRegistrationsQuery();
  const registeredIds = new Set((registrationsQuery.data ?? []).map((w) => w.id));

  const activeQuery = section === 'articles' ? articlesQuery : section === 'workshops' ? workshopsQuery : savedQuery;

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="displayMd">{t('resources.title')}</AppText>
        <Tabs
          items={[
            { key: 'articles', label: t('resources.tabArticles') },
            { key: 'workshops', label: t('resources.tabWorkshops') },
            { key: 'saved', label: t('resources.tabSaved') },
          ]}
          value={section}
          onChange={(key) => setSection(key as Section)}
        />

        {section === 'articles' ? (
          <TextField
            placeholder={t('resources.searchPlaceholder')}
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('resources.searchPlaceholder')}
          />
        ) : null}

        {section !== 'saved' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
            {resourceTopics.map((item) => (
              <Chip
                key={item.id}
                label={isArabic ? item.labelAr : item.labelEn}
                selected={topic === item.id}
                onPress={() => setTopic((current) => (current === item.id ? null : item.id))}
              />
            ))}
          </ScrollView>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        {activeQuery.isLoading ? (
          <SkeletonList rows={4} />
        ) : activeQuery.isError ? (
          <ErrorState message={(activeQuery.error as AppError).message} onRetry={() => activeQuery.refetch()} />
        ) : section === 'articles' ? (
          (articlesQuery.data ?? []).length === 0 ? (
            <EmptyState title={t('resources.noArticlesTitle')} description={t('resources.noArticlesBody')} />
          ) : (
            (articlesQuery.data ?? []).map((article) => (
              <ResourceCard
                key={article.id}
                article={article}
                onPress={() => navigation.navigate('ResourceDetail', { resourceId: article.id })}
              />
            ))
          )
        ) : section === 'workshops' ? (
          (workshopsQuery.data ?? []).length === 0 ? (
            <EmptyState title={t('resources.noWorkshopsTitle')} description={t('resources.noWorkshopsBody')} />
          ) : (
            (workshopsQuery.data ?? []).map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                registered={registeredIds.has(workshop.id)}
                onPress={() => navigation.navigate('WorkshopDetail', { workshopId: workshop.id })}
              />
            ))
          )
        ) : (savedQuery.data?.articles.length ?? 0) + (savedQuery.data?.workshops.length ?? 0) === 0 ? (
          <EmptyState
            title={t('resources.noSavedTitle')}
            description={t('resources.noSavedBody')}
            actionLabel={t('resources.tabArticles')}
            onAction={() => setSection('articles')}
          />
        ) : (
          <>
            {(savedQuery.data?.articles ?? []).map((article) => (
              <ResourceCard
                key={article.id}
                article={article}
                onPress={() => navigation.navigate('ResourceDetail', { resourceId: article.id })}
              />
            ))}
            {(savedQuery.data?.workshops ?? []).map((workshop) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                registered={registeredIds.has(workshop.id)}
                onPress={() => navigation.navigate('WorkshopDetail', { workshopId: workshop.id })}
              />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
