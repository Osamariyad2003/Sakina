import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { useTherapyConversationsQuery } from '../state/useTherapyQueries';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'TherapyIntro'>;

/**
 * "Mindful AI Chatbot" intro — talk to Doctor Freud AI. Structure follows the
 * SH Freud intro frame; styling is 100% Sakina tokens/primitives. Carries the
 * non-clinical framing from the first screen.
 */
export function TherapyIntroScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const query = useTherapyConversationsQuery();
  const hasChats = (query.data ?? []).some((c) => !c.trashed);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AnimatedLottie
          source={require('../../../../assets/lottie/moodConfirm.json')}
          style={{ width: 140, height: 140 }}
          fallback={<AppText variant="displayLg">🤖</AppText>}
        />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('therapy.introTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('therapy.introSubtitle')}
        </AppText>
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('therapy.disclaimer')}
        </AppText>
      </View>
      <View style={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.md }}>
        <Button label={t('therapy.newConversation')} onPress={() => navigation.navigate('NewTherapyConversation')} />
        {hasChats ? (
          <Button label={t('therapy.myChats')} variant="secondary" onPress={() => navigation.navigate('TherapyDashboard')} />
        ) : null}
      </View>
    </Screen>
  );
}
