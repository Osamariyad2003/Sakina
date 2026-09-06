import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { AppError } from '../../../../core/errors';
import { config } from '../../../../config';
import { stressTechniques, type StressSession } from '../models/stressContent';
import type { WellnessExerciseContent } from '../../models/wellnessContent';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
 * #4) — same mock pattern as journal/mood/companion services: MMKV
 * persistence, `fakeDelay` to exercise real loading states, and a loud
 * failure if `config.useMockServices` is ever flipped without a real
 * implementation wired up. `listTechniques()` wraps the static content
 * array in a promise (rather than reading it directly, as generic Wellness
 * screens do) so this feature's Overview screen gets real
 * loading/empty/error/success states per its own Definition of Done, and
 * so a real content API can replace this function later without touching
 * any screen.
 */

function readSessions(): StressSession[] {
  return storage.getJSON<StressSession[]>(storageKeys.mockStressSessions) ?? [];
}

function writeSessions(sessions: StressSession[]) {
  storage.setJSON(storageKeys.mockStressSessions, sessions);
}

function fakeDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listTechniques(): Promise<WellnessExerciseContent[]> {
  await fakeDelay();
  return stressTechniques;
}

export interface CreateStressSessionInput {
  techniqueId: string;
  durationSeconds: number;
  moodEntryId?: string;
}

async function createSession(input: CreateStressSessionInput): Promise<StressSession> {
  await fakeDelay(200);
  const now = new Date().toISOString();
  const session: StressSession = {
    id: `stress-session-${Date.now()}`,
    techniqueId: input.techniqueId,
    category: 'stressRelief',
    startedAt: now,
    completedAt: now,
    durationSeconds: input.durationSeconds,
    moodEntryId: input.moodEntryId,
  };
  writeSessions([session, ...readSessions()]);
  return session;
}

/** Read back completed sessions — used by Home's "wellness minutes" tracker signal. */
async function listSessions(): Promise<StressSession[]> {
  await fakeDelay(150);
  return readSessions();
}

if (!config.useMockServices) {
  throw new AppError('stressService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const stressService = { listTechniques, createSession, listSessions };
