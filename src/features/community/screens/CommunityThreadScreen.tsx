import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextArea, Button, Card, LoadingState, ErrorState, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { SafetyBanner } from '../../safety/components/SafetyBanner';
import { PostCard } from '../components/PostCard';
import {
  useCommunityThreadQuery,
  useCommunityProfileQuery,
  useReplyMutation,
  useToggleSupportMutation,
  useReportPostMutation,
  useDeleteMyPostMutation,
} from '../state/useCommunityQueries';
import { MAX_POST_LENGTH } from '../models/communityContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'CommunityThread'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/** One thread: the posts, and a reply composer under the same safety gate. */
export function CommunityThreadScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const { threadId } = route.params;
  const [reply, setReply] = useState('');
  const [riskDetected, setRiskDetected] = useState(false);

  const query = useCommunityThreadQuery(threadId);
  const profileQuery = useCommunityProfileQuery();
  const replyMutation = useReplyMutation();
  const toggleSupport = useToggleSupportMutation();
  const reportPost = useReportPostMutation();
  const deletePost = useDeleteMyPostMutation();

  const joined = Boolean(profileQuery.data?.hasAcceptedGuidelines && profileQuery.data.alias);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState
          message={errorText(query.error, t) ?? t('community.threadNotFound')}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const { thread, posts } = query.data;

  const submitReply = () => {
    setRiskDetected(false);
    replyMutation.mutate(
      { threadId, body: reply },
      {
        onSuccess: () => setReply(''),
        onError: (error) => {
          const appError = error as AppError;
          if (appError.status === 422) {
            setRiskDetected(true);
            return;
          }
          toast.show({ message: appError.message, tone: 'error' });
        },
      },
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      {riskDetected ? (
        <SafetyBanner
          onOpenSafety={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          onDismiss={() => setRiskDetected(false)}
        />
      ) : null}

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMd">{thread.title}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('community.startedBy', { alias: thread.authorAlias })}
        </AppText>

        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleSupport={() => toggleSupport.mutate(post.id)}
            onReport={() =>
              reportPost.mutate(post.id, {
                onSuccess: () => toast.show({ message: t('community.reportedToast'), tone: 'success' }),
              })
            }
            onDelete={() =>
              deletePost.mutate(post.id, {
                onSuccess: () => toast.show({ message: t('community.deletedToast'), tone: 'success' }),
                onError: (error) => toast.show({ message: errorText(error, t), tone: 'error' }),
              })
            }
          />
        ))}

        {joined ? (
          <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
            <TextArea
              label={t('community.replyLabel')}
              placeholder={t('community.replyPlaceholder')}
              value={reply}
              onChangeText={setReply}
              maxLength={MAX_POST_LENGTH}
            />
            <Button
              label={t('community.sendReply')}
              disabled={reply.trim().length === 0}
              loading={replyMutation.isPending}
              onPress={submitReply}
            />
          </View>
        ) : (
          <Card style={{ marginTop: theme.spacing.sm }}>
            <AppText variant="body">{t('community.joinToReply')}</AppText>
            <Button
              label={t('community.joinCta')}
              variant="secondary"
              style={{ marginTop: theme.spacing.xs }}
              onPress={() => navigation.navigate('Community')}
            />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}
