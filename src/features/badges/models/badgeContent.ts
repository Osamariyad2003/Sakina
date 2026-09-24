import type { Ionicons } from '@expo/vector-icons';

/**
 * Badges & achievements (SH Freud reference section "Badges & Achievements").
 *
 * Gamifying a mental-health app is easy to get wrong, so three rules shape
 * this catalogue:
 *
 * 1. **Nothing rewards a mood.** No badge exists for "feeling good", a streak
 *    of positive moods, or a low stress level — that would push people to log
 *    dishonestly, which destroys the value of their own history.
 * 2. **Only actions the user chose.** Every badge counts something the user
 *    deliberately did: logged, wrote, practised, read, reached out.
 * 3. **Streaks never shame.** Progress is shown, a broken streak is never
 *    called a failure, and no badge is ever taken away once earned.
 *
 * [ASSUMPTION] The thresholds are drafted product judgement, not research —
 * deliberately low so early wins are reachable. See ASSUMPTIONS.md.
 */

export type BadgeCategory = 'consistency' | 'reflection' | 'wellbeing' | 'learning' | 'connection';

/**
 * The measurable signals badges are evaluated against. Every one is derived
 * from data the user created; nothing here is inferred or measured about them.
 */
export interface BadgeSignals {
  moodCheckInCount: number;
  moodCheckInStreak: number;
  journalEntryCount: number;
  journalStreak: number;
  wellnessSessionCount: number;
  wellnessMinutes: number;
  /**
   * Feature 7 (Mindful Minutes) — the meditation/breathing/relaxation subset
   * of `wellnessMinutes`/sessions, tracked (and streaked) separately since
   * it's what the reference's "Mindful Minutes" counter actually means, as
   * opposed to every Wellness category (grounding, stress relief, sleep
   * content also roll into the broader `wellnessMinutes`).
   */
  mindfulMinutes: number;
  mindfulStreak: number;
  sleepRecordCount: number;
  hydrationLogCount: number;
  articlesRead: number;
  workshopsRegistered: number;
  communityPostCount: number;
  communitySupportGiven: number;
  /** Days since the account's first logged activity — used only for "still here" badges. */
  daysActive: number;
}

export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: 'reflection' | 'mood' | 'mindful' | 'journaling' | 'stress' | 'sleep' | 'hydration';
  /** The signal this badge counts, and how many of it are needed. */
  signal: keyof BadgeSignals;
  threshold: number;
}

export const badgeCatalog: BadgeDefinition[] = [
  // --- Consistency: showing up, at any mood. ---
  {
    id: 'first-check-in',
    category: 'consistency',
    titleAr: 'أول خطوة',
    titleEn: 'First step',
    descriptionAr: 'سجّلت مزاجك لأول مرة.',
    descriptionEn: 'You logged your mood for the first time.',
    icon: 'footsteps-outline',
    accent: 'mood',
    signal: 'moodCheckInCount',
    threshold: 1,
  },
  {
    id: 'week-of-check-ins',
    category: 'consistency',
    titleAr: 'أسبوع متواصل',
    titleEn: 'A steady week',
    descriptionAr: 'سجّلت مزاجك سبعة أيام متتالية — أياً كان هذا المزاج.',
    descriptionEn: 'Seven days of logging in a row — whatever those moods were.',
    icon: 'flame-outline',
    accent: 'mood',
    signal: 'moodCheckInStreak',
    threshold: 7,
  },
  {
    id: 'thirty-check-ins',
    category: 'consistency',
    titleAr: 'ثلاثون تسجيلاً',
    titleEn: 'Thirty logs',
    descriptionAr: 'وصلت إلى ٣٠ تسجيلاً للمزاج. صار عندك نمط تقدر تقرأه.',
    descriptionEn: 'You reached 30 mood logs. There is a pattern here you can read now.',
    icon: 'calendar-outline',
    accent: 'reflection',
    signal: 'moodCheckInCount',
    threshold: 30,
  },
  {
    id: 'still-here',
    category: 'consistency',
    titleAr: 'ما زلت هنا',
    titleEn: 'Still here',
    descriptionAr: 'مرّ شهر من أول يوم استخدمت فيه التطبيق.',
    descriptionEn: 'A month has passed since your first day in the app.',
    icon: 'heart-outline',
    accent: 'reflection',
    signal: 'daysActive',
    threshold: 30,
  },

  // --- Reflection: writing. ---
  {
    id: 'first-entry',
    category: 'reflection',
    titleAr: 'أول سطر',
    titleEn: 'First line',
    descriptionAr: 'كتبت أول تدوينة في اليوميات.',
    descriptionEn: 'You wrote your first journal entry.',
    icon: 'create-outline',
    accent: 'journaling',
    signal: 'journalEntryCount',
    threshold: 1,
  },
  {
    id: 'ten-entries',
    category: 'reflection',
    titleAr: 'عشر تدوينات',
    titleEn: 'Ten entries',
    descriptionAr: 'كتبت عشر تدوينات. الكتابة صارت عادة.',
    descriptionEn: 'Ten entries in. Writing has become a habit.',
    icon: 'book-outline',
    accent: 'journaling',
    signal: 'journalEntryCount',
    threshold: 10,
  },
  {
    id: 'journal-streak',
    category: 'reflection',
    titleAr: 'ثلاثة أيام كتابة',
    titleEn: 'Three days of writing',
    descriptionAr: 'كتبت ثلاثة أيام متتالية.',
    descriptionEn: 'You wrote three days in a row.',
    icon: 'pencil-outline',
    accent: 'journaling',
    signal: 'journalStreak',
    threshold: 3,
  },

  // --- Wellbeing: practice. ---
  {
    id: 'first-exercise',
    category: 'wellbeing',
    titleAr: 'أول تمرين',
    titleEn: 'First practice',
    descriptionAr: 'أنهيت أول تمرين استرخاء.',
    descriptionEn: 'You finished your first relaxation practice.',
    icon: 'leaf-outline',
    accent: 'mindful',
    signal: 'wellnessSessionCount',
    threshold: 1,
  },
  {
    id: 'sixty-mindful-minutes',
    category: 'wellbeing',
    titleAr: 'ساعة هدوء',
    titleEn: 'An hour of calm',
    descriptionAr: 'جمعت ٦٠ دقيقة من تمارين الهدوء.',
    descriptionEn: 'You have gathered 60 minutes of calming practice.',
    icon: 'time-outline',
    accent: 'mindful',
    signal: 'wellnessMinutes',
    threshold: 60,
  },
  {
    id: 'ten-mindful-minutes',
    category: 'wellbeing',
    titleAr: 'أول عشر دقايق',
    titleEn: 'First ten mindful minutes',
    descriptionAr: 'جمعت ١٠ دقايق من تأمل أو تنفس أو استرخاء.',
    descriptionEn: 'You have gathered 10 minutes of meditation, breathing or relaxation practice.',
    icon: 'sparkles-outline',
    accent: 'mindful',
    signal: 'mindfulMinutes',
    threshold: 10,
  },
  {
    id: 'mindful-streak',
    category: 'wellbeing',
    titleAr: 'ثلاثة أيام تأمل',
    titleEn: 'Three days of mindfulness',
    descriptionAr: 'مارست التأمل أو التنفس ثلاثة أيام متتالية.',
    descriptionEn: 'You practiced meditation or breathing three days in a row.',
    icon: 'flame-outline',
    accent: 'mindful',
    signal: 'mindfulStreak',
    threshold: 3,
  },
  {
    id: 'sleep-tracked',
    category: 'wellbeing',
    titleAr: 'ليالٍ مسجّلة',
    titleEn: 'Nights tracked',
    descriptionAr: 'سجّلت خمس ليالٍ من النوم.',
    descriptionEn: 'You have recorded five nights of sleep.',
    icon: 'moon-outline',
    accent: 'sleep',
    signal: 'sleepRecordCount',
    threshold: 5,
  },
  {
    id: 'hydration-logged',
    category: 'wellbeing',
    titleAr: 'انتباه للماء',
    titleEn: 'Water noticed',
    descriptionAr: 'سجّلت شرب الماء عشر مرات.',
    descriptionEn: 'You logged your water ten times.',
    icon: 'water-outline',
    accent: 'hydration',
    signal: 'hydrationLogCount',
    threshold: 10,
  },

  // --- Learning: reading. ---
  {
    id: 'first-article',
    category: 'learning',
    titleAr: 'قراءة أولى',
    titleEn: 'First read',
    descriptionAr: 'حفظت أول مقال لتقرأه.',
    descriptionEn: 'You saved your first article to read.',
    icon: 'bookmark-outline',
    accent: 'reflection',
    signal: 'articlesRead',
    threshold: 1,
  },
  {
    id: 'workshop-signup',
    category: 'learning',
    titleAr: 'خطوة نحو ورشة',
    titleEn: 'Toward a workshop',
    descriptionAr: 'سجّلت في ورشة.',
    descriptionEn: 'You registered for a workshop.',
    icon: 'school-outline',
    accent: 'mindful',
    signal: 'workshopsRegistered',
    threshold: 1,
  },

  // --- Connection: reaching out. ---
  {
    id: 'first-post',
    category: 'connection',
    titleAr: 'أول مشاركة',
    titleEn: 'First share',
    descriptionAr: 'شاركت تجربتك في المجتمع.',
    descriptionEn: 'You shared something with the community.',
    icon: 'chatbubbles-outline',
    accent: 'mood',
    signal: 'communityPostCount',
    threshold: 1,
  },
  {
    id: 'supportive',
    category: 'connection',
    titleAr: 'حاضر لغيرك',
    titleEn: 'There for others',
    descriptionAr: 'دعمت خمس مشاركات لأشخاص آخرين.',
    descriptionEn: 'You supported five posts from other people.',
    icon: 'people-outline',
    accent: 'stress',
    signal: 'communitySupportGiven',
    threshold: 5,
  },
];

export function getBadge(id: string): BadgeDefinition | undefined {
  return badgeCatalog.find((b) => b.id === id);
}

export interface BadgeProgress {
  definition: BadgeDefinition;
  /** Current value of the badge's signal. */
  current: number;
  earned: boolean;
  /** 0-1, clamped. Shown as a bar on locked badges so progress is visible. */
  ratio: number;
}

export function evaluateBadges(signals: BadgeSignals): BadgeProgress[] {
  return badgeCatalog.map((definition) => {
    const current = signals[definition.signal];
    return {
      definition,
      current,
      earned: current >= definition.threshold,
      ratio: Math.max(0, Math.min(1, current / definition.threshold)),
    };
  });
}

export const badgeCategories: { id: BadgeCategory; labelAr: string; labelEn: string }[] = [
  { id: 'consistency', labelAr: 'الاستمرارية', labelEn: 'Consistency' },
  { id: 'reflection', labelAr: 'التأمل', labelEn: 'Reflection' },
  { id: 'wellbeing', labelAr: 'العناية', labelEn: 'Wellbeing' },
  { id: 'learning', labelAr: 'التعلّم', labelEn: 'Learning' },
  { id: 'connection', labelAr: 'التواصل', labelEn: 'Connection' },
];
