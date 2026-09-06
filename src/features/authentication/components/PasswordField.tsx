import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TextInputProps } from 'react-native';
import { TextField, IconButton } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface PasswordFieldProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label: string;
  error?: string;
}

/** TextField with a show/hide toggle — used for every password input in this feature. */
export function PasswordField({ label, error, ...rest }: PasswordFieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      label={label}
      error={error}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      right={
        <IconButton
          accessibilityLabel={visible ? t('common.hidePassword') : t('common.showPassword')}
          onPress={() => setVisible((v) => !v)}
          icon={
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.text.secondary}
            />
          }
        />
      }
      {...rest}
    />
  );
}
