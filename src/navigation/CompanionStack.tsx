import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CompanionStackParamList } from './types';
import { ConversationScreen } from '../features/ai-companion/screens/ConversationScreen';
import { SymptomCheckerIntroScreen } from '../features/symptom-checker/screens/SymptomCheckerIntroScreen';
import { SymptomCheckMethodScreen } from '../features/symptom-checker/screens/SymptomCheckMethodScreen';
import { SymptomSelectScreen } from '../features/symptom-checker/screens/SymptomSelectScreen';
import { SymptomAdditionalInfoScreen } from '../features/symptom-checker/screens/SymptomAdditionalInfoScreen';
import { SymptomAnalyzingScreen } from '../features/symptom-checker/screens/SymptomAnalyzingScreen';
import { SymptomResultsScreen } from '../features/symptom-checker/screens/SymptomResultsScreen';
import { ConditionDetailScreen } from '../features/symptom-checker/screens/ConditionDetailScreen';
import { CheckerChatbotScreen } from '../features/symptom-checker/screens/CheckerChatbotScreen';
import { CheckerSessionCompleteScreen } from '../features/symptom-checker/screens/CheckerSessionCompleteScreen';
import { CheckerSessionHistoryScreen } from '../features/symptom-checker/screens/CheckerSessionHistoryScreen';
import { TherapyIntroScreen } from '../features/ai-therapy/screens/TherapyIntroScreen';
import { TherapyDashboardScreen } from '../features/ai-therapy/screens/TherapyDashboardScreen';
import { TherapyChatsScreen } from '../features/ai-therapy/screens/TherapyChatsScreen';
import { NewTherapyConversationScreen } from '../features/ai-therapy/screens/NewTherapyConversationScreen';
import { TherapyConversationScreen } from '../features/ai-therapy/screens/TherapyConversationScreen';
import { TherapyCustomInstructionsScreen } from '../features/ai-therapy/screens/TherapyCustomInstructionsScreen';
import { stackScreenOptions, modalScreenOptions, fullScreenModalOptions } from './animations';

const Stack = createNativeStackNavigator<CompanionStackParamList>();

export function CompanionStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      {/* AI Mental Illness Symptom Checker sub-feature. */}
      <Stack.Screen name="SymptomCheckerIntro" component={SymptomCheckerIntroScreen} />
      <Stack.Screen name="SymptomCheckMethod" component={SymptomCheckMethodScreen} />
      <Stack.Screen name="SymptomSelect" component={SymptomSelectScreen} />
      <Stack.Screen name="SymptomAdditionalInfo" component={SymptomAdditionalInfoScreen} />
      <Stack.Screen name="SymptomAnalyzing" component={SymptomAnalyzingScreen} options={fullScreenModalOptions} />
      <Stack.Screen name="SymptomResults" component={SymptomResultsScreen} />
      <Stack.Screen name="ConditionDetail" component={ConditionDetailScreen} />
      <Stack.Screen name="CheckerChatbot" component={CheckerChatbotScreen} />
      <Stack.Screen name="CheckerSessionComplete" component={CheckerSessionCompleteScreen} />
      <Stack.Screen name="CheckerSessionHistory" component={CheckerSessionHistoryScreen} />
      {/* AI Therapy Chatbot sub-feature. */}
      <Stack.Screen name="TherapyIntro" component={TherapyIntroScreen} />
      <Stack.Screen name="TherapyDashboard" component={TherapyDashboardScreen} />
      <Stack.Screen name="TherapyChats" component={TherapyChatsScreen} />
      <Stack.Screen name="NewTherapyConversation" component={NewTherapyConversationScreen} />
      <Stack.Screen name="TherapyConversation" component={TherapyConversationScreen} />
      <Stack.Screen name="TherapyCustomInstructions" component={TherapyCustomInstructionsScreen} options={modalScreenOptions} />
    </Stack.Navigator>
  );
}
