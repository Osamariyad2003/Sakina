import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { StepDots } from '../components/CheckerBits';
import { useCheckerStore } from '../state/useCheckerStore';
import type { CheckerMethod } from '../models/checkerContent';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'SymptomCheckMethod'>;

/**
 * Step 1 — "How do you want your symptoms checked?" Manual vs AI Chatbot.
 * Structure follows the SH Freud method frame; styling is 100% Sakina
 * tokens/primitives.
 */
export function SymptomCheckMethodScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const method = useCheckerStore((s) => s.method);
  const setMethod = useCheckerStore((s) => s.setMethod);

  const Option = ({ value, title, body }: { value: CheckerMethod; title: string; body: string }) => {
    const selected = method === value;
    return (
      <Card
        onPress={() => setMethod(value)}
        elevation="md"
        style={{ borderWidth: 1.5, borderColor: selected ? theme.colors.brand.primary : theme.colors.border.subtle, gap: theme.spacing.xxs }}
      >
        <AppText variant="titleMd">{title}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {body}
        </AppText>
      </Card>
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <StepDots current={0} />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('checker.methodTitle')}
        </AppText>

        <Option value="manual" title={t('checker.manualTitle')} body={t('checker.manualBody')} />
        <Option value="chatbot" title={t('checker.chatbotTitle')} body={t('checker.chatbotBody')} />

        <View style={{ marginTop: 'auto' }}>
          <Button
            label={t('checker.continue')}
            onPress={() => navigation.navigate(method === 'manual' ? 'SymptomSelect' : 'CheckerChatbot')}
          />
        </View>
      </View>
    </Screen>
  );
}
