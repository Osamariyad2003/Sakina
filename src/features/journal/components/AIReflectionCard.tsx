import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, AppText } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { config } from '../../../config';
import type { JournalEntry } from '../../../types/models';

interface AIReflectionCardProps {
  entry: JournalEntry;
}

/**
 * AI reflection is deferred from MVP (product-definition.md §13,
 * `config.featureFlags.aiJournalReflection`). Stubbed here per spec §17
 * ("AI Reflection optional/stubbed") rather than omitted entirely, so the
 * UI slot and its gate are real.
 */
export function AIReflectionCard({ entry }: AIReflectionCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (config.featureFlags.aiJournalReflection && entry.aiReflection) {
    return (
      <Card style={{ backgroundColor: theme.colors.background.surface }}>
        <AppText variant="label" color={theme.colors.text.secondary}>
          {t('journal.aiReflectionTitle')}
        </AppText>
        <AppText variant="editorial" style={{ marginTop: theme.spacing.xxs }}>
          {entry.aiReflection}
        </AppText>
      </Card>
    );
  }

  return (
    <Card style={{ opacity: 0.6 }}>
      <AppText variant="label" color={theme.colors.text.secondary}>
        {t('journal.aiReflectionComingSoonTitle')}
      </AppText>
      <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
        {t('journal.aiReflectionComingSoonBody')}
      </AppText>
    </Card>
  );
}
