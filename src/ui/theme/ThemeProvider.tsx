import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { buildSemanticColors, type ColorScheme } from '../tokens/colors';
import { buildShadows } from '../tokens/shadows';
import { spacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { motion } from '../tokens/motion';
import type { Theme } from './types';

const ThemeContext = createContext<Theme | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Overrides OS scheme detection — useful for tests / a future manual toggle. */
  schemeOverride?: ColorScheme;
  fontsAvailable?: boolean;
}

export function ThemeProvider({ children, schemeOverride, fontsAvailable = false }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = schemeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const theme = useMemo<Theme>(
    () => ({
      scheme,
      colors: buildSemanticColors(scheme),
      spacing,
      radius,
      sizes,
      shadows: buildShadows(scheme),
      motion,
      fontsAvailable,
    }),
    [scheme, fontsAvailable],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used within a <ThemeProvider>');
  }
  return ctx;
}
