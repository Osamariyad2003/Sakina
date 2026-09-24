import React, { useRef } from 'react';
import { View } from 'react-native';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, BottomSheet, SegmentedControl } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { Sparkline } from './Sparkline';
import { useSetStressLevelMutation } from '../state/useHomeQueries';
import { stressLevelOptions, trackerMeta, type StressLevel, type TrackerSignal } from '../models/homeContent';

interface StressLevelRowProps {
  signal: TrackerSignal;
}

/**
 * Structure: the reference's "Stress Level (segmented meter)" tracker row
 * — reframed per this feature's rule 3: **user-set, not measured**. Unlike
 * the other tracker rows, this one is tappable — it opens a small sheet
 * with a plain 3-option picker (`SegmentedControl`, reused from the Mood
 * check-in pattern). Nothing in the app ever sets this automatically; no
 * measurement, no inference, no AI-detected "risk level."
 * Styling: theme.spacing/theme.colors + our extended `accent.stress`
 * token ("Botanical & warm," confirmed with the product owner) +
 * Card/AppText/BottomSheet/SegmentedControl — no reference values.
 */
export function StressLevelRow({ signal }: StressLevelRowProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const setLevel = useSetStressLevelMutation();
  const meta = trackerMeta.stressLevel;
  const currentOption = stressLevelOptions.find((o) => o.level === signal.level);

  return (
    <>
      <Card onPress={() => sheetRef.current?.expand()} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Ionicons name={meta.icon} size={22} color={theme.colors.accent.stress} />
        <View style={{ flexShrink: 1 }}>
          <AppText variant="label">{t('home.tracker.stressLevelLabel')}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {currentOption ? (isArabic ? currentOption.labelAr : currentOption.labelEn) : t('home.tracker.stressLevelUnset')}
          </AppText>
        </View>
        <Sparkline points={signal.sparkline} />
      </Card>

      <BottomSheet ref={sheetRef} snapPoints={['32%']}>
        <AppText variant="titleMd">{t('home.tracker.stressLevelPrompt')}</AppText>
        <View style={{ marginTop: theme.spacing.md }}>
          <SegmentedControl
            segments={stressLevelOptions.map((o) => ({ key: o.level, label: isArabic ? o.labelAr : o.labelEn }))}
            value={signal.level ?? ''}
            onChange={(key) => {
              setLevel.mutate(key as StressLevel, { onSuccess: () => sheetRef.current?.close() });
            }}
          />
        </View>
      </BottomSheet>
    </>
  );
}
