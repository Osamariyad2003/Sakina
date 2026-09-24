import { apiClient, parseContract, unwrap, type ApiSuccess } from '../../../core/api';
import { storage, storageKeys } from '../../../core/storage/mmkv';
import { ContentImageSchema, type ContentImage } from '../../../types/models';

/**
 * Imagery for content whose *copy* ships with the app. Articles and wellness
 * exercises are editorial content in `resourceContent.ts` / `wellnessContent.ts`
 * — reviewed in code, translated in code — while their photos are curated in
 * the admin panel and keyed by the same id used in those files.
 *
 * The whole set comes down in one call (there are dozens at most) and is
 * cached so a cold start still shows yesterday's imagery offline.
 */

export type ContentImageTarget = 'resource_article' | 'wellness_exercise';

/** `{ resource_article: { 'article-anxiety-body': {...} }, wellness_exercise: {...} }` */
export type ContentImageMap = Record<ContentImageTarget, Record<string, ContentImage>>;

interface ApiContentImage {
  target: ContentImageTarget;
  contentKey: string;
  url: string;
  thumbUrl?: string | null;
  blurHash?: string | null;
  altAr?: string | null;
  altEn?: string | null;
  source?: 'unsplash' | 'upload' | null;
  authorName?: string | null;
  authorUrl?: string | null;
}

const emptyMap = (): ContentImageMap => ({ resource_article: {}, wellness_exercise: {} });

function toMap(rows: ApiContentImage[]): ContentImageMap {
  const map = emptyMap();
  for (const row of rows) {
    // An unknown target would mean the backend added a content type this build
    // doesn't know about — skip it rather than crash the screen.
    if (!map[row.target]) continue;
    map[row.target][row.contentKey] = parseContract(ContentImageSchema, {
      url: row.url,
      thumbUrl: row.thumbUrl ?? undefined,
      blurHash: row.blurHash ?? undefined,
      altAr: row.altAr ?? undefined,
      altEn: row.altEn ?? undefined,
      source: row.source ?? undefined,
      authorName: row.authorName ?? undefined,
      authorUrl: row.authorUrl ?? undefined,
    }, `GET /content-images (${row.target}/${row.contentKey})`);
  }
  return map;
}

async function list(): Promise<ContentImageMap> {
  try {
    const rows = unwrap(await apiClient.get<ApiSuccess<ApiContentImage[]>>('/content-images'));
    const map = toMap(rows);
    storage.setJSON(storageKeys.contentImages, map);
    return map;
  } catch (error) {
    // Imagery is decoration: offline or a failing endpoint must never take a
    // reading screen down. Fall back to the last set we saw, else none.
    const cached = storage.getJSON<ContentImageMap>(storageKeys.contentImages);
    if (cached) return { ...emptyMap(), ...cached };
    return emptyMap();
  }
}

export const contentImageService = { list };
