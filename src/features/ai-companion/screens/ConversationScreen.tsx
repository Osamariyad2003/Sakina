import React, { useMemo } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, Card, SkeletonList } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useCompanionChat } from '../state/useCompanionChat';
import { UserMessageBubble, AIMessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { ChatInput } from '../components/ChatInput';
import { SuggestedPrompts } from '../components/SuggestedPrompts';
import { SafetyBanner } from '../../safety/components/SafetyBanner';
import type { ChatMessage } from '../../../types/models';
import type { CompanionStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<CompanionStackParamList, 'Conversation'>,
  BottomTabScreenProps<AppTabsParamList>
>;

type ListItem = ChatMessage | { id: 'typing-indicator'; kind: 'typing' };

/**
 * Full chat UI (spec §16): FlashList v2's `maintainVisibleContentPosition`
 * (the v2 replacement for FlatList's `inverted` prop — keeps the view
 * anchored to the bottom as new messages arrive), streaming AI bubble,
 * suggested prompts, retry, empty state, and the non-clinical / escalation
 * safety rule enforced via risk detection → pinned SafetyBanner.
 */
export function ConversationScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { messages, status, error, riskDetected, suggestion, send, retry } = useCompanionChat();
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  React.useEffect(() => {
    if (riskDetected) setBannerDismissed(false);
  }, [riskDetected]);

  const data: ListItem[] = useMemo(() => {
    if (status === 'sending') {
      return [...messages, { id: 'typing-indicator', kind: 'typing' }];
    }
    return messages;
  }, [messages, status]);

  const showSafetyBanner = riskDetected && !bannerDismissed;

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="titleLg">{t('tabs.companion')}</AppText>
          <Button
            label={t('checker.launchCta')}
            variant="ghost"
            size="md"
            onPress={() => navigation.navigate('SymptomCheckerIntro')}
          />
        </View>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('companion.disclaimer')}
        </AppText>
      </View>

      {showSafetyBanner ? (
        <SafetyBanner
          onOpenSafety={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          onDismiss={() => setBannerDismissed(true)}
        />
      ) : suggestion === 'stressManagement' ? (
        // Lightweight non-clinical topic hint, distinct from SafetyBanner's
        // crisis-escalation treatment — a plain Card, not a pinned alert.
        <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
          <Card onPress={() => navigation.navigate('WellnessTab', { screen: 'StressOverview' })}>
            <AppText variant="titleMd">{t('companion.stressSuggestionTitle')}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
              {t('companion.stressSuggestionBody')}
            </AppText>
            <Button
              label={t('companion.stressSuggestionCta')}
              variant="secondary"
              size="md"
              style={{ marginTop: theme.spacing.xs }}
              onPress={() => navigation.navigate('WellnessTab', { screen: 'StressOverview' })}
            />
          </Card>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.md }}>
          {status === 'loadingHistory' ? (
            <SkeletonList rows={3} />
          ) : messages.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: theme.spacing.md, gap: theme.spacing.md }}>
              <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
                <AppText variant="titleMd">{t('companion.emptyTitle')}</AppText>
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {t('companion.emptyBody')}
                </AppText>
              </View>
              <SuggestedPrompts onSelect={send} />
            </View>
          ) : (
            <FlashList
              data={data}
              maintainVisibleContentPosition={{ startRenderingFromBottom: true, autoscrollToBottomThreshold: 0.2 }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) =>
                'kind' in item ? (
                  <TypingIndicator />
                ) : item.role === 'user' ? (
                  <UserMessageBubble content={item.content} />
                ) : (
                  <AIMessageBubble content={item.content} streaming={item.streaming} />
                )
              }
            />
          )}

          {error ? (
            <View style={{ paddingVertical: theme.spacing.xs }}>
              <AppText variant="caption" color={theme.colors.status.error}>
                {error.message || t('companion.failedMessage')}
              </AppText>
              <Button label={t('companion.retry')} variant="ghost" size="md" onPress={retry} />
            </View>
          ) : null}
        </View>

        <ChatInput onSend={send} disabled={status === 'sending' || status === 'streaming'} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
