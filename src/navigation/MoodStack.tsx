import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MoodStackParamList } from './types';
import { MoodHomeScreen } from '../features/mood/screens/MoodHomeScreen';
import { MoodCheckInScreen } from '../features/mood/screens/MoodCheckInScreen';
import { MoodHistoryScreen } from '../features/mood/screens/MoodHistoryScreen';
import { MoodDetailScreen } from '../features/mood/screens/MoodDetailScreen';
import { MoodFilterScreen } from '../features/mood/screens/MoodFilterScreen';
import { MoodOverviewScreen } from '../features/mood/screens/MoodOverviewScreen';
import { MoodInsightsScreen } from '../features/mood/screens/MoodInsightsScreen';
import { MoodSuggestionDetailScreen } from '../features/mood/screens/MoodSuggestionDetailScreen';
import { MoodShareScreen } from '../features/mood/screens/MoodShareScreen';
import { stackScreenOptions, modalScreenOptions } from './animations';

const Stack = createNativeStackNavigator<MoodStackParamList>();

export function MoodStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MoodHome" component={MoodHomeScreen} />
      <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} options={modalScreenOptions} />
      <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
      <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
      <Stack.Screen name="MoodFilter" component={MoodFilterScreen} options={modalScreenOptions} />
      <Stack.Screen name="MoodOverview" component={MoodOverviewScreen} />
      <Stack.Screen name="MoodInsights" component={MoodInsightsScreen} />
      <Stack.Screen name="MoodSuggestionDetail" component={MoodSuggestionDetailScreen} />
      <Stack.Screen name="MoodShare" component={MoodShareScreen} />
    </Stack.Navigator>
  );
}
