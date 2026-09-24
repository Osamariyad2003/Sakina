import { storage, storageKeys } from '../../../core/storage/mmkv';
import { simulateLatency } from '../../../core/async/simulateLatency';
import type { WellnessCategory } from '../../../types/models';

/**
 * [ASSUMPTION] No backend exists yet — same MMKV mock pattern as the other
 * feature services. Before this file existed, `ActiveExerciseScreen`'s
 * completion never recorded anything: Home's "wellnessMinutes" tracker and
 * the badge engine's `wellnessSessionCount`/`wellnessMinutes` /
 * `mindfulMinutes` signals only ever saw Stress Management technique
 * sessions (`stress-management/stressService.ts`), so a completed
 * breathing/grounding/relaxation/meditation/sleep-category exercise from
 * the main Wellness tab was invisible everywhere — including the
 * already-defined "An hour of calm" badge, which could never actually be
 * earned. This is the missing write side of that.
 */

export interface WellnessSession {
  id: string;
  exerciseId: string;
  category: WellnessCategory;
  durationSeconds: number;
  completedAt: string;
}

function readSessions(): WellnessSession[] {
  return storage.getJSON<WellnessSession[]>(storageKeys.mockWellnessSessions) ?? [];
}

function writeSessions(sessions: WellnessSession[]) {
  storage.setJSON(storageKeys.mockWellnessSessions, sessions);
}


export interface CreateWellnessSessionInput {
  exerciseId: string;
  category: WellnessCategory;
  durationSeconds: number;
}

async function createSession(input: CreateWellnessSessionInput): Promise<WellnessSession> {
  await simulateLatency();
  const session: WellnessSession = {
    id: `wellness-session-${Date.now()}`,
    exerciseId: input.exerciseId,
    category: input.category,
    durationSeconds: input.durationSeconds,
    completedAt: new Date().toISOString(),
  };
  writeSessions([session, ...readSessions()]);
  return session;
}

async function listSessions(): Promise<WellnessSession[]> {
  await simulateLatency(120);
  return readSessions();
}

// Mock-only even with the real API on: the backend has no way to list completed wellness
// sessions and identifies exercises by its own ids, so session history stays local.

export const wellnessSessionService = { createSession, listSessions };
