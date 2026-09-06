import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  scroll?: boolean;
  style?: ViewStyle;
  /** Set false for screens that manage their own horizontal padding (e.g. full-bleed lists). */
  padded?: boolean;
}

/** SafeArea + theme background wrapper — the base every screen renders into. */
export function Screen({ children, edges = ['top', 'bottom'], style, padded = true }: ScreenProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.flex,
        { backgroundColor: theme.colors.background.primary },
        padded && { paddingHorizontal: theme.spacing.md },
        style,
      ]}
    >
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
