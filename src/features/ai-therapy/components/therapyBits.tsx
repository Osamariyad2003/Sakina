import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText, Card } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { Theme } from '../../../ui/theme';
import { iconMeta, type DetectedEmotion, type TherapyConversation } from '../models/therapyContent';

export function emotionColor(theme: Theme, emotion: DetectedEmotion): string {
  switch (emotion) {
    case 'happy':
      return theme.colors.status.success;
    case 'sad':
      return theme.colors.accent.steps;
    case 'anxious':
      return theme.colors.accent.reflection;
    case 'angry':
      return theme.colors.status.error;
    case 'despair':
      return theme.colors.accent.sleep;
    case 'crisis':
      return theme.colors.status.error;
    case 'neutral':
      return theme.colors.brand.accent;
  }
}

/** The "Emotion: X · Data Updated" chip shown after a user turn. */
export function EmotionTag({ emotion }: { emotion: DetectedEmotion }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const color = emotionColor(theme, emotion);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xxs,
        alignSelf: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.background.surface,
        borderWidth: 1,
        borderColor: color,
        marginVertical: theme.spacing.xxs,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: theme.radius.pill, backgroundColor: color }} />
      <AppText variant="caption" color={theme.colors.text.secondary}>
        {emotion === 'crisis'
          ? t('therapy.emotionCrisis')
          : t('therapy.emotionUpdated', { emotion: t(`therapy.emotion.${emotion}`) })}
      </AppText>
    </View>
  );
}

export function ConversationCard({
  conversation,
  onPress,
}: {
  conversation: TherapyConversation;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const meta = iconMeta(conversation.iconId);
  const accent = theme.colors.accent[meta.accent];

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View style={{ width: 44, height: 44, borderRadius: theme.radius.pill, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={22} color={theme.colors.text.onBrand} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {conversation.topicName}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
          <Ionicons name="chatbubble-ellipses-outline" size={12} color={theme.colors.text.secondary} />
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('therapy.totalMessages', { count: conversation.messageCount })}
          </AppText>
          <View style={{ width: 6, height: 6, borderRadius: theme.radius.pill, backgroundColor: emotionColor(theme, conversation.lastEmotion) }} />
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {conversation.lastEmotion === 'crisis' ? t('therapy.emotionCrisisShort') : t(`therapy.emotion.${conversation.lastEmotion}`)}
          </AppText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
    </Card>
  );
}
