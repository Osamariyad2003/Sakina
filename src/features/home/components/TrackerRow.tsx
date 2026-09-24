import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { Sparkline } from './Sparkline';
import { trackerMeta, type TrackerSignal } from '../models/homeContent';

interface TrackerRowProps {
  signal: TrackerSignal;
}

/**
 * Structure: reference's tracker-row pattern (icon · label · sub-value ·
 * mini sparkline) — populated with our real signals (mood streak,
 * check-ins, mindful minutes, journaling streak), never invented
 * biometrics. Self-reported Stress Level is a separate `StressLevelRow`
 * (tap-to-set interaction, not a plain display row). See ASSUMPTIONS.md.
 * Styling: theme.spacing/theme.colors + our extended `accent.*` tokens
 * ("Botanical & warm," confirmed with the product owner) + Card/AppText —
 * no reference values.
 */
export function TrackerRow({ signal }: TrackerRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const meta = trackerMeta[signal.key];
  const accentColor =
    signal.key === 'wellnessMinutes'
      ? theme.colors.accent.mindful
      : signal.key === 'journalingStreak'
        ? theme.colors.accent.journaling
        : theme.colors.accent.mood; // moodStreak / checkIns

  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <Ionicons name={meta.icon} size={20} color={accentColor} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <AppText variant="label">{t(`home.tracker.${signal.key}Label`)}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t(`home.tracker.${signal.key}Value`, { count: signal.value })}
        </AppText>
      </View>
      <Sparkline points={signal.sparkline} />
    </Card>
  );
}
