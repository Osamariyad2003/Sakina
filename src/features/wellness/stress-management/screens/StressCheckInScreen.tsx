import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Screen, AppText, Chip, Button, TextArea, SegmentedControl } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { AnimatedLottie } from '../../../../ui/lottie';
import { triggerCatalog } from '../../../mood/models/moodContent';
import { stressLevelOptions } from '../models/stressContent';
import { useCreateStressEntryMutation } from '../state/useStressCheckInQueries';
import type { StressLevel } from '../../../../types/models';
import type { WellnessStackParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = NativeStackScreenProps<WellnessStackParamList, 'StressCheckIn'>;

/**
 * Stress check-in — a single-screen quick entry (level + optional trigger
 * tags + optional note), deliberately lighter than Mood's multi-step flow
 * per Feature 2's own brief ("quick entry"). Same interaction *pattern* as
 * Mood otherwise: SegmentedControl for level (reused from Home's quick-set
 * widget), Chip multi-select for triggers (the same `triggerCatalog` Mood
 * uses — "work/sleep/relationships" etc. are the same reasons either way),
 * and the same Lottie confirmation Mood check-in ends with.
 */
export function StressCheckInScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const mutation = useCreateStressEntryMutation();

  const [level, setLevel] = useState<StressLevel>('medium');
  const [triggerIds, setTriggerIds] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const save = () => {
    mutation.mutate(
      { level, triggerIds, note: note.trim() || undefined },
      { onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}) },
    );
  };

  if (mutation.isSuccess) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <AnimatedLottie
            source={require('../../../../../assets/lottie/celebrate.json')}
            loop={false}
            style={{ width: 140, height: 140 }}
            fallback={<AppText variant="displayLg">🌿</AppText>}
          />
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('stressCheckIn.savedTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('stressCheckIn.savedBody')}
          </AppText>
          <Button label={t('stressCheckIn.greatThanks')} onPress={() => navigation.navigate('StressOverview')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md, flexGrow: 1 }}>
        <AppText variant="displayMd">{t('stressCheckIn.levelTitle')}</AppText>

        <SegmentedControl
          segments={stressLevelOptions.map((o) => ({ key: o.level, label: isArabic ? o.labelAr : o.labelEn }))}
          value={level}
          onChange={(k) => setLevel(k as StressLevel)}
        />

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('stressCheckIn.triggerQuestion')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('stressCheckIn.optionalHint')}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {triggerCatalog.map((trigger) => (
              <Chip
                key={trigger.id}
                label={isArabic ? trigger.labelAr : trigger.labelEn}
                selected={triggerIds.includes(trigger.id)}
                onPress={() =>
                  setTriggerIds((ids) => (ids.includes(trigger.id) ? ids.filter((x) => x !== trigger.id) : [...ids, trigger.id]))
                }
              />
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('stressCheckIn.noteQuestion')}</AppText>
          <TextArea placeholder={t('stressCheckIn.notePlaceholder')} value={note} onChangeText={setNote} minLines={3} maxLength={500} />
        </View>

        {mutation.isError ? (
          <AppText variant="caption" color={theme.colors.status.error}>
            {errorText(mutation.error, t)}
          </AppText>
        ) : null}

        <View style={{ marginTop: 'auto', paddingBottom: theme.spacing.lg }}>
          <Button label={t('stressCheckIn.saveCta')} onPress={save} loading={mutation.isPending} />
        </View>
      </ScrollView>
    </Screen>
  );
}
