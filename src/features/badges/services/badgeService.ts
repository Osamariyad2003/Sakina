import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { moodService } from '../../mood/services/moodService';
import { journalService } from '../../journal/services/journalService';
import { stressService } from '../../wellness/stress-management/services/stressService';
import { wellnessSessionService } from '../../wellness/services/wellnessSessionService';
import { sleepService } from '../../wellness/sleep/services/sleepService';
import { hydrationService } from '../../wellness/hydration/services/hydrationService';
import { resourceService } from '../../wellness/resources/services/resourceService';
import { communityService } from '../../community/services/communityService';
import { notificationService } from '../../notifications/services/notificationService';
import { evaluateBadges, type BadgeProgress, type BadgeSignals } from '../models/badgeContent';

/**
 * Badges are **derived, never stored as awards**: every evaluation recomputes
 * from the user's own data, so a badge can't drift out of step with reality
 * and there is no separate award table to corrupt. The only thing persisted
 * is which badges have already been celebrated, so a notification fires once.
 *
 * Reads through the existing mock services (each carries its own
 * `config.useMockServices` guard); this module persists the seen-set itself,
 * so it carries a guard too.
 */

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Consecutive days ending today present in `daySet`. */
function consecutiveStreak(daySet: Set<string>): number {
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (daySet.has(dateKey(d))) streak++;
    else break;
  }
  return streak;
}

function readSeen(): string[] {
  return storage.getJSON<string[]>(storageKeys.badgesSeen) ?? [];
}

function writeSeen(ids: string[]) {
  storage.setJSON(storageKeys.badgesSeen, ids);
}

/** Categories that count as "mindful" practice (Feature 7) — grounding/stressRelief/sleep content have their own tracking already. */
const mindfulCategories = new Set(['meditation', 'breathing', 'relaxation']);

async function getSignals(): Promise<BadgeSignals> {
  const [moodEntries, journalEntries, stressSessions, wellnessSessions, sleepRecords, hydrationHistory, saved, registrations, groups] =
    await Promise.all([
      moodService.listEntries(),
      journalService.list(),
      stressService.listSessions(),
      wellnessSessionService.listSessions(),
      sleepService.listRecords(),
      hydrationService.listHistory(),
      resourceService.listSaved(),
      resourceService.listRegistrations(),
      communityService.listGroups(),
    ]);

  // Community counts come from the user's own threads/posts across every group.
  let communityPostCount = 0;
  let communitySupportGiven = 0;
  const threadLists = await Promise.all(groups.map((group) => communityService.listThreads(group.id)));
  for (const threads of threadLists) {
    for (const thread of threads) {
      const detail = await communityService.getThread(thread.id);
      communityPostCount += detail.posts.filter((p) => p.isMine).length;
      communitySupportGiven += detail.posts.filter((p) => !p.isMine && p.supportedByMe).length;
    }
  }

  const moodDays = new Set(moodEntries.map((e) => e.createdAt.slice(0, 10)));
  const journalDays = new Set(journalEntries.map((e) => e.createdAt.slice(0, 10)));
  const mindfulSessions = wellnessSessions.filter((s) => mindfulCategories.has(s.category));
  const mindfulDays = new Set(mindfulSessions.map((s) => s.completedAt.slice(0, 10)));

  const allTimestamps = [
    ...moodEntries.map((e) => e.createdAt),
    ...journalEntries.map((e) => e.createdAt),
    ...stressSessions.map((s) => s.startedAt),
    ...wellnessSessions.map((s) => s.completedAt),
  ].sort();
  const firstActivity = allTimestamps[0];
  const daysActive = firstActivity
    ? Math.floor((Date.now() - new Date(firstActivity).getTime()) / 86400000)
    : 0;

  return {
    moodCheckInCount: moodEntries.length,
    moodCheckInStreak: consecutiveStreak(moodDays),
    journalEntryCount: journalEntries.length,
    journalStreak: consecutiveStreak(journalDays),
    // Every completed session across Stress Management *and* the general Wellness
    // exercise flow (breathing/grounding/relaxation/meditation/sleep content).
    wellnessSessionCount: stressSessions.length + wellnessSessions.length,
    wellnessMinutes: Math.round(
      [...stressSessions.map((s) => s.durationSeconds), ...wellnessSessions.map((s) => s.durationSeconds)].reduce(
        (sum, seconds) => sum + seconds / 60,
        0,
      ),
    ),
    mindfulMinutes: Math.round(mindfulSessions.reduce((sum, s) => sum + s.durationSeconds / 60, 0)),
    mindfulStreak: consecutiveStreak(mindfulDays),
    sleepRecordCount: sleepRecords.length,
    hydrationLogCount: hydrationHistory.length,
    articlesRead: saved.articles.length,
    workshopsRegistered: registrations.length,
    communityPostCount,
    communitySupportGiven,
    daysActive,
  };
}

async function list(): Promise<BadgeProgress[]> {
  const signals = await getSignals();
  return evaluateBadges(signals);
}

async function get(badgeId: string): Promise<BadgeProgress> {
  const all = await list();
  const found = all.find((b) => b.definition.id === badgeId);
  if (!found) throw AppError.withKey('badges.notFound', 'unknown', 404);
  return found;
}

/**
 * Posts an inbox notification for every badge earned since the last check.
 * Returns the newly-celebrated badges so a screen can also show them inline.
 */
async function celebrateNewlyEarned(): Promise<BadgeProgress[]> {
  const all = await list();
  const seen = new Set(readSeen());
  const fresh = all.filter((b) => b.earned && !seen.has(b.definition.id));
  if (fresh.length === 0) return [];

  const now = new Date().toISOString();
  for (const badge of fresh) {
    await notificationService.push({
      id: `badge-${badge.definition.id}`,
      category: 'badge',
      titleAr: 'وسام جديد',
      titleEn: 'New badge',
      bodyAr: `${badge.definition.titleAr} — ${badge.definition.descriptionAr}`,
      bodyEn: `${badge.definition.titleEn} — ${badge.definition.descriptionEn}`,
      createdAt: now,
      target: { kind: 'badges' },
    });
  }
  writeSeen([...seen, ...fresh.map((b) => b.definition.id)]);
  return fresh;
}

// Derived client-side from the other services (which are live when the real API is on), so
// there is nothing backend-specific to switch. The backend badge catalogue has no matching
// model.

export const badgeService = { getSignals, list, get, celebrateNewlyEarned };
