/**
 * [ASSUMPTION] Neither spec defines hydration content/goals — this is
 * reasonable draft content (3 common drink sizes, a 2000ml default daily
 * goal), not a confirmed clinical/nutritional recommendation. Revise with
 * content review before ship — same posture as `wellnessContent.ts`/
 * `moodContent.ts`.
 */

import { z } from 'zod';

export type DrinkSizeKey = 'small' | 'glass' | 'bottle';

export interface DrinkSizeOption {
  key: DrinkSizeKey;
  ml: number;
  labelAr: string;
  labelEn: string;
}

export const drinkSizeOptions: DrinkSizeOption[] = [
  { key: 'small', ml: 150, labelAr: 'رشفة', labelEn: 'Small sip' },
  { key: 'glass', ml: 250, labelAr: 'كاسة', labelEn: 'Glass' },
  { key: 'bottle', ml: 500, labelAr: 'قنينة', labelEn: 'Bottle' },
];

export const defaultHydrationGoalMl = 2000;

/** [ASSUMPTION-stub] Not in either spec doc — stubbed per this feature's own request; user-provided, never measured/inferred. */
export interface HydrationLog {
  id: string;
  sizeMl: number;
  createdAt: string;
}

/** Runtime shape of a `HydrationLog` — see SleepRecordSchema for the rationale. */
export const HydrationLogSchema = z.object({
  id: z.string(),
  sizeMl: z.number().positive(),
  createdAt: z.string(),
});
