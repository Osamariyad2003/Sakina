import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Tabs, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { BadgeTile } from '../components/BadgeTile';
import { useBadgesQuery, useCelebrateBadgesMutation } from '../state/useBadgeQueries';
import { badgeCategories, type BadgeCategory } from '../models/badgeContent';
import type { ProfileStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Badges'>;

type Filter = BadgeCategory | 'all';

/**
 * Badge wall. Opening the screen also fires any pending "you earned this"
 * notifications — badges are derived on every read, so this is the natural
 * point to reconcile what has been celebrated.
 */
export function BadgesScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>('all');
  const query = useBadgesQuery();
  const celebrate = useCelebrateBadgesMutation();

  const celebrateMutate = celebrate.mutate;
  useEffect(() => {
    if (query.isSuccess) celebrateMutate();
  }, [query.isSuccess, celebrateMutate]);

  const badges = query.data ?? [];
  const earnedCount = badges.filter((b) => b.earned).length;
  const visible = useMemo(
    () => (filter === 'all' ? badges : badges.filter((b) => b.definition.category === filter)),
    [badges, filter],
  );

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="displayMd">{t('badges.title')}</AppText>

        <Card style={{ borderTopWidth: 3, borderTopColor: theme.colors.accent.reflection }}>
          <AppText variant="titleLg">{t('badges.earnedOf', { earned: earnedCount, total: badges.length })}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('badges.intro')}
          </AppText>
        </Card>

        <Tabs
          items={[
            { key: 'all', label: t('badges.filterAll') },
            ...badgeCategories.map((category) => ({
              key: category.id,
              label: t(`badges.category.${category.id}`),
            })),
          ]}
          value={filter}
          onChange={(key) => setFilter(key as Filter)}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState title={t('badges.noneInCategory')} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {visible.map((progress) => (
              <BadgeTile
                key={progress.definition.id}
                progress={progress}
                onPress={() => navigation.navigate('BadgeDetail', { badgeId: progress.definition.id })}
              />
            ))}
          </View>
        )}

        {/* States the rule out loud, so nobody games their own mood log. */}
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('badges.noMoodRewardNote')}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
