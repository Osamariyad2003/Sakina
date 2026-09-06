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

export interface BaselineQuestion {
  id: string;
  promptAr: string;
  promptEn: string;
  options: BaselineOption[];
}

const frequencyOptions: BaselineOption[] = [
  { id: 'rarely', labelAr: 'نادراً', labelEn: 'Rarely' },
  { id: 'sometimes', labelAr: 'أحياناً', labelEn: 'Sometimes' },
  { id: 'often', labelAr: 'غالباً', labelEn: 'Often' },
  { id: 'always', labelAr: 'دائماً', labelEn: 'Always' },
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
    id: 'stressFrequency',
    promptAr: 'قديش بتحس متوتر أو مضغوط بشكل عام؟',
    promptEn: 'How often do you feel stressed or under pressure?',
    options: frequencyOptions,
  },
  {
    id: 'lonelinessFrequency',
    promptAr: 'قديش بتحس إنك لحالك؟',
    promptEn: 'How often do you feel alone?',
    options: frequencyOptions,
  },
  {
    id: 'energyFrequency',
    promptAr: 'قديش طاقتك منخفضة أو حاسس بإرهاق؟',
    promptEn: 'How often is your energy low or do you feel burnt out?',
    options: frequencyOptions,
  },
];
