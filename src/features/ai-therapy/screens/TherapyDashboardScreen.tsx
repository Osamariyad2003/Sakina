import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { ConversationCard } from '../components/therapyBits';
import { useTherapyConversationsQuery } from '../state/useTherapyQueries';
import type { AppError } from '../../../core/errors';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'TherapyDashboard'>;

/**
 * AI Chatbot dashboard — total conversations + a couple of rollup stats, the
 * most recent conversation, and entries into a new chat / all chats. The
 * Figma's "Upgrade to Pro" upsell is intentionally omitted (monetization is
 * product-definition.md Open Question #7, deferred). Styling: 100% Sakina
 * tokens/primitives.
 */
export function TherapyDashboardScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useTherapyConversationsQuery();

  const all = query.data ?? [];
  const active = all.filter((c) => !c.trashed);
  const totalMessages = active.reduce((sum, c) => sum + c.messageCount, 0);
  const recent = active[0];

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('therapy.dashboardTitle')}</AppText>

        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : (
          <>
            <Card elevation="md" style={{ backgroundColor: theme.colors.brand.primaryDark, alignItems: 'center', gap: theme.spacing.xxs }}>
              <AppText variant="displayLg" color={theme.colors.text.onBrand}>
                {active.length}
              </AppText>
              <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                {t('therapy.totalConversations')}
              </AppText>
              <View style={{ flexDirection: 'row', gap: theme.spacing.lg, marginTop: theme.spacing.xs }}>
                <View style={{ alignItems: 'center' }}>
                  <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                    {totalMessages}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.text.onBrand}>
                    {t('therapy.totalMessagesStat')}
                  </AppText>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                    {t('therapy.supportive')}
                  </AppText>
                  <AppText variant="caption" color={theme.colors.text.onBrand}>
                    {t('therapy.responseSupport')}
                  </AppText>
                </View>
              </View>
            </Card>

            <Button label={t('therapy.newConversation')} onPress={() => navigation.navigate('NewTherapyConversation')} />

            {recent ? (
              <View style={{ gap: theme.spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <AppText variant="titleMd">{t('therapy.recent')}</AppText>
                  <Button label={t('therapy.seeAll')} variant="ghost" size="md" onPress={() => navigation.navigate('TherapyChats')} />
                </View>
                <ConversationCard conversation={recent} onPress={() => navigation.navigate('TherapyConversation', { conversationId: recent.id })} />
              </View>
            ) : null}

            <Button label={t('therapy.myChats')} variant="secondary" onPress={() => navigation.navigate('TherapyChats')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
