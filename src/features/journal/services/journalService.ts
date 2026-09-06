import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { config } from '../../../config';
import i18n from '../../../i18n';
import type { JournalEntry } from '../../../types/models';

/**
 * [ASSUMPTION] No backend exists yet (product-definition.md Open Question
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

function fakeDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface JournalEntryInput {
  title?: string;
  content: string;
  promptId?: string;
}

async function list(searchTerm?: string): Promise<JournalEntry[]> {
  await fakeDelay();
  const entries = [...readEntries()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  if (!searchTerm?.trim()) return entries;
  const needle = searchTerm.trim().toLowerCase();
  return entries.filter(
    (e) => e.content.toLowerCase().includes(needle) || (e.title ?? '').toLowerCase().includes(needle),
  );
}

async function get(id: string): Promise<JournalEntry> {
  await fakeDelay(150);
  const entry = readEntries().find((e) => e.id === id);
  if (!entry) {
    throw new AppError(i18n.t('errors.unknown'), 'unknown', 404);
  }
  return entry;
}

async function create(input: JournalEntryInput): Promise<JournalEntry> {
  await fakeDelay();
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

async function update(id: string, input: JournalEntryInput): Promise<JournalEntry> {
  await fakeDelay();
  const entries = readEntries();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new AppError(i18n.t('errors.unknown'), 'unknown', 404);
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

async function remove(id: string): Promise<void> {
  await fakeDelay(200);
  writeEntries(readEntries().filter((e) => e.id !== id));
}

if (!config.useMockServices) {
  throw new AppError('journalService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const journalService = { list, get, create, update, remove };
