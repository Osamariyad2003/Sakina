import { storage, storageKeys } from '../../../core/storage/mmkv';
import { JournalEntrySchema } from '../../../types/models';
import { parseContract } from '../../../core/api';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { AppError } from '../../../core/errors';
import { apiClient, unwrap, type ApiSuccess } from '../../../core/api';
import { config } from '../../../config';
import type { JournalEntry } from '../../../types/models';

/**
 * Real backend when `config.useMockServices` is false (bottom of file); the mock below otherwise.
 * [ASSUMPTION] Mock: no backend was available (product-definition.md Open Question
 * #4) — persists to MMKV, same pattern as auth/mood/companion mocks.
 * Swap for real `apiClient` calls once a backend exists; the exported
 * function signatures are the contract the rest of the app depends on.
 */

function readEntries(): JournalEntry[] {
  return storage.getJSON<JournalEntry[]>(storageKeys.mockJournalEntries) ?? [];
}

function writeEntries(entries: JournalEntry[]) {
  storage.setJSON(storageKeys.mockJournalEntries, entries);
}


export interface JournalEntryInput {
  title?: string;
  content: string;
  promptId?: string;
}

async function mockList(searchTerm?: string): Promise<JournalEntry[]> {
  await simulateLatency();
  const entries = [...readEntries()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (!searchTerm?.trim()) return entries;
  const needle = searchTerm.trim().toLowerCase();
  return entries.filter(
    (e) => e.content.toLowerCase().includes(needle) || (e.title ?? '').toLowerCase().includes(needle),
  );
}

async function mockGet(id: string): Promise<JournalEntry> {
  await simulateLatency(150);
  const entry = readEntries().find((e) => e.id === id);
  if (!entry) {
    throw AppError.withKey('errors.unknown', 'unknown', 404);
  }
  return entry;
}

async function mockCreate(input: JournalEntryInput): Promise<JournalEntry> {
  await simulateLatency();
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: `journal-${Date.now()}`,
    title: input.title,
    content: input.content,
    promptId: input.promptId,
    createdAt: now,
    updatedAt: now,
  };
  writeEntries([entry, ...readEntries()]);
  return entry;
}

async function mockUpdate(id: string, input: JournalEntryInput): Promise<JournalEntry> {
  await simulateLatency();
  const entries = readEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) {
    throw AppError.withKey('errors.unknown', 'unknown', 404);
  }
  const updated: JournalEntry = {
    ...entries[index],
    title: input.title,
    content: input.content,
    promptId: input.promptId,
    updatedAt: new Date().toISOString(),
  };
  entries[index] = updated;
  writeEntries(entries);
  return updated;
}

async function mockRemove(id: string): Promise<void> {
  await simulateLatency(200);
  writeEntries(readEntries().filter((e) => e.id !== id));
}

// --- Real backend (config.useMockServices false) ------------------------
// Endpoints under `apiBaseUrl` (…/api/v1), all authenticated:
//   GET /journal?page&limit(≤100)   → { data: entry[], pagination }, newest first
//   GET /journal/:id · POST /journal · PATCH /journal/:id · DELETE /journal/:id (204)
// Differences from the app's JournalEntry that this layer absorbs:
//   - the backend calls the text `body`, the app calls it `content`
//   - `title` can't be null — clearing it is `title: ''`, read back as undefined
//   - no server-side search (`search`/`q` are ignored), so it's filtered here
//   - `promptId` and `aiReflection` are NOT persisted (the backend drops
//     unknown fields), so an entry's prompt is lost once it's saved
// The mock stays in this file for when the flag is off.

interface ApiJournalEntry {
  id: string;
  title?: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiPagination {
  page: number;
  totalPages: number;
}

const LIVE_PAGE_SIZE = 100;

function fromApi(entry: ApiJournalEntry): JournalEntry {
  const mapped = {
    id: entry.id,
    title: entry.title || undefined,
    content: entry.body,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };

  return parseContract(JournalEntrySchema, mapped, 'GET /journal');
}

async function liveList(searchTerm?: string): Promise<JournalEntry[]> {
  const entries: JournalEntry[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const { data: envelope } = await apiClient.get<ApiSuccess<ApiJournalEntry[]> & { pagination: ApiPagination }>(
      '/journal',
      { params: { page, limit: LIVE_PAGE_SIZE } },
    );
    entries.push(...envelope.data.map(fromApi));
    totalPages = envelope.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);

  if (!searchTerm?.trim()) return entries;
  const needle = searchTerm.trim().toLowerCase();
  return entries.filter(
    (e) => e.content.toLowerCase().includes(needle) || (e.title ?? '').toLowerCase().includes(needle),
  );
}

async function liveGet(id: string): Promise<JournalEntry> {
  return fromApi(unwrap(await apiClient.get<ApiSuccess<ApiJournalEntry>>(`/journal/${id}`)));
}

async function liveCreate(input: JournalEntryInput): Promise<JournalEntry> {
  const body = { body: input.content, ...(input.title ? { title: input.title } : {}) };
  return fromApi(unwrap(await apiClient.post<ApiSuccess<ApiJournalEntry>>('/journal', body)));
}

async function liveUpdate(id: string, input: JournalEntryInput): Promise<JournalEntry> {
  const body = { body: input.content, title: input.title ?? '' };
  return fromApi(unwrap(await apiClient.patch<ApiSuccess<ApiJournalEntry>>(`/journal/${id}`, body)));
}

async function liveRemove(id: string): Promise<void> {
  await apiClient.delete(`/journal/${id}`);
}

export const journalService = !config.useMockServices
  ? { list: liveList, get: liveGet, create: liveCreate, update: liveUpdate, remove: liveRemove }
  : { list: mockList, get: mockGet, create: mockCreate, update: mockUpdate, remove: mockRemove };
