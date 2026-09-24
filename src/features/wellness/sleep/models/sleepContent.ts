/**
 * Sleep Quality feature — content, types, and pure helpers.
 *
 * Structure/flow mirrors the "Sleep Quality" flow in the SH Freud UI Kit
 * v1.7 (score dashboard → stage chart → new schedule (manual / AI
 * autosuggest) → set goal/schedule/alarm → confirm → created → my schedule
 * → sleep session → summary → history → detail → AI-suggestion detail).
 * The Figma file is a community file with no editor access (Figma MCP needs
 * editor, not view — see ASSUMPTIONS.md "Figma-as-structure-only UI pass"),
 * so this is the flow reproduced with 100% Sakina tokens/primitives and
 * bilingual (ar/en) content — NO visual values are taken from Figma.
 *
 * [ASSUMPTION] No backend and no clinical sleep-content set exists yet
 * (product-definition.md Open Question #4). All copy below is reasonable
 * draft content, same posture as wellnessContent.ts/stressContent.ts —
 * revise with content/clinical review before ship.
 */

import { z } from 'zod';

/** Sleep-stage breakdown, in the four stages the summary/detail screens chart. */
export type SleepStage = 'deep' | 'core' | 'rem' | 'awake';
export const sleepStages: SleepStage[] = ['deep', 'core', 'rem', 'awake'];

/** Per-record quality classification (the chart legend + history badges). */
export type SleepQualityRating = 'normal' | 'core' | 'rem' | 'irregular' | 'insomniac';
export const sleepQualityRatings: SleepQualityRating[] = ['normal', 'core', 'rem', 'irregular', 'insomniac'];

/** Minutes spent in each stage for one night. */
export interface SleepStageBreakdown {
  deep: number;
  core: number;
  rem: number;
  awake: number;
}

/** One recorded night of sleep. */
export interface SleepRecord {
  id: string;
  /** ISO date (yyyy-mm-dd) the sleep is attributed to (the wake-up day). */
  date: string;
  durationMinutes: number;
  rating: SleepQualityRating;
  stages: SleepStageBreakdown;
  /** 24h "HH:MM". */
  bedtime: string;
  /** 24h "HH:MM". */
  wakeTime: string;
  /** Signed impact on the user's overall sleep score, e.g. +3 / -2. */
  scoreImpact: number;
  /** Suggestion ids surfaced for this night (drives the "N AI suggestions" chip). */
  suggestionIds: string[];
}

/**
 * Runtime shape of a `SleepRecord`, for validating what the backend sent
 * (`parseContract`). Lives beside the interface so the two cannot drift:
 * change one, change the other.
 */
export const SleepRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  durationMinutes: z.number().nonnegative(),
  rating: z.enum(['normal', 'core', 'rem', 'irregular', 'insomniac']),
  stages: z.object({
    deep: z.number().nonnegative(),
    core: z.number().nonnegative(),
    rem: z.number().nonnegative(),
    awake: z.number().nonnegative(),
  }),
  bedtime: z.string(),
  wakeTime: z.string(),
  scoreImpact: z.number(),
  suggestionIds: z.array(z.string()),
});

/** A user-defined recurring sleep schedule (bed/wake + alarm prefs). */
export interface SleepSchedule {
  id: string;
  /** 24h "HH:MM". */
  bedtime: string;
  /** 24h "HH:MM". */
  wakeTime: string;
  /** Active weekdays, 0 = Sunday … 6 = Saturday. */
  activeDays: number[];
  enabled: boolean;
  autoAlarm: boolean;
  soundEnabled: boolean;
  snoozeEnabled: boolean;
  createdAt: string;
}

/**
 * The draft carried across the multi-step "New Sleep Schedule" flow via nav
 * params (fully serializable — no class instances) before it's persisted.
 */
export interface SleepScheduleDraft {
  bedtime: string;
  wakeTime: string;
  activeDays: number[];
  goalMinutes: number;
  autoAlarm: boolean;
  soundEnabled: boolean;
  snoozeEnabled: boolean;
}

/** Static AI-suggestion content (the "Optimize Environment" style detail). */
export interface SleepSuggestion {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  /** Freud-score reward shown on the detail + "resolved" screens. */
  scoreReward: number;
  minutesLabel: string;
  benefitsAr: string[];
  benefitsEn: string[];
  stepsAr: string[];
  stepsEn: string[];
  /** Recommended bedtime shown on the detail, 24h "HH:MM". */
  recommendedBedtime: string;
}

export const sleepSuggestions: SleepSuggestion[] = [
  {
    id: 'optimize-environment',
    titleAr: 'حسّن بيئة نومك',
    titleEn: 'Optimize your environment',
    summaryAr:
      'جهّز غرفتك للنوم: عتّم الإضاءة، وقلّل الأصوات المزعجة، وخلي حرارة الغرفة مريحة عشان جسمك يهدى بسهولة.',
    summaryEn:
      'Prepare your room for rest: dim the light, reduce disruptive noise, and keep the temperature comfortable so your body can settle easily.',
    scoreReward: 5,
    minutesLabel: '10-20',
    benefitsAr: ['تقليل التوتر', 'نوم أعمق', 'تنفّس أهدأ', 'استيقاظ أنشط'],
    benefitsEn: ['Less stress', 'Deeper sleep', 'Calmer breathing', 'Fresher mornings'],
    stepsAr: [
      'ركّب ستائر معتّمة لحجب مصادر الضوء الخارجية',
      'استخدم سدادات أذن إذا كان جوّك حواليك مزعج',
      'اضبط حرارة الغرفة على درجة باردة ومريحة',
      'اختر فرشة ومخدات مريحة تناسب نومك',
    ],
    stepsEn: [
      'Install blackout curtains to block outside light',
      'Use earplugs if your surroundings are noisy',
      'Set the room to a cool, comfortable temperature',
      'Choose supportive, comfortable bedding',
    ],
    recommendedBedtime: '23:12',
  },
  {
    id: 'limit-screens',
    titleAr: 'قلّل التعرّض للشاشات',
    titleEn: 'Limit screen exposure',
    summaryAr: 'ابتعد عن الشاشات قبل النوم بساعة — الضوء الأزرق بيأخّر إفراز الميلاتونين اللي بيساعدك تنام.',
    summaryEn: 'Step away from screens an hour before bed — blue light delays the melatonin that helps you fall asleep.',
    scoreReward: 3,
    minutesLabel: '5-10',
    benefitsAr: ['نوم أسرع', 'عقل أهدأ', 'عيون مرتاحة'],
    benefitsEn: ['Fall asleep faster', 'A calmer mind', 'Rested eyes'],
    stepsAr: [
      'فعّل وضع الليل على جهازك قبل المساء',
      'حط جهازك بعيد عن السرير',
      'استبدل الشاشة بقراءة خفيفة أو تنفّس هادئ',
    ],
    stepsEn: [
      'Turn on night mode on your device in the evening',
      'Keep your device away from the bed',
      'Swap the screen for light reading or calm breathing',
    ],
    recommendedBedtime: '23:00',
  },
  {
    id: 'relaxing-routine',
    titleAr: 'اعمل روتين مُريح قبل النوم',
    titleEn: 'Build a relaxing routine',
    summaryAr: 'روتين ثابت وبسيط قبل النوم بيعطي جسمك إشارة إنه وقت الراحة قرّب.',
    summaryEn: 'A simple, consistent pre-sleep routine signals to your body that rest is near.',
    scoreReward: 4,
    minutesLabel: '10-15',
    benefitsAr: ['دخول أهدأ للنوم', 'توتر أقل', 'نوم أكثر انتظاماً'],
    benefitsEn: ['A gentler wind-down', 'Less tension', 'More regular sleep'],
    stepsAr: [
      'حدّد وقت ثابت للنوم كل ليلة',
      'جرّب تمرين تنفّس قصير قبل السرير',
      'خفّف الأنشطة المحفّزة آخر ساعة قبل النوم',
    ],
    stepsEn: [
      'Set a consistent bedtime every night',
      'Try a short breathing exercise before bed',
      'Ease off stimulating activity in the last hour',
    ],
    recommendedBedtime: '22:45',
  },
];

/** The AI-autosuggest questionnaire — kept tiny (two anchor questions). */
export interface AutosuggestQuestion {
  id: 'wakeUp' | 'inBed';
  labelAr: string;
  labelEn: string;
  /** Selectable 24h "HH:MM" options. */
  options: string[];
}

export const autosuggestQuestions: AutosuggestQuestion[] = [
  {
    id: 'wakeUp',
    labelAr: 'إمتى بتصحى عادةً بيوم الدوام؟',
    labelEn: 'When do you usually wake up on a weekday?',
    options: ['05:30', '06:00', '06:30', '07:00', '08:00', '09:00', '10:15'],
  },
  {
    id: 'inBed',
    labelAr: 'إمتى بتكون بالسرير عادةً؟',
    labelEn: 'When are you usually in bed?',
    options: ['21:30', '22:00', '22:30', '23:00', '23:45', '00:30', '01:00'],
  },
];

/** Default sleep goal used to seed the "Set Sleep Goal" step. */
export const defaultSleepGoalMinutes = 8 * 60 + 30;

/** Optimal / minimal sleep targets the AI recommendation reasons about (minutes). */
export const optimalSleepMinutes = 8 * 60;
export const minimalSleepMinutes = 6 * 60 + 12;

// ---------------------------------------------------------------------------
// Pure helpers (no i18n / no theme — screens format via t() and theme tokens).
// ---------------------------------------------------------------------------

/** Parse a 24h "HH:MM" string into total minutes since midnight. */
export function parseClock(clock: string): number {
  const [h, m] = clock.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
}

/** Format total minutes since midnight back into a zero-padded 24h "HH:MM". */
export function toClock(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Minutes between bedtime and wake time, wrapping past midnight. */
export function scheduleDurationMinutes(bedtime: string, wakeTime: string): number {
  const diff = parseClock(wakeTime) - parseClock(bedtime);
  return ((diff % 1440) + 1440) % 1440;
}

/** Split a duration in minutes into { hours, minutes } for display. */
export function splitDuration(totalMinutes: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.round(totalMinutes));
  return { hours: Math.floor(safe / 60), minutes: safe % 60 };
}

/**
 * Locale-agnostic 12-hour parts for a 24h clock. Screens join these with a
 * localized AM/PM label so the whole string flips language cleanly.
 */
export function to12hParts(clock: string): { hour: number; minute: number; isAm: boolean } {
  const total = parseClock(clock);
  const h24 = Math.floor(total / 60);
  const minute = total % 60;
  const isAm = h24 < 12;
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hour, minute, isAm };
}

/** Total sleep minutes in a stage breakdown. */
export function totalStageMinutes(stages: SleepStageBreakdown): number {
  return stages.deep + stages.core + stages.rem + stages.awake;
}
