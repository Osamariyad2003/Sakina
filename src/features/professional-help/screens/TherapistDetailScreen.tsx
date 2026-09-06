import React from 'react';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Avatar, Badge, Button, LoadingState, ErrorState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { useProfessionalQuery } from '../state/useProfessionalQueries';
import { getSpecialty, sessionModeMeta } from '../models/professionalContent';
import type { AppError } from '../../../core/errors';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TherapistDetail'>;

/**
 * Full profile — bio, specialties, languages, session modes, fee, and an
 * explicit statement of what "verified" does and doesn't mean here. The fee
 * is shown as information only; the app never collects payment (see
 * professionalService: booking records an intent to meet).
 */
export function TherapistDetailScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';
  const query = useProfessionalQuery(route.params.professionalId);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <Screen>
        <ErrorState message={(query.error as AppError)?.message ?? t('professionals.notFound')} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const professional = query.data;
  const specialties = professional.specialtyIds
    .map((id) => getSpecialty(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ alignItems: 'center', gap: theme.spacing.xs }}>
          <Avatar uri={professional.photoUrl} initials={professional.fullName} size={88} />
          <AppText variant="displayMd" style={{ textAlign: 'center' }}>
            {professional.fullName}
          </AppText>
          <AppText variant="body" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
            {isArabic ? professional.titleAr : professional.titleEn}
          </AppText>
          {professional.rating != null ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
              <Ionicons name="star" size={14} color={theme.colors.accent.reflection} />
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {professional.rating.toFixed(1)} · {t('professionals.reviewCount', { count: professional.reviewCount })}
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="titleLg">{professional.yearsExperience}</AppText>
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('professionals.yearsExperience')}
            </AppText>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <AppText variant="titleLg">
              {professional.feePerSession != null ? `${professional.feePerSession} ${professional.currency}` : '—'}
            </AppText>
            <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
              {t('professionals.feePerSession')}
            </AppText>
          </Card>
        </View>

        {professional.bioAr || professional.bioEn ? (
          <Card>
            <AppText variant="titleMd">{t('professionals.aboutTitle')}</AppText>
            <AppText variant="body" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xxs }}>
              {isArabic ? professional.bioAr : professional.bioEn}
            </AppText>
          </Card>
        ) : null}

        <Card>
          <AppText variant="titleMd">{t('professionals.specialtiesTitle')}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs, marginTop: theme.spacing.xs }}>
            {specialties.map((s) => (
              <Badge key={s.id} label={isArabic ? s.labelAr : s.labelEn} color={theme.colors.accent.mood} />
            ))}
          </View>
        </Card>

        <Card>
          <AppText variant="titleMd">{t('professionals.sessionTypesTitle')}</AppText>
          <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
            {professional.sessionModes.map((mode) => (
              <View key={mode} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Ionicons name={sessionModeMeta[mode].icon} size={18} color={theme.colors.brand.primary} />
                <AppText variant="body">{isArabic ? sessionModeMeta[mode].labelAr : sessionModeMeta[mode].labelEn}</AppText>
              </View>
            ))}
            {professional.city ? (
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('professionals.cityLabel')}: {professional.city}
              </AppText>
            ) : null}
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {t('professionals.languagesLabel')}:{' '}
              {professional.languages.map((code) => t(`professionals.language.${code}`)).join('، ')}
            </AppText>
          </View>
        </Card>

        {/* Says exactly what verification covers — and what it doesn't. */}
        <Card style={{ borderTopWidth: 3, borderTopColor: professional.verified ? theme.colors.status.success : theme.colors.status.warning }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Ionicons
              name={professional.verified ? 'shield-checkmark-outline' : 'alert-circle-outline'}
              size={20}
              color={professional.verified ? theme.colors.status.success : theme.colors.status.warning}
            />
            <AppText variant="titleMd" style={{ flex: 1 }}>
              {professional.verified ? t('professionals.verified') : t('professionals.notVerified')}
            </AppText>
          </View>
          <AppText variant="caption" color={theme.colors.text.secondary} style={{ marginTop: theme.spacing.xs }}>
            {professional.verified ? t('professionals.verifiedExplainer') : t('professionals.notVerifiedExplainer')}
          </AppText>
        </Card>

        <Button
          label={t('professionals.bookCta')}
          onPress={() => navigation.navigate('BookAppointment', { professionalId: professional.id })}
        />
        <AppText variant="caption" color={theme.colors.text.secondary} style={{ textAlign: 'center' }}>
          {t('professionals.noPaymentNote')}
        </AppText>
      </ScrollView>
    </Screen>
  );
}
