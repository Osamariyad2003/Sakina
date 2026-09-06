import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WellnessStackParamList } from './types';
import { WellnessHomeScreen } from '../features/wellness/screens/WellnessHomeScreen';
import { ExerciseDetailsScreen } from '../features/wellness/screens/ExerciseDetailsScreen';
import { ActiveExerciseScreen } from '../features/wellness/screens/ActiveExerciseScreen';
import { StressOverviewScreen } from '../features/wellness/stress-management/screens/StressOverviewScreen';
import { StressTechniqueDetailScreen } from '../features/wellness/stress-management/screens/StressTechniqueDetailScreen';
import { StressActiveSessionScreen } from '../features/wellness/stress-management/screens/StressActiveSessionScreen';
import { StressCompletionScreen } from '../features/wellness/stress-management/screens/StressCompletionScreen';
import { HydrationHomeScreen } from '../features/wellness/hydration/screens/HydrationHomeScreen';
import { HydrationLogScreen } from '../features/wellness/hydration/screens/HydrationLogScreen';
import { HydrationHistoryScreen } from '../features/wellness/hydration/screens/HydrationHistoryScreen';
import { HydrationSettingsScreen } from '../features/wellness/hydration/screens/HydrationSettingsScreen';
import { SleepQualityScreen } from '../features/wellness/sleep/screens/SleepQualityScreen';
import { SleepQualityChartScreen } from '../features/wellness/sleep/screens/SleepQualityChartScreen';
import { NewSleepScheduleScreen } from '../features/wellness/sleep/screens/NewSleepScheduleScreen';
import { SleepGoalScreen } from '../features/wellness/sleep/screens/SleepGoalScreen';
import { SleepScheduleSetupScreen } from '../features/wellness/sleep/screens/SleepScheduleSetupScreen';
import { SleepScheduleConfirmScreen } from '../features/wellness/sleep/screens/SleepScheduleConfirmScreen';
import { SleepScheduleCreatedScreen } from '../features/wellness/sleep/screens/SleepScheduleCreatedScreen';
import { SleepAIAutosuggestScreen } from '../features/wellness/sleep/screens/SleepAIAutosuggestScreen';
import { MySleepScheduleScreen } from '../features/wellness/sleep/screens/MySleepScheduleScreen';
import { SleepSessionScreen } from '../features/wellness/sleep/screens/SleepSessionScreen';
import { SleepSummaryScreen } from '../features/wellness/sleep/screens/SleepSummaryScreen';
import { SleepHistoryScreen } from '../features/wellness/sleep/screens/SleepHistoryScreen';
import { SleepDetailScreen } from '../features/wellness/sleep/screens/SleepDetailScreen';
import { SleepSuggestionDetailScreen } from '../features/wellness/sleep/screens/SleepSuggestionDetailScreen';
import { WellnessResourcesScreen } from '../features/wellness/resources/screens/WellnessResourcesScreen';
import { ResourceDetailScreen } from '../features/wellness/resources/screens/ResourceDetailScreen';
import { WorkshopDetailScreen } from '../features/wellness/resources/screens/WorkshopDetailScreen';
import { stackScreenOptions, fullScreenModalOptions } from './animations';

const Stack = createNativeStackNavigator<WellnessStackParamList>();

export function WellnessStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="WellnessHome" component={WellnessHomeScreen} />
      <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
      <Stack.Screen name="ActiveExercise" component={ActiveExerciseScreen} options={fullScreenModalOptions} />
      {/* Stress Management sub-feature. */}
      <Stack.Screen name="StressOverview" component={StressOverviewScreen} />
      <Stack.Screen name="StressTechniqueDetail" component={StressTechniqueDetailScreen} />
      <Stack.Screen name="StressActiveSession" component={StressActiveSessionScreen} options={fullScreenModalOptions} />
      <Stack.Screen name="StressCompletion" component={StressCompletionScreen} />
      {/* Hydration tracker. */}
      <Stack.Screen name="HydrationHome" component={HydrationHomeScreen} />
      <Stack.Screen name="HydrationLog" component={HydrationLogScreen} />
      <Stack.Screen name="HydrationHistory" component={HydrationHistoryScreen} />
      <Stack.Screen name="HydrationSettings" component={HydrationSettingsScreen} />
      {/* Sleep Quality sub-feature. */}
      <Stack.Screen name="SleepQuality" component={SleepQualityScreen} />
      <Stack.Screen name="SleepQualityChart" component={SleepQualityChartScreen} />
      <Stack.Screen name="NewSleepSchedule" component={NewSleepScheduleScreen} />
      <Stack.Screen name="SleepGoal" component={SleepGoalScreen} />
      <Stack.Screen name="SleepScheduleSetup" component={SleepScheduleSetupScreen} />
      <Stack.Screen name="SleepScheduleConfirm" component={SleepScheduleConfirmScreen} />
      <Stack.Screen name="SleepScheduleCreated" component={SleepScheduleCreatedScreen} />
      <Stack.Screen name="SleepAIAutosuggest" component={SleepAIAutosuggestScreen} />
      <Stack.Screen name="MySleepSchedule" component={MySleepScheduleScreen} />
      <Stack.Screen name="SleepSession" component={SleepSessionScreen} options={fullScreenModalOptions} />
      <Stack.Screen name="SleepSummary" component={SleepSummaryScreen} />
      <Stack.Screen name="SleepHistory" component={SleepHistoryScreen} />
      <Stack.Screen name="SleepDetail" component={SleepDetailScreen} />
      <Stack.Screen name="SleepSuggestionDetail" component={SleepSuggestionDetailScreen} />
      {/* Wellness resources & workshops sub-feature. */}
      <Stack.Screen name="WellnessResources" component={WellnessResourcesScreen} />
      <Stack.Screen name="ResourceDetail" component={ResourceDetailScreen} />
      <Stack.Screen name="WorkshopDetail" component={WorkshopDetailScreen} />
    </Stack.Navigator>
  );
}
