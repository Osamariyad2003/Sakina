import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card, AppText, Avatar, Badge, resolveImageUri } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { getSpecialty, sessionModeMeta } from '../models/professionalContent';
import type { Professional } from '../../../types/models';

interface TherapistCardProps {
  professional: Professional;
  onPress: () => void;
}

/**
 * Directory row: photo/initials, name, title, specialties, session modes and
 * — deliberately prominent — whether the listing's licence has actually been
 * checked. An unverified listing says so rather than silently omitting the
 * badge, so absence of a badge can never be read as "probably fine".
 */
export function TherapistCard({ professional, onPress }: TherapistCardProps) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const specialties = professional.specialtyIds
    .map((id) => getSpecialty(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => (isArabic ? s.labelAr : s.labelEn));

  return (
    <Card onPress={onPress} style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Avatar uri={resolveImageUri(professional.image, true)} initials={professional.fullName} size={52} />
        <View style={{ flex: 1 }}>
          <AppText variant="titleMd">{professional.fullName}</AppText>
          <AppText variant="caption" color={theme.colors.text.secondary}>
            {isArabic ? professional.titleAr : professional.titleEn}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs, marginTop: theme.spacing.xxs }}>
            {professional.rating != null ? (
              <>
                <Ionicons name="star" size={12} color={theme.colors.accent.reflection} />
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {professional.rating.toFixed(1)} · {t('professionals.reviewCount', { count: professional.reviewCount })}
                </AppText>
              </>
            ) : null}
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xxs }}>
        {specialties.map((label) => (
          <Badge key={label} label={label} color={theme.colors.accent.mood} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        {professional.sessionModes.map((mode) => (
          <View key={mode} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
            <Ionicons name={sessionModeMeta[mode].icon} size={14} color={theme.colors.text.secondary} />
            <AppText variant="caption" color={theme.colors.text.secondary}>
              {isArabic ? sessionModeMeta[mode].labelAr : sessionModeMeta[mode].labelEn}
            </AppText>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Ionicons
          name={professional.verified ? 'shield-checkmark-outline' : 'alert-circle-outline'}
          size={14}
          color={professional.verified ? theme.colors.status.success : theme.colors.status.warning}
        />
        <AppText
          variant="caption"
          color={professional.verified ? theme.colors.status.success : theme.colors.status.warning}
        >
          {professional.verified ? t('professionals.verified') : t('professionals.notVerified')}
        </AppText>
      </View>
    </Card>
  );
}
