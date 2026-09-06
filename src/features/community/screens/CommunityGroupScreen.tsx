import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, SkeletonList, ErrorState, EmptyState, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { ThreadCard } from '../components/ThreadCard';
import { useCommunityThreadsQuery, useCommunityProfileQuery } from '../state/useCommunityQueries';
import { getGroup } from '../models/communityContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CommunityGroup'>;

/** Threads in one group. Anyone can read; only a joined member can start one. */
export function CommunityGroupScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();

  const { groupId } = route.params;
  const group = getGroup(groupId);
  const query = useCommunityThreadsQuery(groupId);
  const profileQuery = useCommunityProfileQuery();
  const joined = Boolean(profileQuery.data?.hasAcceptedGuidelines && profileQuery.data.alias);

  const startThread = () => {
    if (!joined) {
      toast.show({ message: t('community.guidelinesRequired'), tone: 'error' });
      navigation.navigate('Community');
      return;
    }
    navigation.navigate('NewCommunityThread', { groupId });
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.xs }}>
        <AppText variant="displayMd">{group ? (isArabic ? group.nameAr : group.nameEn) : t('community.title')}</AppText>
        {group ? (
          <AppText variant="body" color={theme.colors.text.secondary}>
            {isArabic ? group.descriptionAr : group.descriptionEn}
          </AppText>
        ) : null}
        <Button label={t('community.newThread')} size="md" onPress={startThread} style={{ marginTop: theme.spacing.xs }} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState
            title={t('community.noThreadsTitle')}
            description={t('community.noThreadsBody')}
            actionLabel={t('community.newThread')}
            onAction={startThread}
          />
        ) : (
          <FlashList
            data={query.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <ThreadCard thread={item} onPress={() => navigation.navigate('CommunityThread', { threadId: item.id })} />
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
