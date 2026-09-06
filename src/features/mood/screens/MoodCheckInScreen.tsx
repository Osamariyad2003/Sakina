import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Screen, AppText, Chip, Button, TextArea, SegmentedControl } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { AnimatedLottie } from '../../../ui/lottie';
import { ScaleSelector } from '../components/ScaleSelector';
import { MoodCurve } from '../components/MoodCurve';
import { moodColor } from '../components/moodColors';
import { moodLevels, companionCatalog, metricScales } from '../models/moodContent';
import { useCreateMoodEntryMutation } from '../state/useMoodQueries';
import type { MoodLevel, MoodMetrics } from '../../../types/models';
import type { AppError } from '../../../core/errors';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodCheckIn'>;

type Step = 'mood' | 'why' | 'who' | 'where';
const steps: Step[] = ['mood', 'why', 'who', 'where'];

/**
 * Mood check-in — the SH Freud flow: pick a mood (full-bleed, mood-colored) →
 * "why do you feel…" self-report scales + note → "who are you with?" →
 * "where are you?" (a typed place, never GPS) → completion. Styling is 100%
 * Sakina tokens/primitives; the mood-colored selector uses `moodColor`
 * (accent tokens), never Figma hexes.
 */
export function MoodCheckInScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const mutation = useCreateMoodEntryMutation();

  const [stepIndex, setStepIndex] = useState(0);
  // Home's inline emoji row passes the mood the user already tapped, so that
  // first choice isn't thrown away when the full flow opens.
  const [mood, setMood] = useState<MoodLevel>(route.params?.initialMood ?? 'neutral');
  const [scores, setScores] = useState<{ active: number; eat: number; stress: number }>({ active: 5, eat: 5, stress: 5 });
  const [sleepQuality, setSleepQuality] = useState<'bad' | 'ok' | 'good'>('ok');
  const [note, setNote] = useState('');
  const [companionIds, setCompanionIds] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState('');

  const step = steps[stepIndex];
  const moodOption = moodLevels.find((m) => m.level === mood)!;
  const moodIndex = moodLevels.findIndex((m) => m.level === mood);

  const save = () => {
    const metrics: MoodMetrics = { active: scores.active, eat: scores.eat, stress: scores.stress, sleepQuality };
    mutation.mutate(
      {
        mood,
        emotionIds: [],
        triggerIds: [],
        note: note.trim() || undefined,
        companionIds,
        locationLabel: locationLabel.trim() || undefined,
        metrics,
      },
      {
        onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
      },
    );
  };

  // --- Completion -----------------------------------------------------------
  if (mutation.isSuccess) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <AnimatedLottie
            source={require('../../../../assets/lottie/moodConfirm.json')}
            loop={false}
            style={{ width: 96, height: 96 }}
            fallback={<AppText style={{ fontSize: 48 }}>{moodOption.emoji}</AppText>}
          />
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {t('mood.checkInCompletedTitle')}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {t('mood.checkInCompletedBody')}
          </AppText>
          <Button label={t('mood.greatThanks')} onPress={() => navigation.navigate('MoodHome')} />
        </View>
      </Screen>
    );
  }

  // --- Step 1: mood selector (full-bleed, mood-colored) ---------------------
  if (step === 'mood') {
    return (
      <Screen style={{ backgroundColor: moodColor(theme, mood) }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}>
          <AppText variant="displayMd" color={theme.colors.text.onBrand} style={{ textAlign: 'center' }}>
            {t('mood.howAreYouToday')}
          </AppText>
          <AppText style={{ fontSize: 96 }}>{moodOption.emoji}</AppText>
          <AppText variant="titleLg" color={theme.colors.text.onBrand}>
            {t('mood.imFeeling', { mood: isArabic ? moodOption.labelAr : moodOption.labelEn })}
          </AppText>
          <MoodCurve selectedIndex={moodIndex} color={theme.colors.text.onBrand} />
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {moodLevels.map((m) => (
              <AppText
                key={m.level}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  setMood(m.level);
                }}
                style={{ fontSize: 30, opacity: m.level === mood ? 1 : 0.55 }}
              >
                {m.emoji}
              </AppText>
            ))}
          </View>
        </View>
        <View style={{ gap: theme.spacing.xs, paddingBottom: theme.spacing.md }}>
          <Button label={t('mood.setMood')} variant="secondary" onPress={() => setStepIndex(1)} />
          <Button label={t('common.cancel')} variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
  }

  // --- Steps 2-4 ------------------------------------------------------------
  return (
    <Screen edges={['top']} padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md, flexGrow: 1 }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xxs }}>
            {steps.map((s, i) => (
              <View
                key={s}
                style={{
                  flex: 1,
                  height: theme.spacing.xxs,
                  borderRadius: theme.radius.pill,
                  backgroundColor: i <= stepIndex ? theme.colors.brand.primary : theme.colors.border.subtle,
                }}
              />
            ))}
          </View>

          {step === 'why' ? (
            <>
              <AppText variant="displayMd">{t('mood.whyTitle', { mood: isArabic ? moodOption.labelAr : moodOption.labelEn })}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('mood.whySubtitle')}
              </AppText>

              {metricScales.map((scale) => (
                <View key={scale.key} style={{ gap: theme.spacing.xs }}>
                  <AppText variant="label">{isArabic ? scale.labelAr : scale.labelEn}</AppText>
                  <ScaleSelector
                    value={scores[scale.key]}
                    onChange={(v) => setScores((s) => ({ ...s, [scale.key]: v }))}
                  />
                </View>
              ))}

              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="label">{t('mood.sleepQuestion')}</AppText>
                <SegmentedControl
                  segments={[
                    { key: 'bad', label: t('mood.sleepBad') },
                    { key: 'ok', label: t('mood.sleepOk') },
                    { key: 'good', label: t('mood.sleepGood') },
                  ]}
                  value={sleepQuality}
                  onChange={(k) => setSleepQuality(k as 'bad' | 'ok' | 'good')}
                />
              </View>

              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="label">{t('mood.additionalNotes')}</AppText>
                <TextArea placeholder={t('mood.notePlaceholder')} value={note} onChangeText={setNote} minLines={3} maxLength={500} />
              </View>
            </>
          ) : null}

          {step === 'who' ? (
            <>
              <AppText variant="displayMd">{t('mood.whoTitle')}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('mood.whoSubtitle')}
              </AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
                {companionCatalog.map((c) => (
                  <Chip
                    key={c.id}
                    label={isArabic ? c.labelAr : c.labelEn}
                    icon={<Ionicons name={c.icon as keyof typeof Ionicons.glyphMap} size={16} color={companionIds.includes(c.id) ? theme.colors.text.onBrand : theme.colors.text.primary} />}
                    selected={companionIds.includes(c.id)}
                    onPress={() =>
                      setCompanionIds((ids) => (ids.includes(c.id) ? ids.filter((x) => x !== c.id) : [...ids, c.id]))
                    }
                  />
                ))}
              </View>
            </>
          ) : null}

          {step === 'where' ? (
            <>
              <AppText variant="displayMd">{t('mood.whereTitle')}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('mood.whereSubtitle')}
              </AppText>
              <TextArea
                placeholder={t('mood.wherePlaceholder')}
                value={locationLabel}
                onChangeText={setLocationLabel}
                minLines={2}
                maxLength={120}
              />
            </>
          ) : null}

          {mutation.isError ? (
            <AppText variant="caption" color={theme.colors.status.error}>
              {(mutation.error as AppError).message}
            </AppText>
          ) : null}

          <View style={{ marginTop: 'auto', gap: theme.spacing.xs, paddingBottom: theme.spacing.lg }}>
            {step === 'where' ? (
              <Button label={t('mood.checkInCompleteCta')} onPress={save} loading={mutation.isPending} />
            ) : (
              <Button label={t('common.next')} onPress={() => setStepIndex((i) => i + 1)} />
            )}
            <Button label={t('common.back')} variant="ghost" onPress={() => setStepIndex((i) => i - 1)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
