import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { SearchScreen } from '../features/search/screens/SearchScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ReminderSettingsScreen } from '../features/notifications/screens/ReminderSettingsScreen';
import { TherapistDirectoryScreen } from '../features/professional-help/screens/TherapistDirectoryScreen';
import { TherapistDetailScreen } from '../features/professional-help/screens/TherapistDetailScreen';
import { BookAppointmentScreen } from '../features/professional-help/screens/BookAppointmentScreen';
import { AppointmentConfirmedScreen } from '../features/professional-help/screens/AppointmentConfirmedScreen';
import { AppointmentsScreen } from '../features/professional-help/screens/AppointmentsScreen';
import { AppointmentDetailScreen } from '../features/professional-help/screens/AppointmentDetailScreen';
import { CommunityScreen } from '../features/community/screens/CommunityScreen';
import { CommunityGroupScreen } from '../features/community/screens/CommunityGroupScreen';
import { CommunityThreadScreen } from '../features/community/screens/CommunityThreadScreen';
import { NewCommunityThreadScreen } from '../features/community/screens/NewCommunityThreadScreen';
import { InsightsScreen } from '../features/insights/screens/InsightsScreen';
import { NotFoundScreen } from '../features/errors/screens/NotFoundScreen';
import { stackScreenOptions, modalScreenOptions } from './animations';

const Stack = createNativeStackNavigator<HomeStackParamList>();

/**
 * Home is the hub the reference's Home screen implies: the dashboard itself,
 * plus the sections that hang off it — search, notifications, therapist
 * booking and community. Sub-features that belong to another tab's domain
 * live there instead (resources under Wellness, badges and help under
 * Profile), the same way the checker/therapy stacks sit under Companion.
 */
export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} options={modalScreenOptions} />
      {/* Notifications & reminders. */}
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />
      {/* Therapist booking & appointments. */}
      <Stack.Screen name="TherapistDirectory" component={TherapistDirectoryScreen} />
      <Stack.Screen name="TherapistDetail" component={TherapistDetailScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentConfirmed" component={AppointmentConfirmedScreen} />
      <Stack.Screen name="Appointments" component={AppointmentsScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
      {/* Community support. */}
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="CommunityGroup" component={CommunityGroupScreen} />
      <Stack.Screen name="CommunityThread" component={CommunityThreadScreen} />
      <Stack.Screen name="NewCommunityThread" component={NewCommunityThreadScreen} options={modalScreenOptions} />
      {/* Cross-domain Insights dashboard (features/insights). */}
      <Stack.Screen name="Insights" component={InsightsScreen} />
      {/* Utility. */}
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
    </Stack.Navigator>
  );
}
