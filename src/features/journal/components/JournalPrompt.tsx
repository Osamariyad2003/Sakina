import React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Chip } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { journalPrompts } from '../models/journalContent';

interface JournalPromptProps {
  selectedId?: string;
  onSelect: (promptId: string, text: string) => void;
}

export function JournalPrompt({ selectedId, onSelect }: JournalPromptProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
      {journalPrompts.map((prompt) => (
        <Chip
          key={prompt.id}
          label={isArabic ? prompt.textAr : prompt.textEn}
          selected={selectedId === prompt.id}
          onPress={() => onSelect(prompt.id, isArabic ? prompt.textAr : prompt.textEn)}
        />
      ))}
    </ScrollView>
  );
}
