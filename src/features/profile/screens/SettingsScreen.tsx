import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Chip } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { config } from '../../../config';
import { setLanguageAndReloadIfNeeded, type AppLanguage } from '../../../i18n/rtl';
import type { ProfileStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Settings'>,
  BottomTabScreenProps<AppTabsParamList>
>;

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language === 'en' ? 'en' : 'ar') as AppLanguage;

  const changeLanguage = async (lang: AppLanguage) => {
    if (lang === currentLanguage) return;
    await i18n.changeLanguage(lang);
    await setLanguageAndReloadIfNeeded(lang);
  };

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('settings.title')}</AppText>

        <Card>
          <AppText variant="titleMd" style={{ marginBottom: theme.spacing.xs }}>
            {t('settings.languageTitle')}
          </AppText>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            <Chip label={t('settings.languageArabic')} selected={currentLanguage === 'ar'} onPress={() => changeLanguage('ar')} />
            <Chip label={t('settings.languageEnglish')} selected={currentLanguage === 'en'} onPress={() => changeLanguage('en')} />
          </View>
        </Card>

        {/* Reminders now have a real settings screen (features/notifications). */}
        <Card onPress={() => navigation.navigate('HomeTab', { screen: 'ReminderSettings' })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="titleMd">{t('settings.notificationsTitle')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('settings.notificationsSubtitle')}
              </AppText>
            </View>
            <Ionicons
              name={currentLanguage === 'ar' ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.colors.text.secondary}
            />
          </View>
        </Card>

        <Card onPress={() => navigation.navigate('HelpCenter')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="help-circle-outline" size={22} color={theme.colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="titleMd">{t('help.title')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('help.settingsSubtitle')}
              </AppText>
            </View>
            <Ionicons
              name={currentLanguage === 'ar' ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color={theme.colors.text.secondary}
            />
          </View>
        </Card>

        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center', marginTop: theme.spacing.md }}>
          {t('settings.appVersion')}: {Constants.expoConfig?.version ?? '—'}
          {config.maintenanceMode ? ` · ${t('errors.maintenanceTitle')}` : ''}
        </AppText>
      </View>
    </Screen>
  );
}
