import type { WellnessCategory } from '../../../types/models';

/**
 * [ASSUMPTION] Neither spec provides real exercise content — this is
 * reasonable draft content (breathing + 2 other categories, satisfying the
 * MVP scope note in product-definition.md §13), not a confirmed clinical
 * decision. Revise with content/clinical review before ship.
 */

export interface BreathingPattern {
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
}

export interface WellnessExerciseContent {
  id: string;
  category: WellnessCategory;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationSeconds: number;
  kind: 'breathing' | 'guided';
  breathingPattern?: BreathingPattern;
  steps?: { textAr: string; textEn: string }[];
}

export const wellnessExercises: WellnessExerciseContent[] = [
  {
    id: 'breathing-478',
    category: 'breathing',
    titleAr: 'تنفس 4-7-8',
    titleEn: '4-7-8 breathing',
    descriptionAr: 'تمرين تنفس بسيط بيساعدك تهدى جسمك وعقلك بدقايق قليلة.',
    descriptionEn: 'A simple breathing exercise to help calm your body and mind in a few minutes.',
    durationSeconds: 120,
    kind: 'breathing',
    breathingPattern: { inhaleSeconds: 4, holdSeconds: 7, exhaleSeconds: 8 },
  },
  {
    id: 'grounding-54321',
    category: 'grounding',
    titleAr: 'تمرين 5-4-3-2-1 للتأريض',
    titleEn: '5-4-3-2-1 grounding',
    descriptionAr: 'تمرين بيرجعك للحظة الحالية لما تحس إنك مشتت أو قلقان.',
    descriptionEn: 'An exercise that grounds you in the present moment when you feel scattered or anxious.',
    durationSeconds: 150,
    kind: 'guided',
    steps: [
      { textAr: 'سمّي 5 أشياء فيك تشوفها حواليك', textEn: 'Name 5 things you can see' },
      { textAr: 'سمّي 4 أشياء فيك تلمسها', textEn: 'Name 4 things you can touch' },
      { textAr: 'سمّي 3 أشياء فيك تسمعها', textEn: 'Name 3 things you can hear' },
      { textAr: 'سمّي شيئين فيك تشمهم', textEn: 'Name 2 things you can smell' },
      { textAr: 'سمّي شي واحد فيك تتذوقه', textEn: 'Name 1 thing you can taste' },
    ],
  },
  {
    id: 'progressive-relaxation',
    category: 'relaxation',
    titleAr: 'استرخاء العضلات التدريجي',
    titleEn: 'Progressive muscle relaxation',
    descriptionAr: 'شد وارخي مجموعات عضلاتك على التوالي لتقليل التوتر الجسدي.',
    descriptionEn: 'Tense and release your muscle groups in sequence to reduce physical tension.',
    durationSeconds: 180,
    kind: 'guided',
    steps: [
      { textAr: 'شد عضلات وجهك لمدة 5 ثواني، وبعدين ارخيها', textEn: 'Tense your face muscles for 5s, then release' },
      { textAr: 'شد كتافك لمدة 5 ثواني، وبعدين ارخيها', textEn: 'Tense your shoulders for 5s, then release' },
      { textAr: 'شد إيديك وقبضاتك لمدة 5 ثواني، وبعدين ارخيها', textEn: 'Tense your hands for 5s, then release' },
      { textAr: 'شد رجليك لمدة 5 ثواني، وبعدين ارخيها', textEn: 'Tense your legs for 5s, then release' },
      { textAr: 'خذ نفس عميق وحس بجسمك وهو مرتاح بالكامل', textEn: 'Take a deep breath and feel your whole body relax' },
    ],
  },
];

export const wellnessCategories: { key: WellnessCategory; labelAr: string; labelEn: string }[] = [
  { key: 'breathing', labelAr: 'تنفس', labelEn: 'Breathing' },
  { key: 'grounding', labelAr: 'تأريض', labelEn: 'Grounding' },
  { key: 'relaxation', labelAr: 'استرخاء', labelEn: 'Relaxation' },
  { key: 'meditation', labelAr: 'تأمل', labelEn: 'Meditation' },
  { key: 'stressRelief', labelAr: 'تفريغ ضغط', labelEn: 'Stress relief' },
  { key: 'sleep', labelAr: 'نوم', labelEn: 'Sleep' },
];
