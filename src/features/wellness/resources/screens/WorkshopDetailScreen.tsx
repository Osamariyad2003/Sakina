import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Badge, Button, IconButton, LoadingState, ErrorState, useToast } from '../../../../ui/primitives';
import { useTheme } from '../../../../ui/theme';
import {
  useWorkshopQuery,
  useIsSavedQuery,
  useToggleSavedMutation,
  useIsRegisteredQuery,
  useToggleRegistrationMutation,
} from '../state/useResourceQueries';
import { getTopic } from '../models/resourceContent';
import type { AppError } from '../../../../core/errors';
import type { WellnessStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<WellnessStackParamList, 'WorkshopDetail'>;

/**
 * Workshop detail. "Register" records an intention locally and says so
 * plainly — there is no registration backend and the app takes no payment,
 * so promising a confirmed seat would be a lie.
 */
export function WorkshopDetailScreen({ route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const toast = useToast();

  const query = useWorkshopQuery(route.params.workshopId);
  const savedQuery = useIsSavedQuery(route.params.workshopId);
  const registeredQuery = useIsRegisteredQuery(route.params.workshopId);
  const toggleSaved = useToggleSavedMutation();
  const toggleRegistration = useToggleRegistrationMutation();

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState
          message={(query.error as AppError)?.message ?? t('resources.workshopNotFound')}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const workshop = query.data;
  const topic = getTopic(workshop.topic);
  const accent = topic ? theme.colors.accent[topic.accent] : theme.colors.brand.primary;
  const isSaved = savedQuery.data ?? false;
  const isRegistered = registeredQuery.data ?? false;
  const when = new Date(workshop.startsAt).toLocaleString(isArabic ? 'ar-JO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
              {topic ? <Badge label={isArabic ? topic.labelAr : topic.labelEn} color={accent} /> : null}
              {isRegistered ? <Badge label={t('resources.registered')} tone="success" /> : null}
            </View>
            <AppText variant="displayMd">{isArabic ? workshop.titleAr : workshop.titleEn}</AppText>
          </View>
          <IconButton
            accessibilityLabel={isSaved ? t('resources.unsave') : t('resources.save')}
            onPress={() => toggleSaved.mutate(workshop.id)}
            icon={
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? theme.colors.brand.primary : theme.colors.text.secondary}
              />
            }
          />
        </View>

        <AppText variant="body" color={theme.colors.text.secondary}>
          {isArabic ? workshop.summaryAr : workshop.summaryEn}
        </AppText>

        <Card style={{ gap: theme.spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.brand.primary} />
            <AppText variant="body" style={{ flex: 1 }}>
              {when}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name="time-outline" size={18} color={theme.colors.brand.primary} />
            <AppText variant="body">{t('resources.durationMinutes', { count: workshop.durationMinutes })}</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name={workshop.online ? 'videocam-outline' : 'location-outline'} size={18} color={theme.colors.brand.primary} />
            <AppText variant="body">{workshop.online ? t('resources.online') : t('resources.inPerson')}</AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons name="people-outline" size={18} color={theme.colors.brand.primary} />
            <AppText variant="body">{t('resources.capacity', { count: workshop.capacity })}</AppText>
          </View>
        </Card>

        <Card>
          <AppText variant="titleMd">{t('resources.facilitatorTitle')}</AppText>
          <AppText variant="body" style={{ marginTop: theme.spacing.xxs }}>
            {workshop.facilitatorName}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {isArabic ? workshop.facilitatorTitleAr : workshop.facilitatorTitleEn}
          </AppText>
        </Card>

        <Button
          label={isRegistered ? t('resources.cancelRegistration') : t('resources.register')}
          variant={isRegistered ? 'secondary' : 'primary'}
          loading={toggleRegistration.isPending}
          onPress={() =>
            toggleRegistration.mutate(workshop.id, {
              onSuccess: (registered) =>
                toast.show({
                  message: registered ? t('resources.registeredToast') : t('resources.unregisteredToast'),
                  tone: 'success',
                }),
              onError: (error) => toast.show({ message: (error as AppError).message, tone: 'error' }),
            })
          }
        />
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('resources.registrationLocalNote')}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
