import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { JournalStackParamList } from './types';
import { JournalListScreen } from '../features/journal/screens/JournalListScreen';
import { JournalEntryScreen } from '../features/journal/screens/JournalEntryScreen';
import { stackScreenOptions, modalScreenOptions } from './animations';

const Stack = createNativeStackNavigator<JournalStackParamList>();

export function JournalStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="JournalList" component={JournalListScreen} />
      <Stack.Screen name="JournalEntry" component={JournalEntryScreen} options={modalScreenOptions} />
    </Stack.Navigator>
  );
}
