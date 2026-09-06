import React, { useState } from 'react';
import { View, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, TextArea, Chip, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { aiCheckpoints } from '../models/therapyContent';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'TherapyCustomInstructions'>;

/**
 * "Custom AI Instructions" — pick a checkpoint, add adaptive-memory + custom-
 * response notes, and agree to terms. [ASSUMPTION] These are illustrative
 * local settings; there's no backend to persist them to yet. Structure
 * follows the SH Freud custom-instructions frame; styling is 100% Sakina
 * tokens/primitives.
 */
export function TherapyCustomInstructionsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();

  const [checkpointId, setCheckpointId] = useState(aiCheckpoints[0].id);
  const [memory, setMemory] = useState('');
  const [response, setResponse] = useState('');
  const [agreed, setAgreed] = useState(false);

  const save = () => {
    toast.show({ message: t('therapy.instructionsSaved'), tone: 'success' });
    navigation.goBack();
  };

  return (
    <Screen edges={['top']} padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
          <AppText variant="displayMd">{t('therapy.customInstructionsTitle')}</AppText>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.aiModel')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {aiCheckpoints.map((cp) => (
                <Chip key={cp.id} label={isArabic ? cp.labelAr : cp.labelEn} selected={checkpointId === cp.id} onPress={() => setCheckpointId(cp.id)} />
              ))}
            </View>
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.adaptiveMemory')}</AppText>
            <TextArea placeholder={t('therapy.instructionsPlaceholder')} value={memory} onChangeText={setMemory} minLines={3} maxLength={250} />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.customResponse')}</AppText>
            <TextArea placeholder={t('therapy.instructionsPlaceholder')} value={response} onChangeText={setResponse} minLines={3} maxLength={250} />
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            onPress={() => setAgreed((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}
          >
            <Ionicons
              name={agreed ? 'checkbox' : 'square-outline'}
              size={22}
              color={agreed ? theme.colors.brand.primary : theme.colors.text.secondary}
            />
            <AppText variant="body">{t('therapy.agreeTerms')}</AppText>
          </Pressable>

          <Button label={t('therapy.setInstructions')} disabled={!agreed} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
