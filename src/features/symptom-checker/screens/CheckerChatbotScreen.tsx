import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, TextField, TextArea, Chip, SegmentedControl, IconButton } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { RiskSupportCard } from '../components/CheckerBits';
import { containsRiskLanguage } from '../../ai-companion/models/riskDetection';
import { useCheckerStore } from '../state/useCheckerStore';
import { checkerEmotions, physicalSymptomCatalog, medicationCatalog } from '../models/checkerContent';
import type { CompanionStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<CompanionStackParamList, 'CheckerChatbot'>,
  BottomTabScreenProps<AppTabsParamList>
>;

type StepId = 'intro' | 'emotion' | 'duration' | 'appetite' | 'medications' | 'medSearch' | 'age' | 'selfHarm' | 'physical' | 'faceScan';
const STEPS: StepId[] = ['intro', 'emotion', 'duration', 'appetite', 'medications', 'medSearch', 'age', 'selfHarm', 'physical', 'faceScan'];

/**
 * Guided "Dr. Freud AI" symptom chatbot — a scripted Q&A (emotion, duration,
 * appetite, medications, age, self-harm, physical symptoms, face-scan) that
 * feeds the same Analyzing → Results flow. Structure follows the SH Freud
 * chatbot frames; styling is 100% Sakina tokens/primitives.
 *
 * SAFETY: the self-harm step always surfaces a prominent route to real
 * support (and again if risk language is detected). The "face scan" step is
 * INTENTIONALLY illustrative only — no camera/biometric capture happens here
 * (privacy-preserving; see ASSUMPTIONS.md).
 */
export function CheckerChatbotScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const store = useCheckerStore();

  const [index, setIndex] = useState(0);
  const [durationDays, setDurationDays] = useState(3);
  const [appetite, setAppetite] = useState<'none' | 'small' | 'medium' | 'large'>('medium');
  const [medsAnswer, setMedsAnswer] = useState<'yes' | 'no' | 'idk' | null>(null);
  const [age, setAge] = useState(18);
  const [medQuery, setMedQuery] = useState('');

  const step = STEPS[index];
  const openSafety = () => navigation.navigate('ProfileTab', { screen: 'Safety' });

  React.useEffect(() => {
    store.setMethod('chatbot');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const advance = () => {
    // Skip the medication search unless the user said "yes".
    if (step === 'medications' && medsAnswer !== 'yes') {
      setIndex(index + 2);
      return;
    }
    if (index >= STEPS.length - 1) {
      navigation.navigate('SymptomAnalyzing');
      return;
    }
    setIndex(index + 1);
  };

  const Prompt = ({ children }: { children: React.ReactNode }) => (
    <View style={{ gap: theme.spacing.md, alignItems: 'center' }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.background.surface,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        }}
      >
        <Ionicons name="flower-outline" size={24} color={theme.colors.brand.primaryDark} />
      </View>
      <AppText variant="titleLg" style={{ textAlign: 'center' }}>
        {children}
      </AppText>
    </View>
  );

  const medResults = medicationCatalog.filter((m) => m.label.toLowerCase().includes(medQuery.trim().toLowerCase()));
  const riskInSelfHarm = containsRiskLanguage(store.selfHarmText);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm }}>
        <AppText variant="titleMd">{t('checker.drFreud')}</AppText>
        <View style={{ flexDirection: 'row' }}>
          <Button label={t('checker.sessionHistory')} variant="ghost" size="md" onPress={() => navigation.navigate('CheckerSessionHistory')} />
          <Button label={t('checker.endSession')} variant="ghost" size="md" onPress={() => navigation.popToTop()} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.lg, flexGrow: 1 }}>
        {step === 'intro' ? (
          <>
            <Prompt>{t('checker.botIntro')}</Prompt>
            <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
              <Button label={t('checker.yesStart')} onPress={advance} />
              <Button label={t('checker.noGoBack')} variant="ghost" onPress={() => navigation.goBack()} />
            </View>
          </>
        ) : null}

        {step === 'emotion' ? (
          <>
            <Prompt>{t('checker.botEmotion')}</Prompt>
            <View style={{ gap: theme.spacing.xs }}>
              {checkerEmotions.map((e) => (
                <Card
                  key={e.id}
                  onPress={() => {
                    store.set({ emotionId: e.id });
                    advance();
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <AppText variant="body">{isArabic ? e.labelAr : e.labelEn}</AppText>
                  <Ionicons name={isArabic ? 'arrow-back' : 'arrow-forward'} size={18} color={theme.colors.brand.primary} />
                </Card>
              ))}
            </View>
          </>
        ) : null}

        {step === 'duration' ? (
          <>
            <Prompt>{t('checker.botDuration')}</Prompt>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}>
              <IconButton accessibilityLabel={t('checker.decrease')} icon={<Ionicons name="remove" size={22} color={theme.colors.brand.primary} />} onPress={() => setDurationDays((d) => Math.max(1, d - 1))} />
              <AppText variant="displayLg">{durationDays}</AppText>
              <IconButton accessibilityLabel={t('checker.increase')} icon={<Ionicons name="add" size={22} color={theme.colors.brand.primary} />} onPress={() => setDurationDays((d) => d + 1)} />
            </View>
            <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
              {t('checker.durationDays', { count: durationDays })}
            </AppText>
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.continue')} onPress={advance} />
            </View>
          </>
        ) : null}

        {step === 'appetite' ? (
          <>
            <Prompt>{t('checker.botAppetite')}</Prompt>
            <SegmentedControl
              segments={[
                { key: 'none', label: t('checker.weightNone') },
                { key: 'small', label: t('checker.weightSmall') },
                { key: 'medium', label: t('checker.weightMedium') },
                { key: 'large', label: t('checker.weightLarge') },
              ]}
              value={appetite}
              onChange={(k) => setAppetite(k as typeof appetite)}
            />
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.continue')} onPress={advance} />
            </View>
          </>
        ) : null}

        {step === 'medications' ? (
          <>
            <Prompt>{t('checker.botMedications')}</Prompt>
            <View style={{ gap: theme.spacing.xs }}>
              <Button label={t('checker.medYes')} onPress={() => { setMedsAnswer('yes'); setIndex(index + 1); }} />
              <Button label={t('checker.medNo')} variant="secondary" onPress={() => { setMedsAnswer('no'); setIndex(index + 2); }} />
              <Button label={t('checker.medIdk')} variant="ghost" onPress={() => { setMedsAnswer('idk'); setIndex(index + 2); }} />
            </View>
          </>
        ) : null}

        {step === 'medSearch' ? (
          <>
            <Prompt>{t('checker.botMedSearch')}</Prompt>
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
                  return <Chip key={id} label={med?.label ?? id} selected onPress={() => store.toggleMedication(id)} />;
                })}
              </View>
            ) : null}
            {medQuery.length > 0
              ? medResults.slice(0, 5).map((m) => (
                  <Card key={m.id} onPress={() => store.toggleMedication(m.id)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <AppText variant="body">{m.label}</AppText>
                    <Ionicons name={store.medicationIds.includes(m.id) ? 'checkmark-circle' : 'add'} size={20} color={theme.colors.brand.primary} />
                  </Card>
                ))
              : null}
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.continue')} onPress={advance} />
            </View>
          </>
        ) : null}

        {step === 'age' ? (
          <>
            <Prompt>{t('checker.botAge')}</Prompt>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}>
              <IconButton accessibilityLabel={t('checker.decrease')} icon={<Ionicons name="remove" size={22} color={theme.colors.brand.primary} />} onPress={() => setAge((a) => Math.max(13, a - 1))} />
              <AppText variant="displayLg">{age}</AppText>
              <IconButton accessibilityLabel={t('checker.increase')} icon={<Ionicons name="add" size={22} color={theme.colors.brand.primary} />} onPress={() => setAge((a) => Math.min(99, a + 1))} />
            </View>
            <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
              {t('checker.ageYears', { count: age })}
            </AppText>
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.continue')} onPress={advance} />
            </View>
          </>
        ) : null}

        {step === 'selfHarm' ? (
          <>
            <Prompt>{t('checker.botSelfHarm')}</Prompt>
            <TextArea
              placeholder={t('checker.selfHarmPlaceholder')}
              value={store.selfHarmText}
              onChangeText={(v) => store.set({ selfHarmText: v })}
              minLines={3}
              maxLength={500}
            />
            {/* Always offer support on this step; escalate visibly if risk language appears. */}
            <RiskSupportCard onOpenSafety={openSafety} />
            {riskInSelfHarm ? (
              <AppText variant="caption" color={theme.colors.status.error} style={{ textAlign: 'center' }}>
                {t('checker.riskDetectedNote')}
              </AppText>
            ) : null}
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.continue')} onPress={advance} />
            </View>
          </>
        ) : null}

        {step === 'physical' ? (
          <>
            <Prompt>{t('checker.botPhysical')}</Prompt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {physicalSymptomCatalog.map((s) => (
                <Chip
                  key={s.id}
                  label={isArabic ? s.labelAr : s.labelEn}
                  selected={store.physicalSymptomIds.includes(s.id)}
                  onPress={() => store.togglePhysicalSymptom(s.id)}
                />
              ))}
            </View>
            <View style={{ marginTop: 'auto', gap: theme.spacing.xs }}>
              <Button label={t('checker.continue')} onPress={advance} />
              <Button
                label={t('checker.noneOfAbove')}
                variant="ghost"
                onPress={() => {
                  store.set({ physicalSymptomIds: [] });
                  advance();
                }}
              />
            </View>
          </>
        ) : null}

        {step === 'faceScan' ? (
          <>
            <Prompt>{t('checker.botFaceScan')}</Prompt>
            <Card style={{ gap: theme.spacing.xs, backgroundColor: theme.colors.brand.accent }}>
              <AppText variant="bodyStrong" color={theme.colors.text.onBrand}>
                {t('checker.faceScanUnavailableTitle')}
              </AppText>
              <AppText variant="caption" color={theme.colors.text.onBrand}>
                {t('checker.faceScanUnavailableBody')}
              </AppText>
            </Card>
            <View style={{ marginTop: 'auto' }}>
              <Button label={t('checker.seeResults')} onPress={advance} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
