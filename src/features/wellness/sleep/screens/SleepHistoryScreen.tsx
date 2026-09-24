import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import { SleepStageBar } from '../components/SleepStageBar';
import { useSleepFormat } from '../components/useSleepFormat';
import { ratingColor } from '../components/sleepColors';
import { useSleepRecordsQuery } from '../state/useSleepQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'SleepHistory'>;

/**
 * "Sleep History" — the full night-by-night list, each row a duration +
 * rating badge + stage bar, tapping into detail. Structure follows the SH
 * Freud history frame; styling is 100% Sakina tokens/primitives.
 */
export function SleepHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatDuration } = useSleepFormat();
  const query = useSleepRecordsQuery();
  const records = query.data ?? [];

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.historyTitle')}</AppText>

        <View style={{ flex: 1 }}>
          {query.isLoading ? (
            <SkeletonList rows={5} />
          ) : query.isError ? (
            <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
          ) : records.length === 0 ? (
            <EmptyState
              title={t('sleep.historyEmptyTitle')}
              description={t('sleep.historyEmptyBody')}
              icon={<AnimatedLottie source={require('../../../../../assets/lottie/emptyCalm.json')} style={{ width: 96, height: 96 }} />}
            />
          ) : (
            <FlashList
              data={records}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ marginBottom: theme.spacing.sm }}>
                  <Card onPress={() => navigation.navigate('SleepDetail', { recordId: item.id })} style={{ gap: theme.spacing.xs }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <AppText variant="caption" color={theme.colors.text.secondary}>
                          {item.date}
                        </AppText>
                        <AppText variant="titleMd">{formatDuration(item.durationMinutes)}</AppText>
                      </View>
                      <View
                        style={{
                          paddingHorizontal: theme.spacing.xs,
                          paddingVertical: theme.spacing.xxs,
                          borderRadius: theme.radius.pill,
                          backgroundColor: ratingColor(theme, item.rating),
                        }}
                      >
                        <AppText variant="caption" color={theme.colors.text.onBrand}>
                          {t(`sleep.rating.${item.rating}`)}
                        </AppText>
                      </View>
                    </View>
                    <SleepStageBar stages={item.stages} />
                  </Card>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
