import React, { useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Avatar, TextField, Button, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useAuthStore } from '../../../core/auth/authStore';
import type { ProfileStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(user?.displayName ?? '');
  const dirty = name.trim().length > 0 && name.trim() !== user?.displayName;

  const saveName = () => {
    if (!dirty) return;
    updateProfile({ displayName: name.trim() });
    toast.show({ message: t('profile.nameUpdated'), tone: 'success' });
  };

  return (
    <Screen>
      <View style={{ paddingTop: theme.spacing.lg, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('profile.title')}</AppText>

        <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <Avatar initials={user?.displayName ?? '?'} size={72} />
        </View>

        <TextField label={t('profile.nameLabel')} value={name} onChangeText={setName} />
        {dirty ? <Button label={t('profile.saveButton')} onPress={saveName} /> : null}

        <TextField label={t('profile.emailLabel')} value={user?.email ?? ''} editable={false} />

        <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.xs }}>
          <Button label={t('profile.badgesLink')} variant="secondary" onPress={() => navigation.navigate('Badges')} />
          <Button label={t('profile.helpLink')} variant="secondary" onPress={() => navigation.navigate('HelpCenter')} />
          <Button label={t('profile.settingsLink')} variant="secondary" onPress={() => navigation.navigate('Settings')} />
          <Button label={t('profile.privacyLink')} variant="secondary" onPress={() => navigation.navigate('Privacy')} />
          <Button label={t('profile.safetyLink')} variant="secondary" onPress={() => navigation.navigate('Safety')} />
        </View>

        <Button label={t('profile.logout')} variant="destructive" onPress={() => logout()} style={{ marginTop: theme.spacing.md }} />
      </View>
    </Screen>
  );
}
