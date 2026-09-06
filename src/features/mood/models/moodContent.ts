import type { MoodLevel } from '../../../types/models';

/**
 * [ASSUMPTION] Neither spec enumerates a mood-level scale, emotion catalog,
 * or trigger catalog beyond a couple of examples — this is reasonable draft
 * content, not a confirmed clinical taxonomy. Revise with content/clinical
 * review before ship (see ASSUMPTIONS.md).
 */

export interface MoodLevelOption {
  level: MoodLevel;
  emoji: string;
  labelAr: string;
  labelEn: string;
}

/**
 * Mood scale labels follow the SH Freud "Sleep/Mood" flow's emotional naming
 * (Depressed → Overjoyed) rather than a flat "very low → very good" scale, so
 * the selector reads the way the design intends. The five `MoodLevel` values
 * are unchanged, so every existing consumer (Home, GreetingHeader,
 * StressCompletion, charts) keeps working.
 */
export const moodLevels: MoodLevelOption[] = [
  { level: 'veryLow', emoji: '😞', labelAr: 'مكتئب', labelEn: 'Depressed' },
  { level: 'low', emoji: '🙁', labelAr: 'حزين', labelEn: 'Sad' },
  { level: 'neutral', emoji: '😐', labelAr: 'محايد', labelEn: 'Neutral' },
  { level: 'good', emoji: '🙂', labelAr: 'سعيد', labelEn: 'Happy' },
  { level: 'veryGood', emoji: '😄', labelAr: 'مبسوط جداً', labelEn: 'Overjoyed' },
];

/** Numeric weight for charting only — never shown to the user as a "score". */
export const moodLevelWeight: Record<MoodLevel, number> = {
  veryLow: 1,
  low: 2,
  neutral: 3,
  good: 4,
  veryGood: 5,
};

export interface EmotionOption {
  id: string;
  labelAr: string;
  labelEn: string;
  emoji: string;
}

export const emotionCatalog: EmotionOption[] = [
  { id: 'sad', labelAr: 'حزين', labelEn: 'Sad', emoji: '😢' },
  { id: 'anxious', labelAr: 'قلقان', labelEn: 'Anxious', emoji: '😟' },
  { id: 'stressed', labelAr: 'متوتر', labelEn: 'Stressed', emoji: '😣' },
  { id: 'tired', labelAr: 'متعب', labelEn: 'Tired', emoji: '😪' },
  { id: 'lonely', labelAr: 'وحيد', labelEn: 'Lonely', emoji: '🫤' },
  { id: 'angry', labelAr: 'غاضب', labelEn: 'Angry', emoji: '😠' },
  { id: 'scared', labelAr: 'خايف', labelEn: 'Scared', emoji: '😨' },
  { id: 'relaxed', labelAr: 'مرتاح', labelEn: 'Relaxed', emoji: '😌' },
  { id: 'happy', labelAr: 'سعيد', labelEn: 'Happy', emoji: '😊' },
  { id: 'excited', labelAr: 'متحمس', labelEn: 'Excited', emoji: '🤩' },
];

export interface TriggerOption {
  id: string;
  labelAr: string;
  labelEn: string;
}

export const triggerCatalog: TriggerOption[] = [
  { id: 'study', labelAr: 'الدراسة', labelEn: 'Studies' },
  { id: 'work', labelAr: 'الشغل', labelEn: 'Work' },
  { id: 'family', labelAr: 'العائلة', labelEn: 'Family' },
  { id: 'relationships', labelAr: 'العلاقات', labelEn: 'Relationships' },
  { id: 'health', labelAr: 'الصحة', labelEn: 'Health' },
  { id: 'finances', labelAr: 'الوضع المادي', labelEn: 'Finances' },
  { id: 'sleep', labelAr: 'النوم', labelEn: 'Sleep' },
  { id: 'socialMedia', labelAr: 'وسائل التواصل', labelEn: 'Social media' },
  { id: 'unclear', labelAr: 'مافي سبب واضح', labelEn: 'No clear reason' },
];

/** "Who are you with?" — the check-in companion step (Figma flow). */
export interface CompanionOption {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}

export const companionCatalog: CompanionOption[] = [
  { id: 'alone', labelAr: 'لحالي', labelEn: 'Alone', icon: 'person-outline' },
  { id: 'family', labelAr: 'العائلة', labelEn: 'Family', icon: 'people-outline' },
  { id: 'coworker', labelAr: 'زميل شغل', labelEn: 'Coworker', icon: 'briefcase-outline' },
  { id: 'friend', labelAr: 'صديق', labelEn: 'Friend', icon: 'heart-outline' },
];

/** The three additional-stats scales captured on the "Why do you feel…" step. */
export type MetricKey = 'active' | 'eat' | 'stress';
export const metricScales: { key: MetricKey; labelAr: string; labelEn: string }[] = [
  { key: 'active', labelAr: 'قدّيش كنت نشيط اليوم؟', labelEn: 'How active were you today?' },
  { key: 'eat', labelAr: 'قدّيش أكلت منيح اليوم؟', labelEn: 'How well did you eat today?' },
  { key: 'stress', labelAr: 'قدّيش أنت متوتر اليوم؟', labelEn: 'How stressed are you today?' },
];

/**
 * AI mood-suggestion content ("Better Mood Management" detail + resolve).
 * [ASSUMPTION] Draft content, not a confirmed clinical protocol — same posture
 * as sleepSuggestions/stressContent (see ASSUMPTIONS.md).
 */
export interface MoodSuggestion {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  tipAr: string;
  tipEn: string;
  scoreReward: number;
  minutesLabel: string;
  /** Recommended daily check-ins, e.g. 2 → "2x". */
  checkInsPerDay: number;
  tasksAr: string[];
  tasksEn: string[];
  benefitsAr: string[];
  benefitsEn: string[];
}

export const moodSuggestions: MoodSuggestion[] = [
  {
    id: 'better-mood-management',
    titleAr: 'إدارة أفضل للمزاج',
    titleEn: 'Better mood management',
    summaryAr:
      'حاسس بتوتر أكتر هالأسبوع. هدول كم اقتراح مخصّص إلك عشان توازن مزاجك بناءً على بياناتك الأخيرة.',
    summaryEn:
      "You've been feeling more stressed this week. Here are a few personalized suggestions to help balance your mood based on your recent data.",
    tipAr: 'إنت بتقدر تتحكم بس بالأشياء اللي بإيدك — اللحظة اللي بتنفعل فيها، بتفقد السيطرة على حالك.',
    tipEn: 'You can only control what you can control. The moment you get angry, you lose control of yourself.',
    scoreReward: 3,
    minutesLabel: '10-20',
    checkInsPerDay: 2,
    tasksAr: ['اعترف بمشاعرك', 'اعمل نشاط إيجابي', 'اطلب الدعم'],
    tasksEn: ['Acknowledge feeling', 'Do a positive activity', 'Seek support'],
    benefitsAr: ['تقليل التوتر', 'مزاج أكثر استقراراً', 'تنفّس أفضل', 'صحة أحسن', 'شعور أسعد'],
    benefitsEn: ['Stress reduction', 'More stable mood', 'Breathe better', 'Healthier', 'Happier'],
  },
  {
    id: 'reconnect',
    titleAr: 'أعد التواصل مع الناس',
    titleEn: 'Reconnect with people',
    summaryAr: 'قضاء وقت مع ناس بتحبهم بيرفع مزاجك حتى لو لدقايق بسيطة.',
    summaryEn: 'Spending time with people you care about lifts your mood, even for a few minutes.',
    tipAr: 'ما لازم تكون محادثة كبيرة — رسالة صغيرة بتكفّي لتبدأ.',
    tipEn: "It doesn't have to be a big conversation — a small message is enough to start.",
    scoreReward: 4,
    minutesLabel: '5-15',
    checkInsPerDay: 1,
    tasksAr: ['ابعث رسالة لصديق', 'رتّب لقاء قصير', 'شارك شعورك مع حدا بتثق فيه'],
    tasksEn: ['Message a friend', 'Plan a short meetup', 'Share how you feel with someone you trust'],
    benefitsAr: ['شعور أقل بالوحدة', 'دعم عاطفي', 'مزاج أفضل'],
    benefitsEn: ['Less loneliness', 'Emotional support', 'Better mood'],
  },
];
