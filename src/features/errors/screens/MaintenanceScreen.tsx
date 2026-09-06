import React from 'react';
import { useTranslation } from 'react-i18next';
import { UtilityScreenLayout } from '../components/UtilityScreenLayout';

interface MaintenanceScreenProps {
  /** Re-runs the readiness check. Rendered above the navigator, so there is nothing to go "back" to. */
  onRetry?: () => void;
}

/**
 * Rendered in place of the whole app while `config.maintenanceMode` is on.
 * Deliberately offers no way past it — a maintenance screen the user can
 * dismiss is not a maintenance screen. Safety information is not gated behind
 * it either: the copy points at emergency services directly, because a
 * maintenance window must never be the reason someone can't get help.
 */
export function MaintenanceScreen({ onRetry }: MaintenanceScreenProps) {
  const { t } = useTranslation();

  return (
    <UtilityScreenLayout
      standalone
      icon="construct-outline"
      tone="warning"
      title={t('errors.maintenanceTitle')}
      body={t('errors.maintenanceBody')}
      actions={onRetry ? [{ label: t('common.retry'), onPress: onRetry }] : []}
    />
  );
}
