import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, SkeletonList, ErrorState, EmptyState, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useCheckerSessionsQuery } from '../state/useCheckerQueries';
import { getCondition } from '../models/checkerContent';
import type { AppError } from '../../../core/errors';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'CheckerSessionHistory'>;

/**
 * "Session History" — the user's past checker runs. Structure follows the SH
 * Freud history frame; styling is 100% Sakina tokens/primitives.
 */
export function CheckerSessionHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useCheckerSessionsQuery();
  const sessions = query.data ?? [];

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('checker.sessionHistoryTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('checker.sessionHistorySubtitle', { count: sessions.length })}
        </AppText>

        <View style={{ flex: 1 }}>
          {query.isLoading ? (
            <SkeletonList rows={5} />
          ) : query.isError ? (
            <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
          ) : sessions.length === 0 ? (
            <EmptyState
              title={t('checker.sessionHistoryEmptyTitle')}
              description={t('checker.sessionHistoryEmptyBody')}
              icon={<AnimatedLottie source={require('../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
            />
          ) : (
            <FlashList
              data={sessions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const condition = item.topConditionId ? getCondition(item.topConditionId) : undefined;
                const dateLabel = new Date(item.createdAt).toLocaleString(isArabic ? 'ar-JO' : 'en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View style={{ marginBottom: theme.spacing.sm }}>
                    <Card
                      onPress={() => item.topConditionId && navigation.navigate('ConditionDetail', { conditionId: item.topConditionId })}
                      style={{ gap: theme.spacing.xxs }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <AppText variant="titleMd">
                          {condition ? (isArabic ? condition.nameAr : condition.nameEn) : t('checker.noTopCondition')}
                        </AppText>
                        {item.riskFlagged ? (
                          <Ionicons name="alert-circle" size={18} color={theme.colors.status.error} />
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                        <Badge label={t(`checker.methodBadge.${item.method}`)} />
                        <AppText variant="caption" color={theme.colors.text.secondary}>
                          {dateLabel}
                        </AppText>
                      </View>
                    </Card>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
