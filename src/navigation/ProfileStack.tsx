import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { PrivacyScreen } from '../features/profile/screens/PrivacyScreen';
import { SafetyScreen } from '../features/safety/screens/SafetyScreen';
import { HelpCenterScreen } from '../features/profile/help/screens/HelpCenterScreen';
import { HelpArticleScreen } from '../features/profile/help/screens/HelpArticleScreen';
import { ContactSupportScreen } from '../features/profile/help/screens/ContactSupportScreen';
import { BadgesScreen } from '../features/badges/screens/BadgesScreen';
import { BadgeDetailScreen } from '../features/badges/screens/BadgeDetailScreen';
import { stackScreenOptions, modalScreenOptions } from './animations';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Safety" component={SafetyScreen} options={modalScreenOptions} />
      {/* Help centre. */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="HelpArticle" component={HelpArticleScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      {/* Badges & achievements. */}
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} />
    </Stack.Navigator>
  );
}
