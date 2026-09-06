import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, SegmentedControl, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { ProgressBar, HumanRatio, TherapistCard, NonDiagnosticNote } from '../components/CheckerBits';
import { severityColor } from '../components/checkerColors';
import { getCondition, therapistDirectory } from '../models/checkerContent';
import type { CompanionStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<CompanionStackParamList, 'ConditionDetail'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Condition detail — Details / Treatment tabs: an illustrative "risk factor"
 * score, severity, symptoms, likelihood, how-common viz, treatment options,
 * read-only therapist suggestions, and key highlights. Always under the
 * non-diagnostic note. Structure follows the SH Freud detail frame; styling
 * is 100% Sakina tokens/primitives.
 */
export function ConditionDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const [tab, setTab] = useState<'details' | 'treatment'>('details');
  const condition = getCondition(route.params.conditionId);

  if (!condition) {
    return (
      <Screen>
        <EmptyState title={t('checker.conditionNotFound')} />
      </Screen>
    );
  }

  const symptoms = isArabic ? condition.symptomsAr : condition.symptomsEn;
  const treatments = isArabic ? condition.treatmentsAr : condition.treatmentsEn;
  const highlights = isArabic ? condition.highlightsAr : condition.highlightsEn;

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? condition.nameAr : condition.nameEn}</AppText>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'center' }}>
          <View style={{ paddingHorizontal: theme.spacing.xs, paddingVertical: theme.spacing.xxs, borderRadius: theme.radius.pill, backgroundColor: severityColor(theme, condition.severity) }}>
            <AppText variant="caption" color={theme.colors.text.onBrand}>
              {t(`checker.severity.${condition.severity}`)}
            </AppText>
          </View>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {isArabic ? condition.shortAr : condition.shortEn}
          </AppText>
        </View>

        <SegmentedControl
          segments={[
            { key: 'details', label: t('checker.tabDetails') },
            { key: 'treatment', label: t('checker.tabTreatment') },
          ]}
          value={tab}
          onChange={(k) => setTab(k as 'details' | 'treatment')}
        />

        <NonDiagnosticNote />

        {tab === 'details' ? (
          <>
            <Card style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
              <AppText variant="label" color={theme.colors.text.secondary}>
                {t('checker.riskFactor')}
              </AppText>
              <AppText variant="displayLg" color={severityColor(theme, condition.severity)}>
                {condition.riskFactor.toFixed(1)}
              </AppText>
              <AppText variant="bodyStrong">{t(`checker.severity.${condition.severity}`)}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
                {t('checker.riskFactorHint')}
              </AppText>
            </Card>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.description')}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {isArabic ? condition.descriptionAr : condition.descriptionEn}
              </AppText>
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.symptomsSection')}</AppText>
              {symptoms.map((s) => (
                <View key={s} style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'flex-start' }}>
                  <Ionicons name="ellipse" size={8} color={theme.colors.brand.primary} style={{ marginTop: 7 }} />
                  <AppText variant="body" style={{ flex: 1 }}>
                    {s}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.likelihood')}</AppText>
              <ProgressBar value={condition.riskFactor / 100} color={severityColor(theme, condition.severity)} />
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.howCommon')}</AppText>
              <AppText variant="body" color={theme.colors.text.secondary}>
                {t('checker.howCommonBody', { count: condition.commonPerTen })}
              </AppText>
              <HumanRatio perTen={condition.commonPerTen} />
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.keyHighlights')}</AppText>
              {highlights.map((h) => (
                <View key={h} style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'flex-start' }}>
                  <Ionicons name="sparkles-outline" size={16} color={theme.colors.brand.primary} style={{ marginTop: 3 }} />
                  <AppText variant="body" style={{ flex: 1 }}>
                    {h}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.treatmentSection')}</AppText>
              {treatments.map((tr) => (
                <View key={tr} style={{ flexDirection: 'row', gap: theme.spacing.xs, alignItems: 'flex-start' }}>
                  <Ionicons name="checkmark-circle" size={18} color={theme.colors.status.success} />
                  <AppText variant="body" style={{ flex: 1 }}>
                    {tr}
                  </AppText>
                </View>
              ))}
            </View>

            <Card style={{ backgroundColor: theme.colors.status.error, gap: theme.spacing.xxs }}>
              <AppText variant="titleMd" color={theme.colors.text.onBrand}>
                {t('checker.seeTherapistTitle')}
              </AppText>
              <AppText variant="caption" color={theme.colors.text.onBrand}>
                {t('checker.seeTherapistBody')}
              </AppText>
            </Card>

            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="titleMd">{t('checker.availableTherapists')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('checker.therapistsReadOnly')}
              </AppText>
              {therapistDirectory.map((th) => (
                <TherapistCard key={th.id} therapist={th} />
              ))}
            </View>
          </>
        )}

        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
          <Button label={t('checker.consultChatbot')} onPress={() => navigation.navigate('CheckerChatbot')} />
          <Button label={t('checker.retakeTest')} variant="secondary" onPress={() => navigation.navigate('SymptomCheckMethod')} />
          <Button label={t('checker.openSafety')} variant="ghost" onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })} />
        </View>
      </ScrollView>
    </Screen>
  );
}
