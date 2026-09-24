import type { MoodEntry, MoodMetrics } from '../../../types/models';

/**
 * The seam the Mood feature depends on.
 *
 * Before this existed, `moodService` was chosen at module load by
 * `config.useMockServices ? mockMoodService : liveMoodService`, so callers
 * imported a concrete implementation and no test could substitute anything
 * (docs/architecture-review.md §2.3). The interface inverts that: the use
 * cases depend on this contract, and HTTP, local storage or a test fake all
 * satisfy it.
 *
 * It is deliberately storage-shaped — get/list/create/delete — and holds no
 * business rules. Aggregation (`buildMoodTrend`) belongs to the domain, not
 * to whatever happens to be persisting the rows.
 */
export interface MoodRepository {
  list(from?: Date): Promise<MoodEntry[]>;
  findById(id: string): Promise<MoodEntry | null>;
  create(input: CreateMoodEntryInput): Promise<MoodEntry>;
  delete(id: string): Promise<void>;
}

export interface CreateMoodEntryInput {
  mood: MoodEntry['mood'];
  emotionIds: string[];
  triggerIds: string[];
  note?: string;
  companionIds?: string[];
  locationLabel?: string;
  metrics?: MoodMetrics;
}
