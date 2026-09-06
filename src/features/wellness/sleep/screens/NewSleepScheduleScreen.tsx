import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'NewSleepSchedule'>;

/**
 * "New Sleep Schedule" fork — manual setup vs AI autosuggest. Two option
 * cards then a Continue affordance, mirroring the SH Freud frame; styling is
 * 100% Sakina tokens/primitives.
 */
export function NewSleepScheduleScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [mode, setMode] = React.useState<'manual' | 'ai'>('manual');

  const OptionCard = ({ value, title, body }: { value: 'manual' | 'ai'; title: string; body: string }) => {
    const selected = mode === value;
    return (
      <Card
        onPress={() => setMode(value)}
        elevation="md"
        style={{
          borderWidth: 1.5,
          borderColor: selected ? theme.colors.brand.primary : theme.colors.border.subtle,
          gap: theme.spacing.xxs,
        }}
      >
        <AppText variant="titleMd">{title}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {body}
        </AppText>
      </Card>
    );
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('sleep.newScheduleTitle')}</AppText>

        <OptionCard value="manual" title={t('sleep.manualTitle')} body={t('sleep.manualBody')} />
        <OptionCard value="ai" title={t('sleep.aiTitle')} body={t('sleep.aiBody')} />

        <View style={{ marginTop: 'auto' }}>
          <Button
            label={t('sleep.continue')}
            onPress={() =>
              mode === 'manual' ? navigation.navigate('SleepGoal') : navigation.navigate('SleepAIAutosuggest')
            }
          />
        </View>
      </View>
    </Screen>
  );
}
