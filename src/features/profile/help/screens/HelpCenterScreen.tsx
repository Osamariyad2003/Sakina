import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, TextField, Chip, Button, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { helpCategories, searchHelp, type HelpCategory } from '../models/helpContent';
import type { ProfileStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'HelpCenter'>;

/**
 * Help centre: search, category filter, and a prominent Safety route. Search
 * runs over the answer text as well as the question, because people search
 * for the words in their problem rather than the words in our headings.
 */
export function HelpCenterScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<HelpCategory | null>(null);

  const results = useMemo(() => {
    const matched = searchHelp(search, isArabic);
    return category ? matched.filter((a) => a.category === category) : matched;
  }, [search, category, isArabic]);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppText variant="displayMd">{t('help.title')}</AppText>
        <TextField
          placeholder={t('help.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t('help.searchPlaceholder')}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
          {helpCategories.map((item) => (
            <Chip
              key={item.id}
              label={t(`help.category.${item.id}`)}
              selected={category === item.id}
              onPress={() => setCategory((current) => (current === item.id ? null : item.id))}
              icon={
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={category === item.id ? theme.colors.text.onBrand : theme.colors.text.primary}
                />
              }
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        {/* Crisis route above the FAQ, never inside it. */}
        <Card onPress={() => navigation.navigate('Safety')} style={{ backgroundColor: theme.colors.status.error }}>
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('help.needHelpNowTitle')}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
            {t('help.needHelpNowBody')}
          </AppText>
        </Card>

        {results.length === 0 ? (
          <EmptyState
            title={t('help.noResultsTitle')}
            description={t('help.noResultsBody')}
            actionLabel={t('help.contactSupport')}
            onAction={() => navigation.navigate('ContactSupport')}
          />
        ) : (
          results.map((article) => (
            <Card key={article.id} onPress={() => navigation.navigate('HelpArticle', { articleId: article.id })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <AppText variant="titleMd" style={{ flex: 1 }}>
                  {isArabic ? article.questionAr : article.questionEn}
                </AppText>
                <Ionicons
                  name={isArabic ? 'chevron-back' : 'chevron-forward'}
                  size={18}
                  color={theme.colors.text.secondary}
                />
              </View>
            </Card>
          ))
        )}

        <Button label={t('help.contactSupport')} variant="secondary" onPress={() => navigation.navigate('ContactSupport')} />
      </ScrollView>
    </Screen>
  );
}
