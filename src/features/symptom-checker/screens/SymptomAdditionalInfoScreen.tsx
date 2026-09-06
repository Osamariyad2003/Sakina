import React, { useState } from 'react';
import { View, ScrollView, Switch, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, TextField, TextArea, Chip, SegmentedControl } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { StepDots } from '../components/CheckerBits';
import { useCheckerStore } from '../state/useCheckerStore';
import { symptomCatalog, conditionCatalog, medicationCatalog, emotionFaces } from '../models/checkerContent';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'SymptomAdditionalInfo'>;

/**
 * Step 3 — "Our AI still needs information": medications, the symptom that
 * bothers you most, a current/past condition, pain level, current emotion, a
 * mood description, and the share-to-chatbot toggle. Structure follows the SH
 * Freud info frame; styling is 100% Sakina tokens/primitives. Free-text is
 * risk-scanned downstream (see the Analyzing/Results screens).
 */
export function SymptomAdditionalInfoScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const store = useCheckerStore();
  const [medQuery, setMedQuery] = useState('');

  const medResults = medicationCatalog.filter((m) => m.label.toLowerCase().includes(medQuery.trim().toLowerCase()));
  const activeSymptomOptions = symptomCatalog.filter((s) => store.symptomIds.includes(s.id));

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <StepDots current={2} />
        <AppText variant="displayMd" style={{ textAlign: 'center' }}>
          {t('checker.infoTitle')}
        </AppText>
        <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('checker.infoSubtitle')}
        </AppText>

        {/* Medications */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.currentMedications')}</AppText>
          <TextField
            placeholder={t('checker.medicationSearch')}
            value={medQuery}
            onChangeText={setMedQuery}
            right={<Ionicons name="search" size={18} color={theme.colors.text.secondary} />}
          />
          {store.medicationIds.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {store.medicationIds.map((id) => {
                const med = medicationCatalog.find((m) => m.id === id);
                return (
                  <Chip key={id} label={med?.label ?? id} selected onPress={() => store.toggleMedication(id)} />
                );
              })}
            </View>
          ) : null}
          {medQuery.length > 0
            ? medResults.slice(0, 4).map((m) => (
                <Card key={m.id} onPress={() => store.toggleMedication(m.id)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText variant="body">{m.label}</AppText>
                  <Ionicons name={store.medicationIds.includes(m.id) ? 'checkmark-circle' : 'add'} size={20} color={theme.colors.brand.primary} />
                </Card>
              ))
            : null}
        </View>

        {/* Symptom that bothers most */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.botherMost')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {activeSymptomOptions.map((s) => (
              <Chip
                key={s.id}
                label={isArabic ? s.labelAr : s.labelEn}
                selected={store.botherSymptomId === s.id}
                onPress={() => store.set({ botherSymptomId: store.botherSymptomId === s.id ? null : s.id })}
              />
            ))}
          </View>
        </View>

        {/* Current / past condition */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.currentCondition')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {conditionCatalog.map((c) => (
              <Chip
                key={c.id}
                label={isArabic ? c.nameAr : c.nameEn}
                selected={store.conditionId === c.id}
                onPress={() => store.set({ conditionId: store.conditionId === c.id ? null : c.id })}
              />
            ))}
          </View>
        </View>

        {/* Pain level */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.painLevel')}</AppText>
          <SegmentedControl
            segments={[1, 2, 3, 4, 5].map((n) => ({ key: String(n), label: String(n) }))}
            value={String(store.painLevel)}
            onChange={(k) => store.set({ painLevel: Number(k) })}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" color={theme.colors.text.secondary}>{t('checker.painLow')}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary}>{t('checker.painHigh')}</AppText>
          </View>
        </View>

        {/* Current emotion */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.currentEmotion')}</AppText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {emotionFaces.map((f) => {
              const selected = store.emotionId === f.id;
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="button"
                  onPress={() => store.set({ emotionId: f.id })}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? theme.colors.accent.sleep : theme.colors.background.surface,
                    borderWidth: 1,
                    borderColor: selected ? theme.colors.accent.sleep : theme.colors.border.default,
                  }}
                >
                  <AppText style={{ fontSize: 24 }}>{f.emoji}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Mood description */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.moodDescribe')}</AppText>
          <TextArea
            placeholder={t('checker.moodDescribePlaceholder')}
            value={store.moodDescription}
            onChangeText={(v) => store.set({ moodDescription: v })}
            minLines={3}
            maxLength={500}
          />
        </View>

        {/* Reason */}
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="label">{t('checker.reason')}</AppText>
          <TextArea
            placeholder={t('checker.reasonPlaceholder')}
            value={store.reasonText}
            onChangeText={(v) => store.set({ reasonText: v })}
            minLines={3}
            maxLength={500}
          />
        </View>

        {/* Share toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingEnd: theme.spacing.sm }}>
            <AppText variant="body">{t('checker.shareToChatbot')}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('checker.shareToChatbotHint')}
            </AppText>
          </View>
          <Switch
            value={store.shareToChatbot}
            onValueChange={(v) => store.set({ shareToChatbot: v })}
            trackColor={{ true: theme.colors.brand.primary, false: theme.colors.border.default }}
            thumbColor={theme.colors.background.surface}
          />
        </View>

        <Button label={t('checker.continue')} onPress={() => navigation.navigate('SymptomAnalyzing')} />
      </ScrollView>
    </Screen>
  );
}
