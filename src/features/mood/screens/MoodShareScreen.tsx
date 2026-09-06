import React from 'react';
import { View, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, Avatar, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { moodColor } from '../components/moodColors';
import { moodLevels } from '../models/moodContent';
import type { MoodLevel } from '../../../types/models';
import type { MoodStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MoodStackParamList, 'MoodShare'>;

/**
 * "Share Mood" — a social feed of friends' recent moods with a local React
 * action, and Invite Friends. [ASSUMPTION] No backend/social graph exists
 * (product-definition.md Open Question #4); this is illustrative mock data
 * and both actions are local-only (a toast) — nothing is sent off-device.
 * Structure follows the SH Freud share frame; styling is 100% Sakina
 * tokens/primitives.
 */
const mockFriends: { name: string; mood: MoodLevel; minutesAgo: number }[] = [
  { name: 'Rayna Bella', mood: 'veryLow', minutesAgo: 25 },
  { name: 'David Gilmore', mood: 'low', minutesAgo: 48 },
  { name: 'Roger Waters', mood: 'good', minutesAgo: 60 },
  { name: 'Azunyan U. Wu', mood: 'veryGood', minutesAgo: 8 },
  { name: 'Syd Barrett', mood: 'low', minutesAgo: 720 },
  { name: 'Michael Jaxson', mood: 'neutral', minutesAgo: 1080 },
];

export function MoodShareScreen(_props: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();

  const ago = (minutes: number) =>
    minutes < 60 ? t('mood.minutesAgo', { count: minutes }) : t('mood.hoursAgo', { count: Math.round(minutes / 60) });

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('mood.shareTitle')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('mood.shareSubtitle')}
        </AppText>

        {mockFriends.map((friend) => {
          const option = moodLevels.find((m) => m.level === friend.mood)!;
          return (
            <Card key={friend.name} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Avatar initials={friend.name.split(' ').map((p) => p[0]).join('')} />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{friend.name}</AppText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                  <View style={{ width: 8, height: 8, borderRadius: theme.radius.pill, backgroundColor: moodColor(theme, friend.mood) }} />
                  <AppText variant="caption" color={theme.colors.text.secondary}>
                    {option.emoji} {isArabic ? option.labelAr : option.labelEn} · {ago(friend.minutesAgo)}
                  </AppText>
                </View>
              </View>
              <Button
                label={t('mood.react')}
                variant="secondary"
                size="md"
                onPress={() => toast.show({ message: t('mood.reactionSent', { name: friend.name }), tone: 'success' })}
              />
            </Card>
          );
        })}

        <Button
          label={t('mood.inviteFriends')}
          onPress={() => toast.show({ message: t('mood.inviteComingSoon'), tone: 'neutral' })}
        />
      </ScrollView>
    </Screen>
  );
}
