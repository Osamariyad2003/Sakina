import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface UtilityAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface UtilityScreenLayoutProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  /** Tone of the icon badge — utility screens should read as calm, not alarming. */
  tone?: 'neutral' | 'warning' | 'error';
  actions?: UtilityAction[];
  /** For screens rendered outside a navigator (crash, maintenance) that have no safe area context yet. */
  standalone?: boolean;
}

/**
 * The shared frame for every full-screen utility state (not found,
 * maintenance, crash). Centralised so these screens stay visually calm and
 * consistent instead of each inventing its own layout — and so a crash
 * fallback can reuse it without a navigator.
 */
export function UtilityScreenLayout({
  icon,
  title,
  body,
  tone = 'neutral',
  actions = [],
  standalone = false,
}: UtilityScreenLayoutProps) {
  const theme = useTheme();
  const iconColor =
    tone === 'error' ? theme.colors.status.error : tone === 'warning' ? theme.colors.status.warning : theme.colors.brand.primary;

  const content = (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <Ionicons name={icon} size={64} color={iconColor} />
      <AppText variant="displayMd" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
        {body}
      </AppText>
      {actions.length > 0 ? (
        <View style={{ alignSelf: 'stretch', gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
          {actions.map((action) => (
            <Button key={action.label} label={action.label} variant={action.variant ?? 'primary'} onPress={action.onPress} />
          ))}
        </View>
      ) : null}
    </View>
  );

  if (standalone) return content;
  return <Screen padded={false}>{content}</Screen>;
}
