import React, { useRef, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type GorhomBottomSheet from '@gorhom/bottom-sheet';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  AppText,
  Card,
  Chip,
  Button,
  TextField,
  BottomSheet,
  SkeletonList,
  ErrorState,
  useToast,
} from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { CommunityGuidelinesCard } from '../components/CommunityGuidelinesCard';
import { useCommunityGroupsQuery, useCommunityProfileQuery, useSaveCommunityProfileMutation } from '../state/useCommunityQueries';
import { aliasSuggestions, MAX_ALIAS_LENGTH } from '../models/communityContent';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';
import { errorText } from '../../../core/errors';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Community'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Community home: the rules, the user's pseudonym, and the groups. Reading is
 * always open; posting requires picking an alias and accepting the guidelines
 * first (enforced in `communityService`, surfaced here).
 */
export function CommunityScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();
  const joinSheet = useRef<GorhomBottomSheet>(null);

  const groupsQuery = useCommunityGroupsQuery();
  const profileQuery = useCommunityProfileQuery();
  const saveProfile = useSaveCommunityProfileMutation();
  const [alias, setAlias] = useState('');

  const profile = profileQuery.data;
  const joined = Boolean(profile?.hasAcceptedGuidelines && profile.alias);

  const openJoin = () => {
    setAlias(profile?.alias ?? '');
    joinSheet.current?.expand();
  };

  const confirmJoin = () => {
    saveProfile.mutate(
      { alias, hasAcceptedGuidelines: true },
      {
        onSuccess: () => {
          joinSheet.current?.close();
          toast.show({ message: t('community.joinedToast'), tone: 'success' });
        },
        onError: (error) => toast.show({ message: errorText(error, t), tone: 'error' }),
      },
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <AppText variant="displayMd">{t('community.title')}</AppText>
        <AppText variant="body" color={theme.colors.text.secondary}>
          {t('community.intro')}
        </AppText>

        {/* Safety route stays above the groups, never below them. */}
        <Card
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          style={{ backgroundColor: theme.colors.status.error }}
        >
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('community.notEmergencyTitle')}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
            {t('community.notEmergencyBody')}
          </AppText>
        </Card>

        <CommunityGuidelinesCard />

        <Card style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="person-circle-outline" size={24} color={theme.colors.brand.primary} />
            <View style={{ flex: 1 }}>
              <AppText variant="titleMd">{t('community.aliasTitle')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {joined ? t('community.postingAs', { alias: profile?.alias }) : t('community.aliasBody')}
              </AppText>
            </View>
          </View>
          <Button
            label={joined ? t('community.changeAlias') : t('community.joinCta')}
            variant={joined ? 'secondary' : 'primary'}
            onPress={openJoin}
          />
        </Card>

        <AppText variant="titleLg">{t('community.groupsTitle')}</AppText>

        {groupsQuery.isLoading ? (
          <SkeletonList rows={4} />
        ) : groupsQuery.isError ? (
          <ErrorState message={errorText(groupsQuery.error, t)} onRetry={() => groupsQuery.refetch()} />
        ) : (
          (groupsQuery.data ?? []).map((group) => (
            <Card
              key={group.id}
              onPress={() => navigation.navigate('CommunityGroup', { groupId: group.id })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
                borderTopWidth: 3,
                borderTopColor: theme.colors.accent[group.accent],
              }}
            >
              <Ionicons name={group.icon} size={24} color={theme.colors.accent[group.accent]} />
              <View style={{ flex: 1 }}>
                <AppText variant="titleMd">{isArabic ? group.nameAr : group.nameEn}</AppText>
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {isArabic ? group.descriptionAr : group.descriptionEn}
                </AppText>
              </View>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('community.threadCount', { count: group.threadCount })}
              </AppText>
            </Card>
          ))
        )}

        {/* Honest about what this feature currently is. */}
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('community.localOnlyNote')}
        </AppText>
      </ScrollView>

      <BottomSheet ref={joinSheet} snapPoints={['55%']}>
        <AppText variant="titleMd">{t('community.aliasSheetTitle')}</AppText>
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
          {t('community.aliasSheetBody')}
        </AppText>
        <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
          <TextField
            label={t('community.aliasLabel')}
            value={alias}
            onChangeText={setAlias}
            maxLength={MAX_ALIAS_LENGTH}
            autoCapitalize="none"
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {aliasSuggestions.map((suggestion) => (
              <Chip key={suggestion} label={suggestion} selected={alias === suggestion} onPress={() => setAlias(suggestion)} />
            ))}
          </View>
          <Button
            label={t('community.acceptAndJoin')}
            disabled={alias.trim().length === 0}
            loading={saveProfile.isPending}
            onPress={confirmJoin}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}
