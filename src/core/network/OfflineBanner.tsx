import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { AppText } from '../../ui/primitives';
import { useOnlineStatus } from './useOnlineStatus';
import i18n from '../../i18n';

/** Thin persistent banner — shown app-wide whenever the device is offline. */
export function OfflineBanner() {
  const theme = useTheme();
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: theme.colors.status.warning,
        paddingVertical: theme.spacing.xxs,
        alignItems: 'center',
      }}
    >
      <AppText variant="caption" color={theme.colors.text.onBrand}>
        {i18n.t('errors.network')}
      </AppText>
    </View>
  );
}
