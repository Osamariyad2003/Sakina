import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, TextField } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { StepDots, FindingScoreBar } from '../components/CheckerBits';
import { useCheckerStore } from '../state/useCheckerStore';
import { symptomCatalog, findingScore } from '../models/checkerContent';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'SymptomSelect'>;

/**
 * Step 2 — "What are your symptoms?" search + active-symptom chips + the
 * finding-score bar. Structure follows the SH Freud symptoms frame; styling
 * is 100% Sakina tokens/primitives.
 */
export function SymptomSelectScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const symptomIds = useCheckerStore((s) => s.symptomIds);
  const toggleSymptom = useCheckerStore((s) => s.toggleSymptom);
  const [query, setQuery] = useState('');

  const label = (id: string) => {
    const s = symptomCatalog.find((x) => x.id === id);
    return s ? (isArabic ? s.labelAr : s.labelEn) : id;
  };

  const results = symptomCatalog.filter((s) => {
    const l = `${s.labelAr} ${s.labelEn}`.toLowerCase();
    return l.includes(query.trim().toLowerCase());
  });

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <StepDots current={1} />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('checker.symptomsTitle')}
        </AppText>

        <TextField
          placeholder={t('checker.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          right={<Ionicons name="search" size={18} color={theme.colors.text.secondary} />}
        />

        {symptomIds.length > 0 ? (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('checker.activeSymptoms')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {symptomIds.map((id) => (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={t('checker.remove', { label: label(id) })}
                  onPress={() => toggleSymptom(id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xxs,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    borderRadius: theme.radius.pill,
                    backgroundColor: theme.colors.brand.primary,
                  }}
                >
                  <AppText variant="label" color={theme.colors.text.onBrand}>
                    {label(id)}
                  </AppText>
                  <Ionicons name="close" size={14} color={theme.colors.text.onBrand} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <FindingScoreBar score={findingScore(symptomIds.length)} />

        <View style={{ gap: theme.spacing.xs }}>
          {results.map((s) => {
            const added = symptomIds.includes(s.id);
            return (
              <Card key={s.id} onPress={() => toggleSymptom(s.id)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="body">{isArabic ? s.labelAr : s.labelEn}</AppText>
                <Ionicons
                  name={added ? 'checkmark-circle' : 'add'}
                  size={22}
                  color={added ? theme.colors.status.success : theme.colors.brand.primary}
                />
              </Card>
            );
          })}
        </View>

        <Button
          label={t('checker.continue')}
          disabled={symptomIds.length === 0}
          onPress={() => navigation.navigate('SymptomAdditionalInfo')}
        />
      </ScrollView>
    </Screen>
  );
}
