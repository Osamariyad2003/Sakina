import React, { useState } from 'react';
import { View, ScrollView, Switch, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, TextField, Chip, SegmentedControl } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useCreateConversationMutation } from '../state/useTherapyQueries';
import {
  communicationStyles,
  therapyGoals,
  conversationIcons,
  aiCheckpoints,
  MAX_CHECKPOINTS,
  type CommunicationStyle,
} from '../models/therapyContent';
import type { CompanionStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<CompanionStackParamList, 'NewTherapyConversation'>;

/**
 * "New Conversation" config — topic, AI checkpoints (Sakina-branded, up to 3),
 * preferred name, avatar icon, communication style, therapy goal, and privacy.
 * Structure follows the SH Freud new-conversation frame; styling is 100%
 * Sakina tokens/primitives. (The Figma's third-party model names are replaced
 * with Sakina-branded ones — see therapyContent.ts / ASSUMPTIONS.md.)
 */
export function NewTherapyConversationScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const create = useCreateConversationMutation();

  const [topicName, setTopicName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [iconId, setIconId] = useState(conversationIcons[0].id);
  const [style, setStyle] = useState<CommunicationStyle>('casual');
  const [goalId, setGoalId] = useState(therapyGoals[0].id);
  const [checkpointIds, setCheckpointIds] = useState<string[]>(['core']);
  const [isPublic, setIsPublic] = useState(false);

  const toggleCheckpoint = (id: string) =>
    setCheckpointIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length < MAX_CHECKPOINTS ? [...ids, id] : ids,
    );

  const submit = async () => {
    try {
      const conversation = await create.mutateAsync({ topicName, preferredName, iconId, style, goalId, checkpointIds, isPublic });
      navigation.replace('TherapyConversation', { conversationId: conversation.id });
    } catch {
      // Keep the user on the form if the mock write fails.
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
          <AppText variant="displayMd">{t('therapy.newConversationTitle')}</AppText>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.topicName')}</AppText>
            <TextField placeholder={t('therapy.topicPlaceholder')} value={topicName} onChangeText={setTopicName} maxLength={80} />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="label">{t('therapy.checkpoints')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('therapy.selectUpTo', { count: MAX_CHECKPOINTS })}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {aiCheckpoints.map((cp) => (
                <Chip
                  key={cp.id}
                  label={isArabic ? cp.labelAr : cp.labelEn}
                  selected={checkpointIds.includes(cp.id)}
                  onPress={() => toggleCheckpoint(cp.id)}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.preferredName')}</AppText>
            <TextField placeholder={t('therapy.preferredNamePlaceholder')} value={preferredName} onChangeText={setPreferredName} maxLength={40} />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.conversationIcon')}</AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {conversationIcons.map((icon) => {
                const selected = iconId === icon.id;
                return (
                  <Pressable
                    key={icon.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setIconId(icon.id)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? theme.colors.accent[icon.accent] : theme.colors.background.surface,
                      borderWidth: 1,
                      borderColor: selected ? theme.colors.accent[icon.accent] : theme.colors.border.default,
                    }}
                  >
                    <Ionicons
                      name={icon.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={selected ? theme.colors.text.onBrand : theme.colors.text.secondary}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.communicationStyle')}</AppText>
            <SegmentedControl
              segments={communicationStyles.map((s) => ({ key: s.id, label: isArabic ? s.labelAr : s.labelEn }))}
              value={style}
              onChange={(k) => setStyle(k as CommunicationStyle)}
            />
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="label">{t('therapy.therapyGoals')}</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {therapyGoals.map((g) => (
                <Chip key={g.id} label={isArabic ? g.labelAr : g.labelEn} selected={goalId === g.id} onPress={() => setGoalId(g.id)} />
              ))}
            </View>
          </View>

          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingEnd: theme.spacing.sm }}>
              <AppText variant="body">{t('therapy.makePublic')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('therapy.makePublicHint')}
              </AppText>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ true: theme.colors.brand.primary, false: theme.colors.border.default }}
              thumbColor={theme.colors.background.surface}
            />
          </Card>

          <Button
            label={t('therapy.createConversation')}
            loading={create.isPending}
            disabled={topicName.trim().length === 0 || checkpointIds.length === 0}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
