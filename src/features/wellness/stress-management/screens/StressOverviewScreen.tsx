import React from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SkeletonList, ErrorState, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import { useStressTechniquesQuery } from '../state/useStressQueries';
import { quickReliefTechniqueId } from '../models/stressContent';
import { ExerciseCard } from '../../components/ExerciseCard';
import type { WellnessStackParamList, AppTabsParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = CompositeScreenProps<
  NativeStackScreenProps<WellnessStackParamList, 'StressOverview'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Structure: promoted Wellness "Stress Relief" category, per the prompt's
 * own Feature definition item 1 — header + supportive intro, a quick-relief
 * shortcut, the technique list, and a supportive Safety link. The Figma
 * frame for this flow (SH Freud UI Kit v1.7, node 504-5922) was
 * inaccessible to this pass (no editor permission — see ASSUMPTIONS.md), so
 * this structure comes from the prompt's own Feature definition instead.
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Card/Button/
 * SkeletonList/ErrorState/EmptyState/ExerciseCard — no values from Figma.
 */
export function StressOverviewScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useStressTechniquesQuery();

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View>
          <AppText variant="displayMd">{t('stressManagement.title')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
            {t('stressManagement.intro')}
          </AppText>
        </View>

        <Card
          onPress={() => navigation.navigate('StressActiveSession', { techniqueId: quickReliefTechniqueId })}
          style={{ backgroundColor: theme.colors.brand.primary, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          {/* Decorative — never phase-synced to a real breathing pattern (that precision lives in BreathingVisualizer's Reanimated pulse); just a quiet loop suggesting "breathe" on this shortcut. */}
          <AnimatedLottie
            source={require('../../../../../assets/lottie/breathe.json')}
            style={{ width: 48, height: 48 }}
            fallback={<AppText style={{ fontSize: 32 }}>🌬️</AppText>}
          />
          <View style={{ flex: 1 }}>
            <AppText variant="titleMd" color={theme.colors.text.onBrand}>
              {t('stressManagement.quickReliefTitle')}
            </AppText>
            <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
              {t('stressManagement.quickReliefCta')}
            </AppText>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          <Button
            label={t('stressManagement.logStressCta')}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('StressCheckIn')}
          />
          <Button
            label={t('stressManagement.viewHistoryCta')}
            variant="ghost"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('StressHistory')}
          />
        </View>

        <View style={{ flex: 1 }}>
          {query.isLoading ? (
            <SkeletonList rows={4} />
          ) : query.isError ? (
            <ErrorState message={errorText(query.error, t)} onRetry={() => query.refetch()} />
          ) : (query.data ?? []).length === 0 ? (
            <EmptyState title={t('stressManagement.emptyTitle')} description={t('stressManagement.emptyBody')} />
          ) : (
            <FlashList
              data={query.data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ marginBottom: theme.spacing.sm }}>
                  <ExerciseCard
                    exercise={item}
                    onPress={() => navigation.navigate('StressTechniqueDetail', { techniqueId: item.id })}
                  />
                </View>
              )}
            />
          )}
        </View>

        <View style={{ gap: theme.spacing.xxs }}>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('stressManagement.safetyPrompt')}
          </AppText>
          <Button
            label={t('stressManagement.safetyLinkCta')}
            variant="ghost"
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          />
        </View>
      </View>
    </Screen>
  );
}
