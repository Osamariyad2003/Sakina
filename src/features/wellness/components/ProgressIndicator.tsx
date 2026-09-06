import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../ui/theme';

interface ProgressIndicatorProps {
  /** 0 to 1 */
  progress: number;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={{ height: 6, borderRadius: theme.radius.pill, backgroundColor: theme.colors.border.subtle, overflow: 'hidden' }}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.brand.primary,
        }}
      />
    </View>
  );
}
