import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { AppTabsParamList } from './types';
import { useTheme } from '../ui/theme';
import { HomeStack } from './HomeStack';
import { CompanionStack } from './CompanionStack';
import { MoodStack } from './MoodStack';
import { JournalStack } from './JournalStack';
import { WellnessStack } from './WellnessStack';
import { ProfileStack } from './ProfileStack';
import { tabScreenOptions } from './animations';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const icons: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home-outline',
  CompanionTab: 'chatbubble-ellipses-outline',
  MoodTab: 'heart-outline',
  JournalTab: 'book-outline',
  WellnessTab: 'leaf-outline',
  ProfileTab: 'person-outline',
};

/** Bottom-tabs (spec §10): Home, AI Companion, Mood, Journal, Wellness, Profile. */
export function AppTabs() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        ...tabScreenOptions,
        tabBarActiveTintColor: theme.colors.brand.primaryDark,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.surface,
          borderTopColor: theme.colors.border.subtle,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={icons[route.name as keyof AppTabsParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen name="CompanionTab" component={CompanionStack} options={{ tabBarLabel: t('tabs.companion') }} />
      <Tab.Screen name="MoodTab" component={MoodStack} options={{ tabBarLabel: t('tabs.mood') }} />
      <Tab.Screen name="JournalTab" component={JournalStack} options={{ tabBarLabel: t('tabs.journal') }} />
      <Tab.Screen name="WellnessTab" component={WellnessStack} options={{ tabBarLabel: t('tabs.wellness') }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: t('tabs.profile') }} />
    </Tab.Navigator>
  );
}
