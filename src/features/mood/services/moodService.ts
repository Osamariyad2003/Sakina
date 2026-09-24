import type { MoodEntry } from '../../../types/models';
import { buildMoodTrend, isSameDay, type TrendPoint } from '../models/moodTrend';
import type { CreateMoodEntryInput, MoodRepository } from './moodRepository';

/**
 * Mood use cases, composed over a `MoodRepository`.
 *
 * What changed, and why (docs/architecture-review.md §2.3, §6.1):
 * - transport and persistence moved to `httpMoodRepository` /
 *   `localMoodRepository`, which both satisfy one interface;
 * - the trend rule moved to `models/moodTrend.ts`, where it is a pure
 *   function with its own tests;
 * - this module now only orchestrates — fetch what is needed, apply the rule,
 *   return the result.
 *
 * This module imports no implementation at all: `core/composition.ts` wires
 * one in at startup, and a test injects a fake. That is what keeps these use
 * cases runnable without axios, MMKV or React Native.
 */

let repository: MoodRepository | null = null;

/** Wires an implementation. Returns a restore function, so tests can undo it. */
export function setMoodRepository(next: MoodRepository): () => void {
  const previous = repository;
  repository = next;
  return () => {
    repository = previous;
  };
}

function activeRepository(): MoodRepository {
  if (!repository) {
    // Loud on purpose: a missing wire-up is a programming error at startup,
    // not something to paper over with a silent empty result.
    throw new Error('Mood repository has not been wired — call composeRepositories() at startup.');
  }
  return repository;
}

async function listEntries(): Promise<MoodEntry[]> {
  return activeRepository().list();
}

async function getTodayEntry(): Promise<MoodEntry | null> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const nowIso = new Date().toISOString();
  const entries = await activeRepository().list(startOfToday);
  return entries.find((entry) => isSameDay(entry.createdAt, nowIso)) ?? null;
}

async function getEntry(id: string): Promise<MoodEntry | null> {
  return activeRepository().findById(id);
}

async function createEntry(input: CreateMoodEntryInput): Promise<MoodEntry> {
  return activeRepository().create(input);
}

async function deleteEntry(id: string): Promise<void> {
  return activeRepository().delete(id);
}

/** Last N days' average mood weight, oldest first — RTL-aware rendering happens in the component. */
async function getTrend(days: number): Promise<TrendPoint[]> {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const entries = await activeRepository().list(start);
  return buildMoodTrend(entries, days);
}

export const moodService = {
  listEntries,
  getTodayEntry,
  getEntry,
  createEntry,
  deleteEntry,
  getTrend,
};

export type { CreateMoodEntryInput } from './moodRepository';
export type { TrendPoint } from '../models/moodTrend';
