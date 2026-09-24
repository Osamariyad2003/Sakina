import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { simulateLatency } from '../../../../core/async/simulateLatency';
import { AppError } from '../../../../core/errors';
import {
  resourceArticles,
  upcomingWorkshops,
  getArticle,
  getWorkshop,
  type ResourceArticle,
  type ResourceTopic,
  type Workshop,
} from '../models/resourceContent';

/**
 * Articles and workshops are static editorial content, so only the user's own
 * choices need persisting: what they saved, and which workshops they
 * registered for.
 *
 * [ASSUMPTION] Registration is local-only — there is no registration API and
 * the app takes no payment, so "registered" means "I intend to attend" and
 * the workshop detail screen says exactly that. See ASSUMPTIONS.md.
 */


function readSaved(): string[] {
  return storage.getJSON<string[]>(storageKeys.savedResources) ?? [];
}

function writeSaved(ids: string[]) {
  storage.setJSON(storageKeys.savedResources, ids);
}

function readRegistrations(): string[] {
  return storage.getJSON<string[]>(storageKeys.mockWorkshopRegistrations) ?? [];
}

function writeRegistrations(ids: string[]) {
  storage.setJSON(storageKeys.mockWorkshopRegistrations, ids);
}

export interface ArticleFilter {
  topic?: ResourceTopic | null;
  search?: string;
}

/** `isArabic` comes from the caller — see searchService for why. */
async function listArticles(filter: ArticleFilter = {}, isArabic = true): Promise<ResourceArticle[]> {
  await simulateLatency();
  const needle = filter.search?.trim().toLowerCase() ?? '';
  return resourceArticles.filter((article) => {
    if (filter.topic && article.topic !== filter.topic) return false;
    if (!needle) return true;
    const haystack = isArabic
      ? `${article.titleAr} ${article.summaryAr}`
      : `${article.titleEn} ${article.summaryEn}`;
    return haystack.toLowerCase().includes(needle);
  });
}

async function getArticleById(id: string): Promise<ResourceArticle> {
  await simulateLatency(120);
  const article = getArticle(id);
  if (!article) throw AppError.withKey('resources.articleNotFound', 'unknown', 404);
  return article;
}

async function listWorkshops(topic?: ResourceTopic | null): Promise<Workshop[]> {
  await simulateLatency();
  const upcoming = upcomingWorkshops();
  return topic ? upcoming.filter((w) => w.topic === topic) : upcoming;
}

async function getWorkshopById(id: string): Promise<Workshop> {
  await simulateLatency(120);
  const workshop = getWorkshop(id);
  if (!workshop) throw AppError.withKey('resources.workshopNotFound', 'unknown', 404);
  return workshop;
}

async function listSaved(): Promise<{ articles: ResourceArticle[]; workshops: Workshop[] }> {
  await simulateLatency(150);
  const savedIds = new Set(readSaved());
  return {
    articles: resourceArticles.filter((a) => savedIds.has(a.id)),
    workshops: upcomingWorkshops().filter((w) => savedIds.has(w.id)),
  };
}

async function isSaved(id: string): Promise<boolean> {
  return readSaved().includes(id);
}

/** Save/unsave in one call so the UI never has to know which direction it is going. */
async function toggleSaved(id: string): Promise<boolean> {
  const saved = readSaved();
  const next = saved.includes(id) ? saved.filter((s) => s !== id) : [id, ...saved];
  writeSaved(next);
  return next.includes(id);
}

async function listRegistrations(): Promise<Workshop[]> {
  await simulateLatency(150);
  const ids = new Set(readRegistrations());
  return upcomingWorkshops().filter((w) => ids.has(w.id));
}

async function isRegistered(workshopId: string): Promise<boolean> {
  return readRegistrations().includes(workshopId);
}

async function toggleRegistration(workshopId: string): Promise<boolean> {
  await simulateLatency(200);
  if (!getWorkshop(workshopId)) {
    throw AppError.withKey('resources.workshopNotFound', 'unknown', 404);
  }
  const registrations = readRegistrations();
  const next = registrations.includes(workshopId)
    ? registrations.filter((id) => id !== workshopId)
    : [workshopId, ...registrations];
  writeRegistrations(next);
  return next.includes(workshopId);
}

// Mock-only even with the real API on: the backend /resources is a flat title/body/tags
// list with no topics, sections, workshops, saves or registrations, so the app's bundled
// editorial content stays local.

export const resourceService = {
  listArticles,
  getArticleById,
  listWorkshops,
  getWorkshopById,
  listSaved,
  isSaved,
  toggleSaved,
  listRegistrations,
  isRegistered,
  toggleRegistration,
};
