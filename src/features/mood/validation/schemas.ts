import { z } from 'zod';
import type { TFunction } from 'i18next';
import { MoodLevelSchema } from '../../../types/models';

export function buildCheckInSchema(t: TFunction) {
  return z.object({
    mood: MoodLevelSchema.optional().refine((v) => Boolean(v), { message: t('mood.validation.moodRequired') }),
    emotionIds: z.array(z.string()).default([]),
    triggerIds: z.array(z.string()).default([]),
    note: z.string().max(500, t('mood.validation.noteTooLong')).optional(),
  });
}
export type CheckInFormValues = z.infer<ReturnType<typeof buildCheckInSchema>>;
