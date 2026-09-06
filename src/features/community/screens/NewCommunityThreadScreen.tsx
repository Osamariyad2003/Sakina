import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, TextArea, Button, useToast } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { SafetyBanner } from '../../safety/components/SafetyBanner';
import { CommunityGuidelinesCard } from '../components/CommunityGuidelinesCard';
import { useCreateThreadMutation, useCommunityProfileQuery } from '../state/useCommunityQueries';
import { MAX_POST_LENGTH } from '../models/communityContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'NewCommunityThread'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Thread composer. If `communityService` refuses the text because it contains
 * risk language (HTTP-ish 422), the screen swaps the error for the shared
 * `SafetyBanner` and routes to the Safety page — the same escalation the AI
 * Companion uses. The draft is left in place; nothing the user wrote is lost.
 */
export function NewCommunityThreadScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();

  const { groupId } = route.params;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [riskDetected, setRiskDetected] = useState(false);

  const profileQuery = useCommunityProfileQuery();
  const createThread = useCreateThreadMutation();
  const alias = profileQuery.data?.alias;

  const submit = () => {
    setRiskDetected(false);
    createThread.mutate(
      { groupId, title, body },
      {
        onSuccess: (thread) => navigation.replace('CommunityThread', { threadId: thread.id }),
        onError: (error) => {
          const appError = error as AppError;
          if (appError.status === 422) {
            setRiskDetected(true);
            return;
          }
          toast.show({ message: appError.message, tone: 'error' });
        },
      },
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      {riskDetected ? (
        <SafetyBanner
          onOpenSafety={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          onDismiss={() => setRiskDetected(false)}
        />
      ) : null}

      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }} keyboardShouldPersistTaps="handled">
        <AppText variant="displayMd">{t('community.newThread')}</AppText>
        {alias ? (
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {t('community.postingAs', { alias })}
          </AppText>
        ) : null}

        <CommunityGuidelinesCard />

        <TextField label={t('community.threadTitleLabel')} value={title} onChangeText={setTitle} />
        <TextArea
          label={t('community.threadBodyLabel')}
          placeholder={t('community.threadBodyPlaceholder')}
          value={body}
          onChangeText={setBody}
          maxLength={MAX_POST_LENGTH}
        />
        <AppText variant="caption" color={theme.colors.text.secondary}>
          {t('community.charactersLeft', { count: MAX_POST_LENGTH - body.length })}
        </AppText>

        <Button
          label={t('community.publish')}
          disabled={title.trim().length === 0 || body.trim().length === 0}
          loading={createThread.isPending}
          onPress={submit}
        />
      </ScrollView>
    </Screen>
  );
}
