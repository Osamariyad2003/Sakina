export type MoodTrend = 'up' | 'down' | 'flat' | 'notEnoughData';

export interface WellbeingReflection {
  summaryAr: string;
  summaryEn: string;
  moodTrend: MoodTrend;
  journalingDaysLast7: number;
  stressSessionsLast7: number;
}

export interface TrackerSignal {
  key: 'moodStreak' | 'checkIns' | 'wellnessMinutes' | 'journalingStreak' | 'stressLevel';
  value: number;
  /** Last 7 days, oldest → newest; the component reverses order under RTL. */
  sparkline: number[];
  /** Only set for `stressLevel` — the user's own self-report, never measured/inferred. */
  level?: StressLevel | null;
}

export const trackerMeta: Record<
  TrackerSignal['key'],
  { icon: 'flame-outline' | 'checkmark-circle-outline' | 'leaf-outline' | 'book-outline' | 'speedometer-outline' }
> = {
  moodStreak: { icon: 'flame-outline' },
  checkIns: { icon: 'checkmark-circle-outline' },
  wellnessMinutes: { icon: 'leaf-outline' },
  journalingStreak: { icon: 'book-outline' },
  stressLevel: { icon: 'speedometer-outline' },
};

/**
 * Self-reported, never measured or inferred — the reference's "Stress
 * Level (segmented meter)" tracker, reframed per this feature's rule 3
 * ("user-set, not measured"). The user picks one of these three plain
 * levels themselves; nothing in the app ever sets this automatically.
 */
export type StressLevel = 'low' | 'medium' | 'high';

export interface StressLevelOption {
  level: StressLevel;
  labelAr: string;
  labelEn: string;
}

export const stressLevelOptions: StressLevelOption[] = [
  { level: 'low', labelAr: 'منخفض', labelEn: 'Low' },
  { level: 'medium', labelAr: 'متوسط', labelEn: 'Medium' },
  { level: 'high', labelAr: 'مرتفع', labelEn: 'High' },
];

/**
 * [ASSUMPTION — confirm, see ASSUMPTIONS.md] Reframe of the SH Freud
 * reference's "Freud Score" (a single AI mental-health score, e.g.
 * "80 / Mild Anxiety") into a non-diagnostic, rule-based supportive
 * summary — never a score, never a diagnosis label, never "your mood is
 * bad" (product-definition.md §11). Selected by simple mood-trend
 * thresholds in `homeService.ts`; same canned-template posture as
 * `companionService`'s replies (no LLM provider chosen yet, Open
 * Question #4). Drafted copy, not clinically reviewed — same posture as
 * `onboardingContent.ts`/`moodContent.ts`.
 */
export const reflectionTemplates: Record<MoodTrend, { ar: string; en: string }> = {
  up: {
    ar: 'الأيام الأخيرة كانت أهدى شوي — استمر بالخطوات الصغيرة اللي عم تاخدها.',
    en: 'The past few days have felt a bit calmer — keep taking these small steps.',
  },
  flat: {
    ar: 'مزاجك ثابت هالفترة. خذلك لحظة تشوف شو ممكن يضيفلك هدوء أكتر.',
    en: 'Your mood has been steady lately. Take a moment to notice what might add a little more calm.',
  },
  down: {
    ar: 'يبدو إن الأيام الماضية كانت أصعب شوي. خذلك وقتك، وتذكر إنه الدعم موجود لما تحتاجه.',
    en: 'It looks like the past few days have been a bit harder. Take your time, and remember support is here when you need it.',
  },
  notEnoughData: {
    ar: 'لسه ما عندنا معلومات كافية. سجل مزاجك كم يوم لنقدر نعكسلك صورة أوضح.',
    en: "We don't have enough data yet. Log your mood for a few days so we can reflect a clearer picture.",
  },
};
