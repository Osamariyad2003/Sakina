import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import type { CommunityPost } from '../models/communityContent';

interface PostCardProps {
  post: CommunityPost;
  onToggleSupport: () => void;
  onReport: () => void;
  onDelete: () => void;
}

/**
 * A single post. Reported posts collapse to a placeholder on this device
 * rather than disappearing, so the thread stays readable and the user can
 * see their report took effect.
 */
export function PostCard({ post, onToggleSupport, onReport, onDelete }: PostCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const when = new Date(post.createdAt).toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });

  if (post.reportedByMe) {
    return (
      <Card style={{ gap: theme.spacing.xxs }}>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('community.reportedPlaceholder')}
        </AppText>
      </Card>
    );
  }

  return (
    <Card style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        <AppText variant="label" style={{ flex: 1 }}>
          {post.authorAlias}
        </AppText>
        {post.isMine ? <Badge label={t('community.mine')} color={theme.colors.accent.journaling} /> : null}
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {when}
        </AppText>
      </View>

      <AppText variant="body">{post.body}</AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: post.supportedByMe }}
          accessibilityLabel={t('community.support')}
          onPress={onToggleSupport}
          style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, minHeight: theme.sizes.touchTarget }}
        >
          <Ionicons
            name={post.supportedByMe ? 'heart' : 'heart-outline'}
            size={18}
            color={post.supportedByMe ? theme.colors.brand.primary : theme.colors.text.secondary}
          />
          <AppText variant="caption" color={post.supportedByMe ? theme.colors.brand.primary : theme.colors.text.secondary}>
            {t('community.supportCount', { count: post.supportCount })}
          </AppText>
        </Pressable>

        <View style={{ flex: 1 }} />

        {post.isMine ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('community.delete')}
            onPress={onDelete}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, minHeight: theme.sizes.touchTarget }}
          >
            <Ionicons name="trash-outline" size={16} color={theme.colors.status.error} />
            <AppText variant="caption" color={theme.colors.status.error}>
              {t('community.delete')}
            </AppText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('community.report')}
            onPress={onReport}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, minHeight: theme.sizes.touchTarget }}
          >
            <Ionicons name="flag-outline" size={16} color={theme.colors.text.secondary} />
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('community.report')}
            </AppText>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
