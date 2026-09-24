import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Badge, Button, IconButton, LoadingState, ErrorState, ContentImage } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useArticleQuery, useIsSavedQuery, useToggleSavedMutation } from '../state/useResourceQueries';
import { getTopic } from '../models/resourceContent';
import { useContentImage } from '../../state/useContentImages';
import type { WellnessStackParamList, AppTabsParamList } from '../../../../navigation/types';
import { errorText } from '../../../../core/errors';

type Props = CompositeScreenProps<
  NativeStackScreenProps<WellnessStackParamList, 'ResourceDetail'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Article reader. The body uses the `editorial` serif variant (the one
 * typography token meant for long-form reading), and every article ends with
 * an optional next step inside the app rather than a call to read more.
 */
export function ResourceDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useArticleQuery(route.params.resourceId);
  const savedQuery = useIsSavedQuery(route.params.resourceId);
  const curatedImage = useContentImage('resource_article', route.params.resourceId);
  const toggleSaved = useToggleSavedMutation();

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState
          message={errorText(query.error, t) ?? t('resources.articleNotFound')}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const article = query.data;
  const topic = getTopic(article.topic);
  const accent = topic ? theme.colors.accent[topic.accent] : theme.colors.brand.primary;
  const isSaved = savedQuery.data ?? false;

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        {curatedImage ?? article.image ? (
          <ContentImage image={curatedImage ?? article.image} height={200} />
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            {topic ? <Badge label={isArabic ? topic.labelAr : topic.labelEn} color={accent} /> : null}
            <AppText variant="displayMd">{isArabic ? article.titleAr : article.titleEn}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('resources.readMinutes', { count: article.readMinutes })}
            </AppText>
          </View>
          <IconButton
            accessibilityLabel={isSaved ? t('resources.unsave') : t('resources.save')}
            onPress={() => toggleSaved.mutate(article.id)}
            icon={
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? theme.colors.brand.primary : theme.colors.text.secondary}
              />
            }
          />
        </View>

        {article.sections.map((section, index) => (
          <View key={index} style={{ gap: theme.spacing.xs }}>
            <AppText variant="titleMd">{isArabic ? section.headingAr : section.headingEn}</AppText>
            <AppText variant="editorial" color={theme.colors.text.secondary}>
              {isArabic ? section.bodyAr : section.bodyEn}
            </AppText>
          </View>
        ))}

        {article.practice ? (
          <Card style={{ borderTopWidth: 3, borderTopColor: accent, gap: theme.spacing.xs }}>
            <AppText variant="titleMd">{t('resources.tryThisTitle')}</AppText>
            {article.practice.kind === 'wellnessExercise' ? (
              <Button
                label={t('resources.openExercise')}
                variant="secondary"
                onPress={() =>
                  navigation.navigate('ExerciseDetails', {
                    exerciseId: (article.practice as { exerciseId: string }).exerciseId,
                  })
                }
              />
            ) : (
              <>
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {isArabic ? article.practice.promptAr : article.practice.promptEn}
                </AppText>
                <Button
                  label={t('resources.openJournal')}
                  variant="secondary"
                  onPress={() => navigation.navigate('JournalTab', { screen: 'JournalEntry', params: undefined })}
                />
              </>
            )}
          </Card>
        ) : null}

        {/* Editorial content is supportive, not clinical — say so once, at the end. */}
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('resources.notMedicalAdvice')}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
