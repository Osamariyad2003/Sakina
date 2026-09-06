import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Badge } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { kindMeta, type SearchResult } from '../models/searchContent';

interface SearchResultRowProps {
  result: SearchResult;
  onPress: () => void;
}

export function SearchResultRow({ result, onPress }: SearchResultRowProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const when = result.createdAt
    ? new Date(result.createdAt).toLocaleDateString(isArabic ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <Card onPress={onPress} style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' }}>
      <Ionicons name={kindMeta[result.kind].icon} size={20} color={theme.colors.brand.primary} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: theme.spacing.xxs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
            {result.title}
          </AppText>
          {when ? (
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {when}
            </AppText>
          ) : null}
        </View>
        {result.subtitle ? (
          <AppText variant="caption" color={theme.colors.text.secondary} numberOfLines={2}>
            {result.subtitle}
          </AppText>
        ) : null}
        <Badge label={t(`search.kind.${result.kind}`)} />
      </View>
    </Card>
  );
}
