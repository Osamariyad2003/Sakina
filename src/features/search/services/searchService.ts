import { storage, storageKeys } from '../../../core/storage/mmkv';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { config } from '../../../config';
import { journalService } from '../../journal/services/journalService';
import { moodService } from '../../mood/services/moodService';
import { moodLevels } from '../../mood/models/moodContent';
import { wellnessExercises } from '../../wellness/models/wellnessContent';
import { resourceArticles, upcomingWorkshops } from '../../wellness/resources/models/resourceContent';
import { therapistCatalog, getSpecialty } from '../../professional-help/models/professionalContent';
import { helpArticles } from '../../profile/help/models/helpContent';
import { communityService } from '../../community/services/communityService';
import { communityGroups } from '../../community/models/communityContent';
import {
  matches,
  preview,
  scopeForKind,
  MAX_RECENT_SEARCHES,
  MIN_QUERY_LENGTH,
  type SearchResult,
  type SearchScope,
} from '../models/searchContent';

/**
 * Search runs entirely on-device against the same sources the rest of the app
 * uses — there is no search index and no query ever leaves the device, which
 * matters here because half of what is searched is the user's private journal.
 *
 * Recent searches are stored locally as a convenience. They are cleared by
 * `clearAllLocalContentData()` along with the content itself, because a list
 * of what someone searched for is as revealing as the entries it found.
 */


function readRecent(): string[] {
  return storage.getJSON<string[]>(storageKeys.recentSearches) ?? [];
}

/**
 * `isArabic` is passed in rather than read from a global: this module does not
 * render, so it cannot know the user's language, and importing i18n here pulls
 * React Native into anything that tests it (docs/architecture-review.md §6.5).
 */
async function search(query: string, scope: SearchScope = 'all', isArabic = true): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];
  await simulateLatency();
  const results: SearchResult[] = [];

  // --- The user's own content. ---
  const [journalEntries, moodEntries] = await Promise.all([journalService.list(), moodService.listEntries()]);

  for (const entry of journalEntries) {
    if (!matches(q, entry.title, entry.content)) continue;
    results.push({
      key: `journal:${entry.id}`,
      kind: 'journal',
      entityId: entry.id,
      title: entry.title?.trim() || preview(entry.content, 40),
      subtitle: preview(entry.content),
      createdAt: entry.createdAt,
    });
  }

  for (const entry of moodEntries) {
    const level = moodLevels.find((m) => m.level === entry.mood);
    const levelLabel = level ? (isArabic ? level.labelAr : level.labelEn) : entry.mood;
    if (!matches(q, entry.note, levelLabel, entry.locationLabel)) continue;
    results.push({
      key: `mood:${entry.id}`,
      kind: 'mood',
      entityId: entry.id,
      title: level ? `${level.emoji} ${levelLabel}` : levelLabel,
      subtitle: entry.note ? preview(entry.note) : undefined,
      createdAt: entry.createdAt,
    });
  }

  // --- Learning catalogues. ---
  for (const article of resourceArticles) {
    const title = isArabic ? article.titleAr : article.titleEn;
    const summary = isArabic ? article.summaryAr : article.summaryEn;
    if (!matches(q, title, summary)) continue;
    results.push({ key: `article:${article.id}`, kind: 'article', entityId: article.id, title, subtitle: summary });
  }

  for (const workshop of upcomingWorkshops()) {
    const title = isArabic ? workshop.titleAr : workshop.titleEn;
    const summary = isArabic ? workshop.summaryAr : workshop.summaryEn;
    if (!matches(q, title, summary, workshop.facilitatorName)) continue;
    results.push({ key: `workshop:${workshop.id}`, kind: 'workshop', entityId: workshop.id, title, subtitle: summary });
  }

  for (const exercise of wellnessExercises) {
    const title = isArabic ? exercise.titleAr : exercise.titleEn;
    if (!matches(q, title, exercise.descriptionAr)) continue;
    results.push({
      key: `exercise:${exercise.id}`,
      kind: 'exercise',
      entityId: exercise.id,
      title,
      subtitle: preview(exercise.descriptionAr),
    });
  }

  // --- Support catalogues. ---
  if (config.featureFlags.professionalBooking) {
    for (const professional of therapistCatalog) {
      const specialties = professional.specialtyIds
        .map((id) => getSpecialty(id))
        .map((s) => (s ? (isArabic ? s.labelAr : s.labelEn) : ''))
        .join(' ');
      const title = professional.fullName;
      const subtitle = isArabic ? professional.titleAr : professional.titleEn;
      if (!matches(q, title, subtitle, specialties)) continue;
      results.push({ key: `therapist:${professional.id}`, kind: 'therapist', entityId: professional.id, title, subtitle });
    }
  }

  for (const article of helpArticles) {
    const title = isArabic ? article.questionAr : article.questionEn;
    const answer = isArabic ? article.answerAr : article.answerEn;
    if (!matches(q, title, answer)) continue;
    results.push({ key: `help:${article.id}`, kind: 'help', entityId: article.id, title, subtitle: preview(answer) });
  }

  const threadLists = await Promise.all(communityGroups.map((group) => communityService.listThreads(group.id)));
  for (const threads of threadLists) {
    for (const thread of threads) {
      if (!matches(q, thread.title, thread.excerpt)) continue;
      results.push({
        key: `communityThread:${thread.id}`,
        kind: 'communityThread',
        entityId: thread.id,
        title: thread.title,
        subtitle: preview(thread.excerpt),
        createdAt: thread.createdAt,
      });
    }
  }

  const scoped = scope === 'all' ? results : results.filter((r) => scopeForKind[r.kind] === scope);
  // The user's own dated content sorts newest-first; catalogue entries keep
  // catalogue order, which is editorially meaningful.
  return scoped.sort((a, b) => {
    if (a.createdAt && b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    if (a.createdAt) return -1;
    if (b.createdAt) return 1;
    return 0;
  });
}

async function getRecentSearches(): Promise<string[]> {
  return readRecent();
}

async function rememberSearch(query: string): Promise<string[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return readRecent();
  const next = [q, ...readRecent().filter((item) => item !== q)].slice(0, MAX_RECENT_SEARCHES);
  storage.setJSON(storageKeys.recentSearches, next);
  return next;
}

async function clearRecentSearches(): Promise<string[]> {
  storage.delete(storageKeys.recentSearches);
  return [];
}

// Searches the (live-when-enabled) journal and mood services plus the bundled catalogues
// on the client; the backend /search is not used.

export const searchService = { search, getRecentSearches, rememberSearch, clearRecentSearches };
