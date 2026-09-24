import { storage, storageKeys } from '../../../../core/storage/mmkv';
import { simulateLatency } from '../../../../core/async/simulateLatency';
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


async function listTechniques(): Promise<WellnessExerciseContent[]> {
  await simulateLatency();
  return stressTechniques;
}

export interface CreateStressSessionInput {
  techniqueId: string;
  durationSeconds: number;
  moodEntryId?: string;
}

async function createSession(input: CreateStressSessionInput): Promise<StressSession> {
  await simulateLatency(200);
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
  await simulateLatency(150);
  return readSessions();
}

// Mock-only even with the real API on: technique sessions have no backend counterpart (see
// wellnessSessionService). Self-reported stress levels live in stressCheckInService.

export const stressService = { listTechniques, createSession, listSessions };
