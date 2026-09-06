import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Button, SkeletonList, useToast } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useHydrationTodayQuery, useSetHydrationGoalMutation } from '../state/useHydrationQueries';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'HydrationSettings'>;

/**
 * Structure: reference's Hydration "settings/goal" screen.
 * Styling: theme.spacing/theme.colors + Screen/AppText/TextField/Button —
 * no reference values.
 */
export function HydrationSettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const query = useHydrationTodayQuery();
  const setGoal = useSetHydrationGoalMutation();
  const [value, setValue] = useState('');

  useEffect(() => {
    if (query.data) setValue(String(query.data.goalMl));
  }, [query.data]);

  const save = () => {
    const ml = parseInt(value, 10);
    if (!ml || ml <= 0) return;
    setGoal.mutate(ml, {
      onSuccess: () => {
        toast.show({ message: t('hydration.goalUpdated'), tone: 'success' });
        navigation.goBack();
      },
    });
  };

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('hydration.settingsTitle')}</AppText>
        {query.isLoading ? (
          <SkeletonList rows={1} />
        ) : (
          <TextField
            label={t('hydration.goalLabel')}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            right={<AppText color={theme.colors.text.secondary}>{t('hydration.mlUnit')}</AppText>}
          />
        )}
        <Button label={t('common.save')} onPress={save} loading={setGoal.isPending} disabled={!value} />
      </View>
    </Screen>
  );
}
