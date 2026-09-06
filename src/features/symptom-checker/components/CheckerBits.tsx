import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText, Card, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { matchColor, severityColor } from './checkerColors';
import { getCondition, type ConditionMatch, type Severity, type TherapistContent } from '../models/checkerContent';

/** Three-step progress indicator (Step 1/2/3), current filled, done checked. */
export function StepDots({ current, total = 3 }: { current: number; total?: number }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        {Array.from({ length: total }, (_, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={i}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done || active ? theme.colors.status.success : theme.colors.border.subtle,
                }}
              >
                {done ? <Ionicons name="checkmark" size={14} color={theme.colors.text.onBrand} /> : null}
              </View>
              {i < total - 1 ? (
                <View style={{ flex: 1, height: 2, backgroundColor: i < current ? theme.colors.status.success : theme.colors.border.subtle }} />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
        {t('checker.step', { n: current + 1 })}
      </AppText>
    </View>
  );
}

/** A left-anchored progress bar (0-1) — RN flips it to right-anchored under RTL automatically. */
export function ProgressBar({ value, color }: { value: number; color: string }) {
  const theme = useTheme();
  return (
    <View style={{ height: 8, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.subtle, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color }} />
    </View>
  );
}

/** "Symptom checker finding score" — more inputs → more accurate (illustrative). */
export function FindingScoreBar({ score }: { score: number }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.xxs }}>
      <AppText variant="label" style={{ textAlign: 'center' }}>
        {t('checker.findingScore')}
      </AppText>
      <ProgressBar value={score} color={theme.colors.accent.steps} />
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
        {t('checker.findingScoreHint')}
      </AppText>
    </View>
  );
}

/** The non-diagnostic disclaimer — shown on every results/detail surface. */
export function NonDiagnosticNote() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Card style={{ backgroundColor: theme.colors.brand.accent, flexDirection: 'row', gap: theme.spacing.sm }}>
      <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.onBrand} />
      <AppText variant="caption" color={theme.colors.text.onBrand} style={{ flex: 1 }}>
        {t('checker.disclaimer')}
      </AppText>
    </Card>
  );
}

/** A prominent supportive-support card shown whenever risk is flagged. */
export function RiskSupportCard({ onOpenSafety }: { onOpenSafety: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Card style={{ backgroundColor: theme.colors.status.error, gap: theme.spacing.xs }}>
      <AppText variant="titleMd" color={theme.colors.text.onBrand}>
        {t('checker.riskTitle')}
      </AppText>
      <AppText variant="body" color={theme.colors.text.onBrand}>
        {t('checker.riskBody')}
      </AppText>
      <Button label={t('checker.riskCta')} variant="secondary" onPress={onOpenSafety} />
    </Card>
  );
}

export function ConditionResultCard({ match, onPress }: { match: ConditionMatch; onPress: () => void }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const condition = getCondition(match.conditionId);
  if (!condition) return null;

  return (
    <Card onPress={onPress} style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <AppText variant="titleMd" style={{ flex: 1 }}>
          {isArabic ? condition.nameAr : condition.nameEn}
        </AppText>
        <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={18} color={theme.colors.text.secondary} />
      </View>
      <ProgressBar value={match.score} color={matchColor(theme, match.strength)} />
      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <AppText variant="caption" color={matchColor(theme, match.strength)}>
          {t(`checker.match.${match.strength}`)}
        </AppText>
        <AppText variant="caption" color={severityColor(theme, condition.severity)}>
          {t(`checker.severity.${condition.severity}`)}
        </AppText>
      </View>
    </Card>
  );
}

export function TherapistCard({ therapist }: { therapist: TherapistContent }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="person" size={22} color={theme.colors.text.onBrand} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
          <AppText variant="bodyStrong">{therapist.name}</AppText>
          {therapist.verified ? <Ionicons name="checkmark-circle" size={14} color={theme.colors.status.success} /> : null}
        </View>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {isArabic ? therapist.specialtyAr : therapist.specialtyEn} · {t('checker.km', { km: therapist.distanceKm })}
        </AppText>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          ⭐ {therapist.rating.toFixed(1)} · {t('checker.reviews', { count: therapist.reviews })}
        </AppText>
      </View>
    </Card>
  );
}

/** "N out of 10 people" — a row of ten person glyphs, N filled. */
export function HumanRatio({ perTen }: { perTen: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Ionicons
          key={i}
          name="person"
          size={22}
          color={i < perTen ? theme.colors.brand.primaryDark : theme.colors.border.default}
        />
      ))}
    </View>
  );
}
