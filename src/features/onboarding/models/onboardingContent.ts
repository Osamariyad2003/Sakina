/**
 * [ASSUMPTION] Neither spec defines a goals taxonomy or baseline
 * questionnaire — this is reasonable draft content for a Jordanian
 * Arabic-speaking audience, not a confirmed clinical/product decision.
 * Revise before ship; a real answer here likely wants input from whoever
 * owns clinical/content review (see product-definition.md's undefined
 * "Administrator/Operator" role).
 */

export interface IntroHighlight {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
}

/**
 * The 3 core modules surfaced on the Introduction screen — mirrors the app's
 * actual tab structure (Companion/Mood/Journal+Wellness) and the existing
 * `introBody` copy, not a Figma-sourced list (see ASSUMPTIONS.md).
 */
export const introHighlights: IntroHighlight[] = [
  {
    id: 'companion',
    titleAr: 'رفيق للدعم',
    titleEn: 'A support companion',
    bodyAr: 'احكي وقت ما بدك، بمساحة خاصة وبدون حكم.',
    bodyEn: 'Talk whenever you need to, in a private, judgment-free space.',
  },
  {
    id: 'mood',
    titleAr: 'تتبع مزاجك',
    titleEn: 'Track your mood',
    bodyAr: 'سجل كيف حاسس يومياً وشوف أنماطك مع الوقت.',
    bodyEn: 'Log how you feel each day and see your patterns over time.',
  },
  {
    id: 'journalWellness',
    titleAr: 'مذكرات وتمارين هدوء',
    titleEn: 'Journal & calming exercises',
    bodyAr: 'اكتب أفكارك، وخذ لحظة هدوء بتمارين تنفس واسترخاء.',
    bodyEn: 'Write down your thoughts, and take a calm moment with breathing and relaxation exercises.',
  },
];

export interface OnboardingGoal {
  id: string;
  labelAr: string;
  labelEn: string;
}

export const onboardingGoals: OnboardingGoal[] = [
  { id: 'stress', labelAr: 'إدارة التوتر', labelEn: 'Managing stress' },
  { id: 'anxiety', labelAr: 'التعامل مع القلق', labelEn: 'Coping with anxiety' },
  { id: 'loneliness', labelAr: 'تقليل الشعور بالوحدة', labelEn: 'Feeling less alone' },
  { id: 'burnout', labelAr: 'التعافي من الإرهاق', labelEn: 'Recovering from burnout' },
  { id: 'understanding', labelAr: 'فهم مشاعري أكثر', labelEn: 'Understanding my emotions better' },
  { id: 'habits', labelAr: 'بناء عادات صحية', labelEn: 'Building healthy habits' },
  { id: 'sleep', labelAr: 'تحسين نومي', labelEn: 'Sleeping better' },
];

export interface BaselineOption {
  id: string;
  labelAr: string;
  labelEn: string;
}

interface BaselineQuestionBase {
  id: string;
  promptAr: string;
  promptEn: string;
  /** Shown under multi-select prompts only ("pick as many as apply"). */
  hintAr?: string;
  hintEn?: string;
}

/**
 * Three question shapes (Feature 1's brief: single-select, multi-select,
 * scale/slider). `kind` discriminates which UI BaselineScreen renders —
 * `ScaleSelector` is the same accessible 1-N tappable-track component the
 * Mood check-in's "why do you feel…" step already uses, not a new slider
 * dependency.
 */
export type BaselineQuestion =
  | (BaselineQuestionBase & { kind: 'single'; options: BaselineOption[] })
  | (BaselineQuestionBase & { kind: 'multi'; options: BaselineOption[] })
  | (BaselineQuestionBase & { kind: 'scale'; min: number; max: number; minLabelAr: string; minLabelEn: string; maxLabelAr: string; maxLabelEn: string });

const frequencyOptions: BaselineOption[] = [
  { id: 'rarely', labelAr: 'نادراً', labelEn: 'Rarely' },
  { id: 'sometimes', labelAr: 'أحياناً', labelEn: 'Sometimes' },
  { id: 'often', labelAr: 'غالباً', labelEn: 'Often' },
  { id: 'always', labelAr: 'دائماً', labelEn: 'Always' },
];

const sleepQualityOptions: BaselineOption[] = [
  { id: 'poor', labelAr: 'مش منيح', labelEn: 'Poor' },
  { id: 'okay', labelAr: 'مقبول', labelEn: 'Okay' },
  { id: 'good', labelAr: 'منيح', labelEn: 'Good' },
  { id: 'great', labelAr: 'منيح جداً', labelEn: 'Great' },
];

const priorCareOptions: BaselineOption[] = [
  { id: 'never', labelAr: 'لأ، ما جربت', labelEn: "No, I haven't" },
  { id: 'before', labelAr: 'إي، بس مش هلأ', labelEn: 'Yes, in the past' },
  { id: 'currently', labelAr: 'إي، عم أتابع هلأ', labelEn: "Yes, I'm currently in care" },
];

/**
 * Multi-select — feeds AI Companion tone personalization later (spec's
 * "topics to avoid or prioritize" ask). Framed as focus areas, never a
 * diagnosis list.
 */
const focusTopicOptions: BaselineOption[] = [
  { id: 'relationships', labelAr: 'العلاقات', labelEn: 'Relationships' },
  { id: 'family', labelAr: 'العائلة', labelEn: 'Family' },
  { id: 'work', labelAr: 'الشغل أو الدراسة', labelEn: 'Work or studies' },
  { id: 'grief', labelAr: 'فقدان أو حزن', labelEn: 'Loss or grief' },
  { id: 'selfEsteem', labelAr: 'الثقة بالنفس', labelEn: 'Self-esteem' },
  { id: 'sleep', labelAr: 'النوم', labelEn: 'Sleep' },
  { id: 'none', labelAr: 'مفيش شي محدد', labelEn: 'Nothing specific' },
];

/**
 * Deliberately non-diagnostic, non-clinical phrasing — this seeds early
 * Insights personalization only, never framed as an assessment or score
 * (spec's "never present as doctor/therapist" principle applies to content
 * tone here too, even outside the AI Companion).
 */
export const baselineQuestions: BaselineQuestion[] = [
  {
    id: 'overallDays',
    kind: 'single',
    promptAr: 'بشكل عام، كيف كانت أيامك بالأسبوع الأخير؟',
    promptEn: 'Overall, how have your days been this past week?',
    options: [
      { id: 'hard', labelAr: 'صعبة', labelEn: 'Hard' },
      { id: 'mixed', labelAr: 'متوسطة', labelEn: 'Mixed' },
      { id: 'good', labelAr: 'منيحة', labelEn: 'Good' },
      { id: 'great', labelAr: 'منيحة جداً', labelEn: 'Great' },
    ],
  },
  {
    id: 'sleepPatterns',
    kind: 'single',
    promptAr: 'كيف كان نومك بالأسبوع الأخير؟',
    promptEn: 'How has your sleep been this past week?',
    options: sleepQualityOptions,
  },
  {
    id: 'stressLevelScale',
    kind: 'scale',
    promptAr: 'قديش بتحس متوتر هالأسبوع؟',
    promptEn: 'How would you rate your stress level this week?',
    min: 1,
    max: 5,
    minLabelAr: 'مش متوتر',
    minLabelEn: 'Not stressed',
    maxLabelAr: 'متوتر كتير',
    maxLabelEn: 'Very stressed',
  },
  {
    id: 'lonelinessFrequency',
    kind: 'single',
    promptAr: 'قديش بتحس إنك لحالك؟',
    promptEn: 'How often do you feel alone?',
    options: frequencyOptions,
  },
  {
    id: 'energyFrequency',
    kind: 'single',
    promptAr: 'قديش طاقتك منخفضة أو حاسس بإرهاق؟',
    promptEn: 'How often is your energy low or do you feel burnt out?',
    options: frequencyOptions,
  },
  {
    id: 'priorCare',
    kind: 'single',
    promptAr: 'جربت قبل تحكي مع مختص أو معالج نفسي؟',
    promptEn: 'Have you spoken with a mental-health professional before?',
    options: priorCareOptions,
  },
  {
    id: 'focusTopics',
    kind: 'multi',
    promptAr: 'في مواضيع معينة حابب نركز عليها بالبداية؟',
    promptEn: "Are there specific topics you'd like us to focus on at first?",
    hintAr: 'اختياري — فيك تختار أكتر من واحد.',
    hintEn: "Optional — you can pick more than one.",
    options: focusTopicOptions,
  },
];
