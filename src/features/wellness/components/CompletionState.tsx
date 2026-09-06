import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface CompletionStateProps {
  onRepeat: () => void;
  onDone: () => void;
}

export function CompletionState({ onRepeat, onDone }: CompletionStateProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, padding: theme.spacing.lg }}>
      <AppText variant="displayMd" style={{ textAlign: 'center' }}>
        {t('wellness.completionTitle')}
      </AppText>
      <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
        {t('wellness.completionBody')}
      </AppText>
      <Button label={t('wellness.repeat')} variant="secondary" onPress={onRepeat} />
      <Button label={t('common.done')} onPress={onDone} />
    </View>
  );
}
