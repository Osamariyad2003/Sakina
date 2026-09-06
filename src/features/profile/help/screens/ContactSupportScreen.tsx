import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Chip, TextArea, TextField, Button, useToast } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import { useAuthStore } from '../../../../core/auth/authStore';
import { supportTopics, type SupportTopic } from '../models/helpContent';
import type { ProfileStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ContactSupport'>;

/**
 * [ASSUMPTION] There is no support backend, so this form does not pretend to
 * send anything: it composes the message, tells the user plainly that
 * delivery is not wired up yet, and keeps the draft on screen. Faking a
 * "message sent" confirmation would be worse than saying nothing.
 */
export function ContactSupportScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const [topic, setTopic] = useState<SupportTopic>('account');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');

  const submit = () => {
    // Deliberately does not claim the message was delivered — see the note above.
    toast.show({ message: t('help.contactNotWiredToast'), tone: 'neutral' });
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMd">{t('help.contactTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('help.contactIntro')}
        </AppText>

        {/* Safety is never a support ticket. */}
        <Card onPress={() => navigation.navigate('Safety')} style={{ backgroundColor: theme.colors.status.error }}>
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('help.contactNotEmergencyTitle')}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
            {t('help.contactNotEmergencyBody')}
          </AppText>
        </Card>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="titleMd">{t('help.contactTopicLabel')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {supportTopics.map((item) => (
              <Chip key={item} label={t(`help.topic.${item}`)} selected={topic === item} onPress={() => setTopic(item)} />
            ))}
          </View>
        </View>

        <TextField
          label={t('help.contactEmailLabel')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextArea
          label={t('help.contactMessageLabel')}
          placeholder={t('help.contactMessagePlaceholder')}
          value={message}
          onChangeText={setMessage}
        />

        <Button label={t('help.contactSend')} disabled={message.trim().length === 0} onPress={submit} />

        <Card style={{ borderTopWidth: 3, borderTopColor: theme.colors.status.info }}>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('help.contactNotWiredNote')}
          </AppText>
        </Card>
      </ScrollView>
    </Screen>
  );
}
