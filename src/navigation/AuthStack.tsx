import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { LoginScreen } from '../features/authentication/screens/LoginScreen';
import { RegisterScreen } from '../features/authentication/screens/RegisterScreen';
import { ForgotPasswordScreen } from '../features/authentication/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../features/authentication/screens/ResetPasswordScreen';
import { stackScreenOptions } from './animations';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
