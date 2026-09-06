import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { CommunityThread } from '../models/communityContent';

interface ThreadCardProps {
  thread: CommunityThread;
  onPress: () => void;
}

export function ThreadCard({ thread, onPress }: ThreadCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const when = new Date(thread.createdAt).toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card onPress={onPress} style={{ gap: theme.spacing.xxs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <AppText variant="titleMd" style={{ flex: 1 }}>
          {thread.title}
        </AppText>
        {thread.isMine ? <Badge label={t('community.mine')} color={theme.colors.accent.journaling} /> : null}
      </View>
      <AppText variant="caption" color={theme.colors.text.secondary} numberOfLines={2}>
        {thread.excerpt}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xxs }}>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {thread.authorAlias} · {when}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
          <Ionicons name="chatbubble-outline" size={12} color={theme.colors.text.secondary} />
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {thread.replyCount}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
          <Ionicons name="heart-outline" size={12} color={theme.colors.text.secondary} />
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {thread.supportCount}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
