import { useCallback, useEffect, useRef } from 'react';
import { storage, storageKeys } from '../../../core/storage/mmkv';

export interface JournalDraft {
  title?: string;
  content: string;
  promptId?: string;
}

/**
 * Local draft autosave (spec §17: "Autosave drafts locally (MMKV) so
 * content survives backgrounding the app"). Debounced writes; the caller
 * decides when to clear the draft (on successful save or explicit discard).
 */
export function useJournalDraft(entryId: string | undefined) {
  const key = storageKeys.journalDraftPrefix + (entryId ?? 'new');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDraft = useCallback((): JournalDraft | null => {
    return storage.getJSON<JournalDraft>(key) ?? null;
  }, [key]);

  const saveDraft = useCallback(
    (draft: JournalDraft) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        storage.setJSON(key, draft);
      }, 500);
    },
    [key],
  );

  const clearDraft = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    storage.delete(key);
  }, [key]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { loadDraft, saveDraft, clearDraft };
}
