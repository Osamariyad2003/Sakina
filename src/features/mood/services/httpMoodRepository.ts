import { AppError } from '../../../core/errors/AppError';
import {
  apiClient,
  fetchAllPages,
  fromApiEmotionKeys,
  fromApiTriggerKeys,
  toApiEmotionIds,
  toApiTriggerIds,
  parseContract,
  unwrap,
  type ApiSuccess,
} from '../../../core/api';
import { MoodEntrySchema, type MoodEntry, type MoodMetrics } from '../../../types/models';
import type { CreateMoodEntryInput, MoodRepository } from './moodRepository';

/**
 * `MoodRepository` over the real backend.
 *
 * /mood: POST · GET (paginated, `from`/`to`, newest first) · GET|DELETE /:id.
 * Mapping the app's MoodEntry onto the backend's:
 *   - mood levels are snake_case there (veryLow → very_low)
 *   - emotionIds/triggerIds go through the server catalogue (core/api/catalog.ts)
 *   - `createdAt` ⇄ `occurredAt`; `companionIds` ⇄ `companions`
 *   - metrics: `active`/`eat` (1-10) ⇄ free-text `activity`/`eating` (stored as
 *     the number), `sleepQuality` bad/ok/good ⇄ poor/fair/good, and `stress`
 *     (1-10) is folded into the backend's 3-level `stressLevel` — the exact
 *     number can't be read back, so `metrics.stress` is not restored.
 *
 * Transport and mapping only: no aggregation, no domain rules.
 */

interface ApiMoodEntry {
  id: string;
  mood: string;
  note?: string | null;
  locationLabel?: string | null;
  activity?: string | null;
  eating?: string | null;
  sleepQuality?: string | null;
  stressLevel?: string | null;
  companions: string[];
  occurredAt: string;
  emotions: { emotion: { key: string } }[];
  triggers: { trigger: { key: string } }[];
}

const moodToApi: Record<MoodEntry['mood'], string> = {
  veryLow: 'very_low',
  low: 'low',
  neutral: 'neutral',
  good: 'good',
  veryGood: 'very_good',
};
const moodFromApi = Object.fromEntries(Object.entries(moodToApi).map(([app, api]) => [api, app])) as Record<
  string,
  MoodEntry['mood']
>;

const sleepToApi = { bad: 'poor', ok: 'fair', good: 'good' } as const;
const sleepFromApi: Record<string, NonNullable<MoodMetrics['sleepQuality']>> = {
  poor: 'bad',
  fair: 'ok',
  good: 'good',
  excellent: 'good',
};

function stressBand(stress: number): 'low' | 'medium' | 'high' {
  return stress <= 3 ? 'low' : stress <= 7 ? 'medium' : 'high';
}

/**
 * Maps one backend row onto the domain model, then checks the result against
 * `MoodEntrySchema` — so a renamed or dropped backend field surfaces here as
 * an error instead of reaching a screen as `undefined`.
 */
function fromApiEntry(entry: ApiMoodEntry): MoodEntry {
  const active = entry.activity ? Number(entry.activity) : NaN;
  const eat = entry.eating ? Number(entry.eating) : NaN;
  const metrics: MoodMetrics = {
    ...(Number.isFinite(active) ? { active } : {}),
    ...(Number.isFinite(eat) ? { eat } : {}),
    ...(entry.sleepQuality && sleepFromApi[entry.sleepQuality] ? { sleepQuality: sleepFromApi[entry.sleepQuality] } : {}),
  };
  const mapped = {
    id: entry.id,
    mood: moodFromApi[entry.mood] ?? 'neutral',
    emotionIds: fromApiEmotionKeys(entry.emotions.map((e) => e.emotion.key)),
    triggerIds: fromApiTriggerKeys(entry.triggers.map((t) => t.trigger.key)),
    note: entry.note ?? undefined,
    companionIds: entry.companions,
    locationLabel: entry.locationLabel ?? undefined,
    metrics: Object.keys(metrics).length ? metrics : undefined,
    createdAt: entry.occurredAt,
  };

  return parseContract(MoodEntrySchema, mapped, 'GET /mood');
}

export const httpMoodRepository: MoodRepository = {
  async list(from?: Date) {
    const entries = await fetchAllPages<ApiMoodEntry>('/mood', from ? { from: from.toISOString() } : {});
    return entries.map(fromApiEntry);
  },

  async findById(id: string) {
    try {
      return fromApiEntry(unwrap(await apiClient.get<ApiSuccess<ApiMoodEntry>>(`/mood/${id}`)));
    } catch (error) {
      if (error instanceof AppError && error.status === 404) return null;
      throw error;
    }
  },

  async create(input: CreateMoodEntryInput) {
    const { metrics } = input;
    const body = {
      mood: moodToApi[input.mood],
      note: input.note || undefined,
      locationLabel: input.locationLabel || undefined,
      companions: input.companionIds ?? [],
      emotionIds: await toApiEmotionIds(input.emotionIds),
      triggerIds: await toApiTriggerIds(input.triggerIds),
      activity: metrics?.active !== undefined ? String(metrics.active) : undefined,
      eating: metrics?.eat !== undefined ? String(metrics.eat) : undefined,
      sleepQuality: metrics?.sleepQuality ? sleepToApi[metrics.sleepQuality] : undefined,
      stressLevel: metrics?.stress !== undefined ? stressBand(metrics.stress) : undefined,
    };
    return fromApiEntry(unwrap(await apiClient.post<ApiSuccess<ApiMoodEntry>>('/mood', body)));
  },

  async delete(id: string) {
    await apiClient.delete(`/mood/${id}`);
  },
};
