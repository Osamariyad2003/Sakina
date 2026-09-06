import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Chip } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

/** Shown in the empty/near-empty conversation state (spec §16). */
export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const prompts = [
    t('companion.suggestedPrompt1'),
    t('companion.suggestedPrompt2'),
    t('companion.suggestedPrompt3'),
    t('companion.suggestedPrompt4'),
  ];

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
      {prompts.map((prompt) => (
        <Chip key={prompt} label={prompt} onPress={() => onSelect(prompt)} />
      ))}
    </View>
  );
}
