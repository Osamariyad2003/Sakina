import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import './src/i18n'; // side-effect: initializes i18next before anything renders
import { ThemeProvider } from './src/ui/theme';
import { ToastProvider } from './src/ui/primitives/Toast';
import { AnimatedSplash } from './src/ui/splash/AnimatedSplash';
import { useAppFonts } from './src/ui/fonts/useAppFonts';
import { ErrorBoundary } from './src/core/errors';
import { queryClient } from './src/core/api';
import { composeRepositories } from './src/core/composition';
import { useAuthStore } from './src/core/auth/authStore';
import { OfflineBanner } from './src/core/network/OfflineBanner';
import { RootNavigator } from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Wire repositories before anything can call a use case.
composeRepositories();

function AppShell() {
  const { fontsReady, fontsAvailable } = useAppFonts();
  const authStatus = useAuthStore((s) => s.status);
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const [showSplash, setShowSplash] = useState(true);
  const nativeSplashHidden = useRef(false);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // App data is "ready" once fonts are loaded and the session-restore check
  // resolves — the animated splash's exit is gated on this, so the user
  // sees one continuous branded transition instead of splash → spinner.
  const appDataReady = fontsReady && authStatus !== 'restoring';

  // Swap the native (static-image) splash for our animated one as soon as
  // this tree has painted a first frame, so there's no gap between them.
  const dismissNativeSplash = useCallback(() => {
    if (!nativeSplashHidden.current) {
      nativeSplashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider fontsAvailable={fontsAvailable}>
      <ToastProvider>
        <View style={{ flex: 1 }} onLayout={dismissNativeSplash}>
          <OfflineBanner />
          <RootNavigator />
          <StatusBar style="auto" />
          {showSplash ? (
            <AnimatedSplash ready={appDataReady} onExitComplete={() => setShowSplash(false)} />
          ) : null}
        </View>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AppShell />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
