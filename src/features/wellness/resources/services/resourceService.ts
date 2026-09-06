import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { AppError } from '../../../../core/errors';
import { config } from '../../../../config';
import i18n from '../../../../i18n';
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

function fakeDelay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function listArticles(filter: ArticleFilter = {}): Promise<ResourceArticle[]> {
  await fakeDelay();
  const isArabic = i18n.language !== 'en';
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
  await fakeDelay(120);
  const article = getArticle(id);
  if (!article) throw new AppError(i18n.t('resources.articleNotFound'), 'unknown', 404);
  return article;
}

async function listWorkshops(topic?: ResourceTopic | null): Promise<Workshop[]> {
  await fakeDelay();
  const upcoming = upcomingWorkshops();
  return topic ? upcoming.filter((w) => w.topic === topic) : upcoming;
}

async function getWorkshopById(id: string): Promise<Workshop> {
  await fakeDelay(120);
  const workshop = getWorkshop(id);
  if (!workshop) throw new AppError(i18n.t('resources.workshopNotFound'), 'unknown', 404);
  return workshop;
}

async function listSaved(): Promise<{ articles: ResourceArticle[]; workshops: Workshop[] }> {
  await fakeDelay(150);
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
  await fakeDelay(150);
  const ids = new Set(readRegistrations());
  return upcomingWorkshops().filter((w) => ids.has(w.id));
}

async function isRegistered(workshopId: string): Promise<boolean> {
  return readRegistrations().includes(workshopId);
}

async function toggleRegistration(workshopId: string): Promise<boolean> {
  await fakeDelay(200);
  if (!getWorkshop(workshopId)) {
    throw new AppError(i18n.t('resources.workshopNotFound'), 'unknown', 404);
  }
  const registrations = readRegistrations();
  const next = registrations.includes(workshopId)
    ? registrations.filter((id) => id !== workshopId)
    : [workshopId, ...registrations];
  writeRegistrations(next);
  return next.includes(workshopId);
}

if (!config.useMockServices) {
  throw new AppError(
    'resourceService: config.useMockServices=false but no real implementation is wired up yet.',
    'unknown',
  );
}

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
