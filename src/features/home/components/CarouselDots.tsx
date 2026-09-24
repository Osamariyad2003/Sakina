import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../ui/theme';

/**
 * The reference's page indicator under the metrics carousel. Purely
 * decorative — the carousel is still scrolled by swiping, so these are
 * hidden from screen readers rather than announced as controls.
 */
export function CarouselDots({ count, activeIndex }: { count: number; activeIndex: number }) {
  const theme = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xxs }}
    >
      {Array.from({ length: count }).map((_, index) => {
        const active = index === activeIndex;
        return (
          <View
            key={index}
            style={{
              width: active ? 16 : 6,
              height: 6,
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.brand.primary : theme.colors.border.default,
            }}
          />
        );
      })}
    </View>
  );
}
