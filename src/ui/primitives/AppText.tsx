import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { fontFamilies, textVariants, type TextVariant } from '../tokens/typography';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  children: React.ReactNode;
}

/**
 * The only place `fontFamily` strings should ever appear (spec §6).
 * Screens pick a semantic `variant`; this maps it to family/size/line-height
 * and falls back to the OS system font when Thmanyah hasn't loaded.
 */
export function AppText({ variant = 'body', color, style, children, ...rest }: AppTextProps) {
  const theme = useTheme();
  const v = textVariants[variant];

  const fontFamily = theme.fontsAvailable ? fontFamilies[v.fontFamilyKey] : undefined;

  const textStyle: TextStyle = {
    fontFamily,
    fontSize: v.fontSize,
    lineHeight: v.lineHeight,
    letterSpacing: v.letterSpacing,
    color: color ?? theme.colors.text.primary,
    // Bold system-font fallback so hierarchy still reads before fonts load.
    fontWeight: !theme.fontsAvailable && v.fontFamilyKey === 'sansBold' ? '700' : undefined,
  };

  return (
    <Text style={[textStyle, style]} allowFontScaling {...rest}>
      {children}
    </Text>
  );
}
