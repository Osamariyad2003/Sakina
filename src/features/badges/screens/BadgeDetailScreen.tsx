import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Badge, LoadingState, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useBadgeQuery } from '../state/useBadgeQueries';
import type { AppError } from '../../../core/errors';
import type { ProfileStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'BadgeDetail'>;

export function BadgeDetailScreen({ route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useBadgeQuery(route.params.badgeId);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState message={(query.error as AppError)?.message ?? t('badges.notFound')} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const { definition, earned, current, ratio } = query.data;
  const accent = theme.colors.accent[definition.accent];

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ alignItems: 'center', gap: theme.spacing.sm, paddingTop: theme.spacing.lg }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: earned ? accent : theme.colors.border.subtle,
            }}
          >
            <Ionicons
              name={definition.icon}
              size={44}
              color={earned ? theme.colors.text.onBrand : theme.colors.text.secondary}
            />
          </View>
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {isArabic ? definition.titleAr : definition.titleEn}
          </AppText>
          <Badge label={earned ? t('badges.earned') : t('badges.inProgress')} color={earned ? accent : undefined} />
        </View>

        <Card>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {isArabic ? definition.descriptionAr : definition.descriptionEn}
          </AppText>
        </Card>

        <Card style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('badges.progressTitle')}</AppText>
          <View style={{ height: 8, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.subtle }}>
            <View
              style={{
                width: `${Math.round(ratio * 100)}%`,
                height: 8,
                borderRadius: theme.radius.pill,
                backgroundColor: accent,
              }}
            />
          </View>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('badges.progressLabel', { current, total: definition.threshold })}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t(`badges.signal.${definition.signal}`)}
          </AppText>
        </Card>

        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('badges.noMoodRewardNote')}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
