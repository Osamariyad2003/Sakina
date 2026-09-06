import React, { useMemo } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, Card, IconButton, SkeletonList } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { UserMessageBubble, AIMessageBubble } from '../../ai-companion/components/MessageBubble';
import { TypingIndicator } from '../../ai-companion/components/TypingIndicator';
import { ChatInput } from '../../ai-companion/components/ChatInput';
import { EmotionTag } from '../components/therapyBits';
import { useTherapyChat } from '../state/useTherapyChat';
import { useTherapyConversationsQuery } from '../state/useTherapyQueries';
import type { TherapyMessage } from '../models/therapyContent';
import type { CompanionStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<CompanionStackParamList, 'TherapyConversation'>,
  BottomTabScreenProps<AppTabsParamList>
>;

type Row = TherapyMessage | { id: 'typing'; kind: 'typing' };

/**
 * The Doctor Freud AI chat. Reuses the AI Companion's message bubbles / typing
 * indicator / input, adds per-turn emotion tags, an inline "limited knowledge"
 * disclaimer, and a crisis-support banner (routes to real Safety) whenever risk
 * language is detected. Structure follows the SH Freud chat frames; styling is
 * 100% Sakina tokens/primitives.
 */
export function TherapyConversationScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { conversationId } = route.params;
  const { messages, status, error, crisisActive, send, retry, dismissCrisis } = useTherapyChat(conversationId);
  const conversationsQuery = useTherapyConversationsQuery();
  const conversation = (conversationsQuery.data ?? []).find((c) => c.id === conversationId);

  const data: Row[] = useMemo(
    () => (status === 'sending' ? [...messages, { id: 'typing', kind: 'typing' as const }] : messages),
    [messages, status],
  );

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm }}>
        <View>
          <AppText variant="titleLg">{t('therapy.botName')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('therapy.chatsLeft', { count: 251 })}
            {conversation ? ` · ${conversation.topicName}` : ''}
          </AppText>
        </View>
        <IconButton
          accessibilityLabel={t('therapy.customInstructions')}
          icon={<Ionicons name="settings-outline" size={20} color={theme.colors.brand.primary} />}
          onPress={() => navigation.navigate('TherapyCustomInstructions', { conversationId })}
        />
      </View>

      {crisisActive ? (
        <Card style={{ backgroundColor: theme.colors.status.error, borderRadius: 0, gap: theme.spacing.xs }} elevation="none">
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('therapy.crisisTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.onBrand}>
            {t('therapy.crisisBody')}
          </AppText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            <Button label={t('therapy.crisisCta')} variant="secondary" onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })} />
            <Button label={t('common.cancel')} variant="secondary" onPress={dismissCrisis} />
          </View>
        </Card>
      ) : (
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('therapy.limitedKnowledge')}
          </AppText>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          {status === 'loadingHistory' ? (
            <SkeletonList rows={3} />
          ) : messages.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.xs, padding: theme.spacing.lg }}>
              <AppText variant="titleMd" style={{ textAlign: 'center' }}>
                {t('therapy.chatEmptyTitle')}
              </AppText>
              <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
                {t('therapy.chatEmptyBody')}
              </AppText>
            </View>
          ) : (
            <FlashList
              data={data}
              maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.2 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                if ('kind' in item) return <TypingIndicator />;
                if (item.role === 'user') {
                  return (
                    <>
                      <UserMessageBubble content={item.content} />
                      {item.emotion ? <EmotionTag emotion={item.emotion} /> : null}
                    </>
                  );
                }
                return <AIMessageBubble content={item.content} streaming={item.streaming} />;
              }}
            />
          )}

          {error ? (
            <View style={{ paddingVertical: theme.spacing.xs }}>
              <AppText variant="caption" color={theme.colors.status.error}>
                {error.message || t('therapy.failedMessage')}
              </AppText>
              <Button label={t('therapy.retry')} variant="ghost" size="md" onPress={retry} />
            </View>
          ) : null}
        </View>

        <ChatInput onSend={send} disabled={status === 'sending' || status === 'streaming'} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
