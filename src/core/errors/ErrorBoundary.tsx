import React from 'react';
import { AppCrashScreen } from '../../features/errors/screens/AppCrashScreen';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render crashes anywhere below it so the app never white-screens (spec §27). */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Intentionally not logging error content/stack in production per spec §33.
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    // Rendered above the app's ThemeProvider, so the fallback brings its own
    // (see AppCrashScreen) rather than throwing a second error mid-recovery.
    return <AppCrashScreen onReset={this.reset} />;
  }
}
