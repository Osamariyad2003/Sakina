import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, SkeletonList, ErrorState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { WaterFillGauge } from '../components/WaterFillGauge';
import { useHydrationTodayQuery } from '../state/useHydrationQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'HydrationHome'>;

/**
 * Structure: reference's Hydration home — big ml value + animated
 * water-fill viz + %, then log/history/settings entry points. Figma/
 * reference access unavailable for this task (community file, no editor
 * permission — same fallback as every earlier structure-only pass, see
 * ASSUMPTIONS.md); structure comes from this feature's own written spec.
 * Styling: theme.spacing/theme.colors + our extended `accent.hydration`
 * token ("Botanical & warm," confirmed with the product owner) +
 * Screen/AppText/Button/SkeletonList/ErrorState + WaterFillGauge — no
 * reference values.
 */
export function HydrationHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useHydrationTodayQuery();

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: theme.spacing.lg, gap: theme.spacing.lg }}>
        <AppText variant="displayMd">{t('hydration.title')}</AppText>

        {query.isLoading ? (
          <SkeletonList rows={3} />
        ) : query.isError ? (
          <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
        ) : query.data ? (
          <>
            <WaterFillGauge progress={query.data.totalMl / query.data.goalMl} />
            <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
              <AppText variant="displayLg">{t('hydration.mlValue', { count: query.data.totalMl })}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('hydration.goalProgress', {
                  percent: Math.min(100, Math.round((query.data.totalMl / query.data.goalMl) * 100)),
                  goal: query.data.goalMl,
                })}
              </AppText>
            </View>

            <View style={{ width: '100%', gap: theme.spacing.xs, marginTop: 'auto' }}>
              <Button label={t('hydration.logCta')} onPress={() => navigation.navigate('HydrationLog')} />
              <Button label={t('hydration.historyCta')} variant="secondary" onPress={() => navigation.navigate('HydrationHistory')} />
              <Button label={t('hydration.settingsCta')} variant="ghost" onPress={() => navigation.navigate('HydrationSettings')} />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
