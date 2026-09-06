import React from 'react';
import { ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { introHighlights } from '../models/onboardingContent';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Introduction'>;

/**
 * Structure: "frame product intent" / intro slides (screen inventory).
 * Rendered as a headline + 3 compact highlight cards (one per core module)
 * rather than a swipeable carousel — the calmer, simpler option per the
 * task's own guardrail when a layout choice isn't otherwise determined.
 * Figma reference inaccessible to this pass (no editor permission — see
 * ASSUMPTIONS.md); structure comes from our own screen inventory instead.
 * Styling: 100% theme.spacing/theme.colors + Screen/AppText/Card/Button —
 * no values taken from Figma.
 */
export function IntroductionScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md, flexGrow: 1 }}>
        <AppText variant="displayMd">{t('onboarding.introTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('onboarding.introBody')}
        </AppText>

        <View style={{ gap: theme.spacing.sm }}>
          {introHighlights.map((highlight) => (
            <Card key={highlight.id}>
              <AppText variant="titleMd">{isArabic ? highlight.titleAr : highlight.titleEn}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
                {isArabic ? highlight.bodyAr : highlight.bodyEn}
              </AppText>
            </Card>
          ))}
        </View>

        <View style={{ gap: theme.spacing.xs, marginTop: 'auto' }}>
          <Button label={t('common.next')} onPress={() => navigation.navigate('Goals')} />
          <Button label={t('common.skip')} variant="ghost" onPress={() => navigation.navigate('Goals')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
