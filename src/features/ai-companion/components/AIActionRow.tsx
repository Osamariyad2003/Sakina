import React from 'react';
import { View } from 'react-native';
import { Button } from '../../../ui/primitives';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../ui/theme';
import { visibleActions } from '../models/aiActions';
import type { AIAction } from '../../../types/models';

interface AIActionRowProps {
  actions: AIAction[] | undefined;
  onSelect: (action: AIAction) => void;
}

/**
 * Buttons the companion suggests under a reply (breathing, journal, symptom
 * check, …). Presentation only: which screen each one opens is decided by
 * `resolveActionRoute` and the navigation lives in the screen.
 */
export function AIActionRow({ actions, onSelect }: AIActionRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const shown = visibleActions(actions);
  if (shown.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.xxs, marginBottom: theme.spacing.xs }}>
      {shown.map((action) => (
        <Button
          key={action.type}
          label={t(action.label)}
          size="md"
          variant={action.type === 'safety' ? 'primary' : 'secondary'}
          onPress={() => onSelect(action)}
        />
      ))}
    </View>
  );
}
