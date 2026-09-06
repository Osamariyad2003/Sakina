import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { textVariants } from '../../../ui/tokens/typography';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.subtle,
        backgroundColor: theme.colors.background.primary,
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('companion.inputPlaceholder')}
        placeholderTextColor={theme.colors.text.secondary}
        multiline
        accessibilityLabel={t('companion.inputPlaceholder')}
        style={{
          flex: 1,
          maxHeight: 100,
          minHeight: theme.sizes.touchTarget,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
          backgroundColor: theme.colors.background.surface,
          color: theme.colors.text.primary,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          fontSize: textVariants.body.fontSize,
        }}
      />
      <IconButton
        accessibilityLabel={t('companion.send')}
        variant="filled"
        disabled={disabled || !text.trim()}
        onPress={submit}
        icon={<Ionicons name="send" size={20} color={theme.colors.brand.primary} />}
      />
    </View>
  );
}
