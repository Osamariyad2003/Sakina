import { z } from 'zod';
import type { TFunction } from 'i18next';

export function buildJournalEntrySchema(t: TFunction) {
  return z.object({
    title: z.string().max(100, t('journal.validation.titleTooLong')).optional(),
    content: z.string().min(1, t('journal.validation.contentRequired')).max(5000, t('journal.validation.contentTooLong')),
    promptId: z.string().optional(),
  });
}
export type JournalEntryFormValues = z.infer<ReturnType<typeof buildJournalEntrySchema>>;
