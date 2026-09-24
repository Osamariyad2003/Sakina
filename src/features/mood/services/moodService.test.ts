import { afterEach, describe, expect, it } from 'vitest';
import type { MoodEntry } from '../../../types/models';
import { moodService, setMoodRepository } from './moodService';
import type { CreateMoodEntryInput, MoodRepository } from './moodRepository';

/**
 * These tests exist to prove the seam: before `MoodRepository`, every path
 * here went through either axios or MMKV, chosen by a build flag, so none of
 * it could be exercised in a unit test (docs/architecture-review.md §2.3).
 */

const entry = (id: string, createdAt: string, mood: MoodEntry['mood'] = 'good'): MoodEntry => ({
  id,
  mood,
  emotionIds: [],
  triggerIds: [],
  companionIds: [],
  createdAt,
});

function fakeRepository(entries: MoodEntry[]) {
  const calls: { list: (Date | undefined)[]; created: CreateMoodEntryInput[]; deleted: string[] } = {
    list: [],
    created: [],
    deleted: [],
  };

  const repository: MoodRepository = {
    async list(from?: Date) {
      calls.list.push(from);
      if (!from) return entries;
      return entries.filter((e) => new Date(e.createdAt).getTime() >= from.getTime());
    },
    async findById(id: string) {
      return entries.find((e) => e.id === id) ?? null;
    },
    async create(input: CreateMoodEntryInput) {
      calls.created.push(input);
      const created = entry('created', new Date().toISOString(), input.mood);
      entries.push(created);
      return created;
    },
    async delete(id: string) {
      calls.deleted.push(id);
    },
  };

  return { repository, calls };
}

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('moodService', () => {
  it('returns today’s entry when one was logged today', async () => {
    const today = new Date();
    const { repository } = fakeRepository([entry('a', today.toISOString())]);
    restore = setMoodRepository(repository);

    await expect(moodService.getTodayEntry()).resolves.toMatchObject({ id: 'a' });
  });

  it('returns null when the only entries are from earlier days', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { repository } = fakeRepository([entry('old', yesterday.toISOString())]);
    restore = setMoodRepository(repository);

    await expect(moodService.getTodayEntry()).resolves.toBeNull();
  });

  it('asks the repository only for the window the trend needs', async () => {
    const { repository, calls } = fakeRepository([]);
    restore = setMoodRepository(repository);

    await moodService.getTrend(7);

    const from = calls.list.at(-1);
    expect(from).toBeInstanceOf(Date);
    // Midnight, six days back: seven days inclusive of today.
    expect(from?.getHours()).toBe(0);
    const daysBack = Math.round((Date.now() - (from as Date).getTime()) / 86400000);
    expect(daysBack).toBeGreaterThanOrEqual(6);
    expect(daysBack).toBeLessThanOrEqual(7);
  });

  it('returns one trend point per day, including days with nothing logged', async () => {
    const { repository } = fakeRepository([entry('a', new Date().toISOString(), 'veryGood')]);
    restore = setMoodRepository(repository);

    const trend = await moodService.getTrend(7);

    expect(trend).toHaveLength(7);
    expect(trend.filter((point) => point.averageWeight === null)).toHaveLength(6);
    expect(trend.at(-1)?.averageWeight).not.toBeNull();
  });

  it('passes the creation input straight through to the repository', async () => {
    const { repository, calls } = fakeRepository([]);
    restore = setMoodRepository(repository);

    await moodService.createEntry({ mood: 'low', emotionIds: ['anxious'], triggerIds: ['work'] });

    expect(calls.created).toEqual([{ mood: 'low', emotionIds: ['anxious'], triggerIds: ['work'] }]);
  });

  it('delegates deletion by id', async () => {
    const { repository, calls } = fakeRepository([entry('a', new Date().toISOString())]);
    restore = setMoodRepository(repository);

    await moodService.deleteEntry('a');

    expect(calls.deleted).toEqual(['a']);
  });

  it('restores the previous repository when the seam is released', async () => {
    const first = fakeRepository([entry('first', new Date().toISOString())]);
    const second = fakeRepository([entry('second', new Date().toISOString())]);

    const undoFirst = setMoodRepository(first.repository);
    const undoSecond = setMoodRepository(second.repository);
    undoSecond();

    await expect(moodService.getTodayEntry()).resolves.toMatchObject({ id: 'first' });
    undoFirst();
  });
});
