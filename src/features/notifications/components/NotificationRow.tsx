import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { categoryMeta, type AppNotification } from '../models/notificationContent';

interface NotificationRowProps {
  notification: AppNotification;
  onPress: () => void;
}

/** Unread is marked with a dot + surface tint, never with a colour the user can't see in dark mode. */
export function NotificationRow({ notification, onPress }: NotificationRowProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const unread = !notification.readAt;
  const meta = categoryMeta[notification.category];

  const relative = new Date(notification.createdAt).toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card
      onPress={onPress}
      style={{
        flexDirection: 'row',
        gap: theme.spacing.sm,
        borderStartWidth: unread ? 3 : 0,
        borderStartColor: theme.colors.brand.primary,
      }}
    >
      <Ionicons name={meta.icon} size={22} color={theme.colors.brand.primary} />
      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <AppText variant={unread ? 'bodyStrong' : 'body'} style={{ flex: 1 }}>
            {isArabic ? notification.titleAr : notification.titleEn}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {relative}
          </AppText>
        </View>
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {isArabic ? notification.bodyAr : notification.bodyEn}
        </AppText>
      </View>
    </Card>
  );
}
