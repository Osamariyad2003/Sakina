import React from 'react';
import { View, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { ConditionResultCard, NonDiagnosticNote, RiskSupportCard } from '../components/CheckerBits';
import { useCheckerStore } from '../state/useCheckerStore';
import { flagsRisk } from '../services/checkerService';
import { rankConditions, symptomsFromEmotion } from '../models/checkerContent';
import type { CompanionStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<CompanionStackParamList, 'SymptomResults'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * "Your Possible Conditions" — ranked matches from the deterministic
 * heuristic, always under the non-diagnostic note and (if risk was flagged)
 * a prominent route to real Safety support. Structure follows the SH Freud
 * results frame; styling is 100% Sakina tokens/primitives.
 */
export function SymptomResultsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const store = useCheckerStore();

  const symptomIds = Array.from(
    new Set([...store.symptomIds, ...store.physicalSymptomIds, ...symptomsFromEmotion(store.emotionId)]),
  );
  const matches = rankConditions(symptomIds).filter((m) => m.score > 0);
  const freeText = [store.moodDescription, store.reasonText, store.selfHarmText].filter(Boolean).join(' ');
  const risk = flagsRisk({ freeText });

  const openSafety = () => navigation.navigate('ProfileTab', { screen: 'Safety' });

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('checker.resultsTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('checker.resultsSubtitle')}
        </AppText>

        {risk ? <RiskSupportCard onOpenSafety={openSafety} /> : null}
        <NonDiagnosticNote />

        <Card style={{ backgroundColor: theme.colors.brand.primaryDark, flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('checker.activeSymptomsCount', { count: symptomIds.length })}
          </AppText>
        </Card>

        {matches.length === 0 ? (
          <EmptyState title={t('checker.resultsEmptyTitle')} description={t('checker.resultsEmptyBody')} />
        ) : (
          matches.map((match) => (
            <ConditionResultCard
              key={match.conditionId}
              match={match}
              onPress={() => navigation.navigate('ConditionDetail', { conditionId: match.conditionId })}
            />
          ))
        )}

        <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
          <Button label={t('checker.complete')} onPress={() => navigation.navigate('CheckerSessionComplete')} />
          <Button label={t('checker.retakeTest')} variant="ghost" onPress={() => navigation.navigate('SymptomCheckMethod')} />
        </View>
      </ScrollView>
    </Screen>
  );
}
