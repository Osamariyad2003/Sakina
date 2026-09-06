import React from 'react';
import { View } from 'react-native';
import { AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface MessageBubbleProps {
  content: string;
  streaming?: boolean;
}

/** Memoized — chat lists re-render often while streaming (spec §32: memoized bubbles). */
export const UserMessageBubble = React.memo(function UserMessageBubble({ content }: MessageBubbleProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-end', marginVertical: theme.spacing.xxs }}>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: theme.colors.brand.primary,
          borderRadius: theme.radius.lg,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <AppText variant="body" color={theme.colors.text.onBrand}>
          {content}
        </AppText>
      </View>
    </View>
  );
});

export const AIMessageBubble = React.memo(function AIMessageBubble({ content, streaming }: MessageBubbleProps) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-start', marginVertical: theme.spacing.xxs }}>
      <View
        style={{
          maxWidth: '82%',
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <AppText variant="body">
          {content}
          {streaming ? ' ▌' : ''}
        </AppText>
      </View>
    </View>
  );
});
