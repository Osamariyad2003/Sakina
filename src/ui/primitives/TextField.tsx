import React, { useState } from 'react';
import { TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { textVariants } from '../tokens/typography';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  /** Adornment rendered at the input's trailing (logical end) edge — e.g. a password-visibility toggle. */
  right?: React.ReactNode;
}

/** Wraps TextInput with label/error/hint, RTL-correct via logical padding. */
export function TextField({ label, error, hint, style, right, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.status.error
    : focused
      ? theme.colors.brand.primary
      : theme.colors.border.default;

  return (
    <View style={{ gap: theme.spacing.xxs }}>
      {label ? (
        <AppText variant="label" color={theme.colors.text.secondary}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.text.secondary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              borderColor,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.sm,
              paddingEnd: right ? theme.sizes.touchTarget : theme.spacing.sm,
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.background.surface,
              textAlign: 'auto',
              fontSize: textVariants.body.fontSize,
            },
            style,
          ]}
          {...rest}
        />
        {right ? <View style={[styles.rightAdornment, { end: theme.spacing.xxs }]}>{right}</View> : null}
      </View>
      {error ? (
        <AppText variant="caption" color={theme.colors.status.error}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    justifyContent: 'center',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
  },
  rightAdornment: {
    position: 'absolute',
  },
});
