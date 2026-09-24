import { apiClient } from './client';
import type { ApiSuccess } from './envelope';

/**
 * The backend keeps emotions/triggers as a server catalogue (uuid + `key`),
 * while the app's catalogues (features/mood/models/moodContent.ts) use their
 * own string ids. This maps between the two by `key`, using the small alias
 * tables below where the names differ. App options with no backend
 * counterpart (emotions: stressed, lonely, scared, excited; triggers: study,
 * relationships, unclear) are dropped when saving; backend options with no app
 * counterpart (emotions: grateful, overwhelmed) are dropped when reading.
 * See BACKEND_GAPS in ASSUMPTIONS.md.
 */

interface CatalogItem {
  id: string;
  key: string;
}

/** app id → backend key, where they differ. */
const emotionAppToKey: Record<string, string> = { relaxed: 'calm' };
const triggerAppToKey: Record<string, string> = { socialMedia: 'social_media', sleep: 'sleep_deprivation' };

const invert = (map: Record<string, string>) => Object.fromEntries(Object.entries(map).map(([a, k]) => [k, a]));
const emotionKeyToApp = invert(emotionAppToKey);
const triggerKeyToApp = invert(triggerAppToKey);

const APP_EMOTION_IDS = new Set(['sad', 'anxious', 'stressed', 'tired', 'lonely', 'angry', 'scared', 'relaxed', 'happy', 'excited']);
const APP_TRIGGER_IDS = new Set(['study', 'work', 'family', 'relationships', 'health', 'finances', 'sleep', 'socialMedia', 'unclear']);

let emotionsPromise: Promise<CatalogItem[]> | null = null;
let triggersPromise: Promise<CatalogItem[]> | null = null;

function loadOnce(path: string, cache: Promise<CatalogItem[]> | null): Promise<CatalogItem[]> {
  if (cache) return cache;
  const promise = apiClient.get<ApiSuccess<CatalogItem[]>>(path).then((r) => r.data.data);
  promise.catch(() => {
    // Don't cache a failure — let the next call retry.
    if (path === '/emotions') emotionsPromise = null;
    else triggersPromise = null;
  });
  return promise;
}

async function toApiIds(
  appIds: string[],
  aliases: Record<string, string>,
  load: () => Promise<CatalogItem[]>,
): Promise<string[]> {
  if (appIds.length === 0) return [];
  const catalog = await load();
  const byKey = new Map(catalog.map((c) => [c.key, c.id]));
  return appIds.map((id) => byKey.get(aliases[id] ?? id)).filter((id): id is string => Boolean(id));
}

export function toApiEmotionIds(appIds: string[]): Promise<string[]> {
  return toApiIds(appIds, emotionAppToKey, () => (emotionsPromise = loadOnce('/emotions', emotionsPromise)));
}

export function toApiTriggerIds(appIds: string[]): Promise<string[]> {
  return toApiIds(appIds, triggerAppToKey, () => (triggersPromise = loadOnce('/triggers', triggersPromise)));
}

export function fromApiEmotionKeys(keys: string[]): string[] {
  return keys.map((k) => emotionKeyToApp[k] ?? k).filter((id) => APP_EMOTION_IDS.has(id));
}

export function fromApiTriggerKeys(keys: string[]): string[] {
  return keys.map((k) => triggerKeyToApp[k] ?? k).filter((id) => APP_TRIGGER_IDS.has(id));
}
