import React from 'react';
import { View, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Screen, AppText, Card, Button, TextField, Badge, EmptyState } from '../../../ui/primitives';
import { useTheme } from '../../../ui/theme';
import { config } from '../../../config';
import { useTodayMoodQuery } from '../../mood/state/useMoodQueries';
import { GreetingHeader } from '../components/GreetingHeader';
import { HomeSectionHeader } from '../components/HomeSectionHeader';
import { MoodCheckInRow } from '../components/MoodCheckInRow';
import { WellbeingReflectionCard } from '../components/WellbeingReflectionCard';
import { MoodSummaryCard } from '../components/MoodSummaryCard';
import { TrackerRow } from '../components/TrackerRow';
import { StressLevelRow } from '../components/StressLevelRow';
import { useTrackerSignalsQuery, useWellbeingReflectionQuery } from '../state/useHomeQueries';
import { useUnreadNotificationCountQuery } from '../../notifications/state/useNotificationQueries';
import { useAppointmentsQuery } from '../../professional-help/state/useProfessionalQueries';
import { AppointmentCard } from '../../professional-help/components/AppointmentCard';
import { useArticlesQuery } from '../../wellness/resources/state/useResourceQueries';
import { ResourceCard } from '../../wellness/resources/components/ResourceCard';
import type { HomeStackParamList, AppTabsParamList } from '../../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<AppTabsParamList>
>;

/**
 * Hub screen (spec §13). Structurally this now follows the SH Freud reference
 * Home top-to-bottom — greeting, search, metrics carousel, tracker rows,
 * inline mood check-in, appointments, therapy, resources — with three
 * deliberate departures documented in ASSUMPTIONS.md:
 *
 * - No "Freud Score". The hero card is the non-diagnostic Wellbeing
 *   Reflection; nothing on Home renders a mental-health score.
 * - The safety entry stays prominent and near the top of the actionable
 *   cards, not buried under editorial content (spec §21).
 * - Sections whose feature is switched off (`config.featureFlags`) are
 *   omitted entirely rather than shown as dead links.
 */
export function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = React.useState(false);

  const todayMoodQuery = useTodayMoodQuery();
  const reflectionQuery = useWellbeingReflectionQuery();
  const trackersQuery = useTrackerSignalsQuery();
  const unreadQuery = useUnreadNotificationCountQuery();
  const appointmentsQuery = useAppointmentsQuery();
  const articlesQuery = useArticlesQuery({});

  const unreadCount = unreadQuery.data ?? 0;
  const upcomingAppointments = (appointmentsQuery.data ?? [])
    .filter((a) => a.status !== 'cancelled' && new Date(a.startsAt).getTime() >= Date.now())
    .slice(0, 2);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      todayMoodQuery.refetch(),
      reflectionQuery.refetch(),
      trackersQuery.refetch(),
      unreadQuery.refetch(),
      appointmentsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [todayMoodQuery, reflectionQuery, trackersQuery, unreadQuery, appointmentsQuery]);

  return (
    <Screen edges={['top']} padded={false}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <GreetingHeader />
          </View>
          {config.featureFlags.notifications ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0 ? t('notifications.unreadLabel', { count: unreadCount }) : t('notifications.title')
              }
              onPress={() => navigation.navigate('Notifications')}
              style={{
                width: theme.sizes.touchTarget,
                height: theme.sizes.touchTarget,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
              {unreadCount > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    end: 4,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.status.error,
                  }}
                >
                  <AppText variant="caption" color={theme.colors.text.onBrand}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          ) : null}
        </View>

        {/* Real search now — opens the global Search screen (features/search). */}
        <Pressable
          onPress={() => navigation.navigate('Search', undefined)}
          accessibilityRole="search"
          accessibilityLabel={t('home.searchPlaceholder')}
        >
          <View pointerEvents="none">
            <TextField placeholder={t('home.searchPlaceholder')} editable={false} value="" />
          </View>
        </Pressable>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: theme.spacing.sm, paddingEnd: theme.spacing.md }}
        >
          <WellbeingReflectionCard />
          <MoodSummaryCard />
        </ScrollView>

        <View style={{ gap: theme.spacing.sm }}>
          {trackersQuery.data?.map((signal) =>
            signal.key === 'stressLevel' ? (
              <StressLevelRow key={signal.key} signal={signal} />
            ) : (
              <TrackerRow key={signal.key} signal={signal} />
            ),
          )}
        </View>

        <MoodCheckInRow
          todayMood={todayMoodQuery.data?.mood ?? null}
          onSelect={(mood) => navigation.navigate('MoodTab', { screen: 'MoodCheckIn', params: { initialMood: mood } })}
        />

        {/* Prominent, ≤2-tap safety entry — never buried (spec §21, business rules). */}
        <Card
          onPress={() => navigation.navigate('ProfileTab', { screen: 'Safety' })}
          style={{ backgroundColor: theme.colors.status.error }}
        >
          <AppText variant="titleMd" color={theme.colors.text.onBrand}>
            {t('safety.entryLabel')}
          </AppText>
        </Card>

        <Card onPress={() => navigation.navigate('CompanionTab', { screen: 'SymptomCheckerIntro' })}>
          <AppText variant="titleMd">{t('checker.homeCardTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {t('checker.homeCardSubtitle')}
          </AppText>
        </Card>

        {config.featureFlags.professionalBooking ? (
          <View style={{ gap: theme.spacing.sm }}>
            <HomeSectionHeader
              title={t('professionals.homeSectionTitle')}
              onSeeAll={() => navigation.navigate('Appointments')}
            />
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appointment.id })}
                />
              ))
            ) : (
              <Card onPress={() => navigation.navigate('TherapistDirectory')}>
                <AppText variant="titleMd">{t('professionals.homeEmptyTitle')}</AppText>
                <AppText variant="body" color={theme.colors.text.secondary}>
                  {t('professionals.homeEmptyBody')}
                </AppText>
              </Card>
            )}
          </View>
        ) : null}

        <Card onPress={() => navigation.navigate('CompanionTab', { screen: 'TherapyIntro' })}>
          <AppText variant="titleMd">{t('therapy.homeCardTitle')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {t('therapy.homeCardSubtitle')}
          </AppText>
        </Card>

        <Card onPress={() => navigation.navigate('CompanionTab', { screen: 'Conversation' })}>
          <AppText variant="titleMd">{t('tabs.companion')}</AppText>
          <AppText variant="body" color={theme.colors.text.secondary}>
            {t('companion.emptyBody')}
          </AppText>
        </Card>

        <View style={{ gap: theme.spacing.sm }}>
          <HomeSectionHeader
            title={t('community.homeSectionTitle')}
            onSeeAll={() => navigation.navigate('Community')}
          />
          <Card onPress={() => navigation.navigate('Community')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name="people-outline" size={22} color={theme.colors.accent.stress} />
              <View style={{ flex: 1 }}>
                <AppText variant="titleMd">{t('community.homeCardTitle')}</AppText>
                <AppText variant="caption" color={theme.colors.text.secondary}>
                  {t('community.homeCardSubtitle')}
                </AppText>
              </View>
            </View>
          </Card>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <HomeSectionHeader
            title={t('resources.homeSectionTitle')}
            onSeeAll={() => navigation.navigate('WellnessTab', { screen: 'WellnessResources' })}
          />
          {(articlesQuery.data ?? []).length === 0 ? (
            <EmptyState title={t('resources.noArticlesTitle')} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.sm, paddingEnd: theme.spacing.md }}
            >
              {(articlesQuery.data ?? []).slice(0, 5).map((article) => (
                <ResourceCard
                  key={article.id}
                  article={article}
                  compact
                  onPress={() =>
                    navigation.navigate('WellnessTab', { screen: 'ResourceDetail', params: { resourceId: article.id } })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          <Card style={{ flex: 1 }} onPress={() => navigation.navigate('JournalTab', { screen: 'JournalList' })}>
            <AppText variant="titleMd">{t('tabs.journal')}</AppText>
          </Card>
          <Card style={{ flex: 1 }} onPress={() => navigation.navigate('WellnessTab', { screen: 'StressOverview' })}>
            <AppText variant="titleMd">{t('home.wellnessCardTitle')}</AppText>
          </Card>
        </View>

        <Card onPress={() => navigation.navigate('ProfileTab', { screen: 'Badges' })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <Ionicons name="ribbon-outline" size={22} color={theme.colors.accent.reflection} />
            <View style={{ flex: 1 }}>
              <AppText variant="titleMd">{t('badges.title')}</AppText>
              <AppText variant="caption" color={theme.colors.text.secondary}>
                {t('badges.homeCardSubtitle')}
              </AppText>
            </View>
            <Badge label={t('home.seeAll')} />
          </View>
        </Card>

        <Button label={t('home.refresh')} variant="ghost" onPress={onRefresh} />
      </ScrollView>
    </Screen>
  );
}
