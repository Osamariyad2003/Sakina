import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { UtilityScreenLayout } from '../components/UtilityScreenLayout';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'NotFound'>;

/**
 * Shown when something the user navigated to no longer exists — a search
 * result pointing at a deleted entry, a stale link. Names the kind of thing
 * that went missing when the caller knows it, because "not found" alone
 * tells the user nothing about what to do next.
 */
export function NotFoundScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const entity = route.params?.entity;

  return (
    <UtilityScreenLayout
      icon="help-circle-outline"
      title={t('errors.notFoundTitle')}
      body={entity ? t('errors.notFoundBodyNamed', { entity }) : t('errors.notFoundBody')}
      actions={[
        { label: t('errors.backToHome'), onPress: () => navigation.navigate('Home') },
        ...(navigation.canGoBack() ? [{ label: t('common.back'), variant: 'ghost' as const, onPress: () => navigation.goBack() }] : []),
      ]}
    />
  );
}
