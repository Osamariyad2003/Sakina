import React from 'react';
import { TextField } from './TextField';
import { useTheme } from '../theme';
import { textVariants } from '../tokens/typography';
import type { TextInputProps } from 'react-native';

interface TextAreaProps extends Omit<TextInputProps, 'multiline'> {
  label?: string;
  error?: string;
  hint?: string;
  minLines?: number;
}

/** Multiline TextField — journal entries, notes, chat compose overflow. */
export function TextArea({ minLines = 4, style, ...rest }: TextAreaProps) {
  const theme = useTheme();

  return (
    <TextField
      multiline
      textAlignVertical="top"
      style={[{ minHeight: minLines * textVariants.body.lineHeight, paddingTop: theme.spacing.sm }, style]}
      {...rest}
    />
  );
}
