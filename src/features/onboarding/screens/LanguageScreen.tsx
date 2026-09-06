import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Button } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { setLanguageAndReloadIfNeeded, type AppLanguage } from '../../../i18n/rtl';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Language'>;

export function LanguageScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const choose = async (lang: AppLanguage) => {
    if (lang === i18n.language) {
      navigation.navigate('Introduction');
      return;
    }
    await i18n.changeLanguage(lang);
    await setLanguageAndReloadIfNeeded(lang);
    // If no reload was needed (I18nManager direction already matched), continue the flow.
    navigation.navigate('Introduction');
  };

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <AppText variant="displayMd">اختر لغتك · Choose your language</AppText>
        <Button label="العربية" onPress={() => choose('ar')} />
        <Button label="English" variant="secondary" onPress={() => choose('en')} />
        <Button label={t('common.skip')} variant="ghost" onPress={() => navigation.navigate('Introduction')} />
      </View>
    </Screen>
  );
}
