import React from 'react';
import i18n from '../../../i18n';
import { ThemeProvider } from '../../../ui/theme';
import { UtilityScreenLayout } from '../components/UtilityScreenLayout';

interface AppCrashScreenProps {
  onReset: () => void;
}

/**
 * `ErrorBoundary`'s fallback.
 *
 * Two deliberate choices, both because of *where* this renders:
 * - It uses `i18n.t` directly rather than `useTranslation`, since the
 *   boundary is a class component rendering its own error path.
 * - It carries its own `ThemeProvider`. `ErrorBoundary` sits above the app's
 *   provider in `App.tsx`, so anything below it that calls `useTheme` would
 *   throw a *second* error while rendering the fallback for the first one.
 *   Providing the theme here makes the fallback safe wherever it is mounted.
 *
 * Never shows the error message or stack (spec §27/§33).
 */
export function AppCrashScreen({ onReset }: AppCrashScreenProps) {
  return (
    <ThemeProvider>
      <UtilityScreenLayout
        standalone
        icon="alert-circle-outline"
        tone="error"
        title={i18n.t('errors.boundaryTitle')}
        body={i18n.t('errors.boundaryBody')}
        actions={[{ label: i18n.t('common.retry'), onPress: onReset }]}
      />
    </ThemeProvider>
  );
}
