import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, TextField, Chip, Card, Button, SkeletonList, ErrorState, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { TherapistCard } from '../components/TherapistCard';
import { useProfessionalsQuery } from '../state/useProfessionalQueries';
import { specialtyCatalog, sessionModeMeta } from '../models/professionalContent';
import type { AppError } from '../../../core/errors';
import type { SessionMode } from '../../../types/models';
import type { HomeStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'TherapistDirectory'>;

const modeKeys: SessionMode[] = ['video', 'phone', 'inPerson'];

/**
 * Therapist directory — search + specialty/mode/verified filters over the
 * seed catalogue. The "this is not emergency care" note is deliberately
 * above the list, not buried under it: someone who opens this screen while
 * in crisis must see the safety route before they start comparing profiles.
 */
export function TherapistDirectoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language !== 'en';

  const [search, setSearch] = useState('');
  const [specialtyId, setSpecialtyId] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filter = useMemo(
    () => ({ search, specialtyId, mode, verifiedOnly }),
    [search, specialtyId, mode, verifiedOnly],
  );
  const query = useProfessionalsQuery(filter);

  return (
    <Screen edges={['top']} padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.lg, gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="displayMd" style={{ flex: 1 }}>
            {t('professionals.directoryTitle')}
          </AppText>
          <Button label={t('professionals.myAppointments')} size="md" variant="secondary" onPress={() => navigation.navigate('Appointments')} />
        </View>

        {/* Safety first, always above the list (spec §21 — never buried). */}
        <Card style={{ backgroundColor: theme.colors.status.warning }}>
          <AppText variant="label" color={theme.colors.text.onBrand}>
            {t('professionals.notEmergencyTitle')}
          </AppText>
          <AppText variant="caption" color={theme.colors.text.onBrand} style={{ marginTop: theme.spacing.xxs }}>
            {t('professionals.notEmergencyBody')}
          </AppText>
        </Card>

        <TextField
          placeholder={t('professionals.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel={t('professionals.searchPlaceholder')}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
          <Chip label={t('professionals.filterVerified')} selected={verifiedOnly} onPress={() => setVerifiedOnly((v) => !v)} />
          {modeKeys.map((key) => (
            <Chip
              key={key}
              label={isArabic ? sessionModeMeta[key].labelAr : sessionModeMeta[key].labelEn}
              selected={mode === key}
              onPress={() => setMode((current) => (current === key ? null : key))}
            />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.xs }}>
          {specialtyCatalog.map((specialty) => (
            <Chip
              key={specialty.id}
              label={isArabic ? specialty.labelAr : specialty.labelEn}
              selected={specialtyId === specialty.id}
              onPress={() => setSpecialtyId((current) => (current === specialty.id ? null : specialty.id))}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm }}>
        {query.isLoading ? (
          <SkeletonList rows={4} />
        ) : query.isError ? (
          <ErrorState message={(query.error as AppError).message} onRetry={() => query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <EmptyState
            title={t('professionals.noResultsTitle')}
            description={t('professionals.noResultsBody')}
            actionLabel={t('professionals.clearFilters')}
            onAction={() => {
              setSearch('');
              setSpecialtyId(null);
              setMode(null);
              setVerifiedOnly(false);
            }}
          />
        ) : (
          <FlashList
            data={query.data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginBottom: theme.spacing.sm }}>
                <TherapistCard
                  professional={item}
                  onPress={() => navigation.navigate('TherapistDetail', { professionalId: item.id })}
                />
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
