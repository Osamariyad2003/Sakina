import React from 'react';
import { ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button, EmptyState } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { getHelpArticle } from '../models/helpContent';
import type { ProfileStackParamList, AppTabsParamList } from '../../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'HelpArticle'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/** One answer, plus the in-app action that actually resolves it where one exists. */
export function HelpArticleScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const article = getHelpArticle(route.params.articleId);

  if (!article) {
    return (
      <Screen>
        <EmptyState title={t('help.articleNotFound')} actionLabel={t('help.title')} onAction={() => navigation.navigate('HelpCenter')} />
      </Screen>
    );
  }

  const actionLabel = article.action ? t(`help.action.${article.action.kind}`) : null;
  const runAction = () => {
    switch (article.action?.kind) {
      case 'safety':
        navigation.navigate('Safety');
        return;
      case 'privacy':
        navigation.navigate('Privacy');
        return;
      case 'settings':
        navigation.navigate('Settings');
        return;
      case 'contact':
        navigation.navigate('ContactSupport');
        return;
      case 'notifications':
        navigation.navigate('HomeTab', { screen: 'ReminderSettings' });
    }
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{isArabic ? article.questionAr : article.questionEn}</AppText>
        <AppText variant="editorial" color={theme.colors.text.secondary}>
          {isArabic ? article.answerAr : article.answerEn}
        </AppText>
        {actionLabel ? <Button label={actionLabel} onPress={runAction} /> : null}
        <Button label={t('help.stillNeedHelp')} variant="ghost" onPress={() => navigation.navigate('ContactSupport')} />
      </ScrollView>
    </Screen>
  );
}
