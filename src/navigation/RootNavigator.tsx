import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { OnboardingStack } from './OnboardingStack';
import { AuthStack } from './AuthStack';
import { AppTabs } from './AppTabs';
import { useAuthStore } from '../core/auth/authStore';
import { useOnboardingStore } from '../features/onboarding/state/onboardingStore';
import { MaintenanceScreen } from '../features/errors/screens/MaintenanceScreen';
import { config } from '../config';
import { LoadingState } from '../ui/primitives';

/**
 * Three-way switch per spec §10/§11: Onboarding (first launch) → Auth
 * (login/register) → AppTabs (the real app). `restoring` covers the brief
 * cold-start session-restore check (spec §12 States: Initial/Loading), and
 * `config.maintenanceMode` short-circuits all three.
 */
export function RootNavigator() {
  const authStatus = useAuthStore((s) => s.status);
  const isOnboardingComplete = useOnboardingStore((s) => s.isComplete);

  // Checked before anything else: during a maintenance window the app must not
  // present a half-working session (features/errors).
  if (config.maintenanceMode) {
    return <MaintenanceScreen />;
  }

  if (authStatus === 'restoring') {
    return <LoadingState />;
  }

  return (
    <NavigationContainer>
      {!isOnboardingComplete ? (
        <OnboardingStack />
      ) : authStatus === 'unauthenticated' ? (
        <AuthStack />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
