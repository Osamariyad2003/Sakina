import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
}

/** Horizontally scrollable content tabs (e.g. Wellness categories) — distinct from bottom-tab navigation. */
export function Tabs({ items, value, onChange }: TabsProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.xs, paddingVertical: theme.spacing.xxs }}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(item.key);
            }}
            style={{
              minHeight: theme.sizes.controlHeight,
              paddingHorizontal: theme.spacing.sm,
              justifyContent: 'center',
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.brand.primaryDark : theme.colors.background.surface,
              borderWidth: active ? 0 : 1,
              borderColor: theme.colors.border.default,
            }}
          >
            <AppText variant="label" color={active ? theme.colors.text.onBrand : theme.colors.text.primary}>
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
