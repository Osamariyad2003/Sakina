import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, SegmentedControl, SkeletonList, ErrorState, EmptyState, AppModal } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { ConversationCard } from '../components/therapyBits';
import {
  useTherapyConversationsQuery,
  useTrashConversationMutation,
  useDeleteConversationMutation,
} from '../state/useTherapyQueries';
import type { CompanionStackParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = NativeStackScreenProps<CompanionStackParamList, 'TherapyChats'>;

/**
 * "My AI Chats" — Recent / Trash tabs. Trashing keeps a conversation for
 * restore (30-day window per the design copy); deleting forever is confirmed.
 * Structure follows the SH Freud chats frame; styling is 100% Sakina
 * tokens/primitives.
 */
export function TherapyChatsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'recent' | 'trash'>('recent');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const query = useTherapyConversationsQuery();
  const trash = useTrashConversationMutation();
  const del = useDeleteConversationMutation();

  const all = query.data ?? [];
  const list = all.filter((c) => (tab === 'trash' ? c.trashed : !c.trashed));

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('therapy.myChats')}</AppText>
        <SegmentedControl
          segments={[
            { key: 'recent', label: t('therapy.tabRecent') },
            { key: 'trash', label: t('therapy.tabTrash') },
          ]}
          value={tab}
          onChange={(k) => setTab(k as 'recent' | 'trash')}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === 'trash' ? t('therapy.trashEmptyTitle') : t('therapy.recentEmptyTitle')}
            description={tab === 'trash' ? t('therapy.trashEmptyBody') : t('therapy.recentEmptyBody')}
            icon={<AnimatedLottie source={require('../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
            actionLabel={tab === 'recent' ? t('therapy.newConversation') : undefined}
            onAction={tab === 'recent' ? () => navigation.navigate('NewTherapyConversation') : undefined}
          />
        ) : (
          list.map((conversation) => (
            <View key={conversation.id} style={{ gap: theme.spacing.xxs }}>
              <ConversationCard
                conversation={conversation}
                onPress={() =>
                  tab === 'trash'
                    ? undefined
                    : navigation.navigate('TherapyConversation', { conversationId: conversation.id })
                }
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.xs }}>
                {tab === 'recent' ? (
                  <Button label={t('therapy.moveToTrash')} variant="ghost" size="md" onPress={() => trash.mutate({ id: conversation.id, trashed: true })} />
                ) : (
                  <>
                    <Button label={t('therapy.restore')} variant="ghost" size="md" onPress={() => trash.mutate({ id: conversation.id, trashed: false })} />
                    <Button label={t('therapy.delete')} variant="ghost" size="md" onPress={() => setPendingDelete(conversation.id)} />
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <AppModal visible={pendingDelete !== null} onClose={() => setPendingDelete(null)}>
        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="titleLg" style={{ textAlign: 'center' }}>
            {t('therapy.deleteConfirmTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('therapy.deleteConfirmBody')}
          </AppText>
          <Button label={t('common.cancel')} variant="secondary" onPress={() => setPendingDelete(null)} />
          <Button
            label={t('therapy.deleteConversation')}
            variant="destructive"
            loading={del.isPending}
            onPress={() => {
              if (pendingDelete) del.mutate(pendingDelete, { onSettled: () => setPendingDelete(null) });
            }}
          />
        </View>
      </AppModal>
    </Screen>
  );
}
