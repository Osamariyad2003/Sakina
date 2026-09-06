import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { LanguageScreen } from '../features/onboarding/screens/LanguageScreen';
import { IntroductionScreen } from '../features/onboarding/screens/IntroductionScreen';
import { GoalsScreen } from '../features/onboarding/screens/GoalsScreen';
import { BaselineScreen } from '../features/onboarding/screens/BaselineScreen';
import { ConsentScreen } from '../features/onboarding/screens/ConsentScreen';
import { stackScreenOptions } from './animations';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * Flow: Welcome → Language → Introduction → Goals → Baseline → Consent
 * (spec §11, Flow 1). Ends by marking onboarding complete, which flips
 * RootNavigator over to AuthStack (Login/Register) automatically.
 */
export function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Introduction" component={IntroductionScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Baseline" component={BaselineScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
    </Stack.Navigator>
  );
}
