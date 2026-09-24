import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Snackbar, type SnackbarProps } from './Snackbar';
import { useTheme } from '../theme';

interface ToastRequest extends SnackbarProps {
  id: number;
  durationMs?: number;
}

interface ToastContextValue {
  show: (toast: Omit<ToastRequest, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/** Ephemeral, auto-dismissing Snackbar — wrap the app once near the root. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastRequest | null>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((request: Omit<ToastRequest, 'id'>) => {
    if (timer.current) clearTimeout(timer.current);
    const id = Date.now();
    setToast({ id, durationMs: 3500, ...request });
    timer.current = setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, request.durationMs ?? 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <View
          style={[
            styles.wrap,
            { bottom: insets.bottom + theme.spacing.md, left: theme.spacing.md, right: theme.spacing.md },
          ]}
        >
          <Snackbar {...toast} />
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used within a <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  // box-none so the toast never swallows taps meant for the screen under it.
  wrap: { position: 'absolute', pointerEvents: 'box-none' },
});
