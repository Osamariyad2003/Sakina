import type { WellnessExerciseContent } from '../../models/wellnessContent';

/**
 * [ASSUMPTION] Neither spec doc has a standalone "Stress Management"
 * content set — "Stress Relief" is one of six generic Wellness categories
 * (mobile-engineering-spec.md §18). This is reasonable draft content for
 * that promoted flow, not a confirmed clinical decision — same posture as
 * `wellness/models/wellnessContent.ts`/`onboardingContent.ts`. Revise with
 * content/clinical review before ship.
 */

export const stressTechniques: WellnessExerciseContent[] = [
  {
    id: 'stress-quick-calm',
    category: 'stressRelief',
    titleAr: 'تهدئة سريعة',
    titleEn: 'Quick calm',
    descriptionAr: 'تمرين تنفس قصير جداً لما ما يكون معك وقت كتير ولازم تهدى بسرعة.',
    descriptionEn: 'A very short breathing exercise for when you don’t have much time and need to calm down fast.',
    durationSeconds: 60,
    kind: 'breathing',
    breathingPattern: { inhaleSeconds: 4, holdSeconds: 4, exhaleSeconds: 4 },
  },
  {
    id: 'stress-box-breathing',
    category: 'stressRelief',
    titleAr: 'تنفس الصندوق',
    titleEn: 'Box breathing',
    descriptionAr: 'نمط تنفس متوازن بيساعد جسمك يهدى من الضغط والتوتر تدريجياً.',
    descriptionEn: 'A balanced breathing pattern that gradually calms your body from pressure and tension.',
    durationSeconds: 150,
    kind: 'breathing',
    breathingPattern: { inhaleSeconds: 4, holdSeconds: 4, exhaleSeconds: 4 },
  },
  {
    id: 'stress-grounding',
    category: 'stressRelief',
    titleAr: 'تأريض وقت الضغط',
    titleEn: 'Grounding under pressure',
    descriptionAr: 'ترجع تركيزك للحظة الحالية لما تحس إنه الضغط عم يكبر عليك.',
    descriptionEn: 'Bring your focus back to the present moment when pressure starts building up.',
    durationSeconds: 120,
    kind: 'guided',
    steps: [
      { textAr: 'وقف اللي عم تعمله وخذ نفس عميق واحد', textEn: 'Pause what you’re doing and take one deep breath' },
      { textAr: 'لاحظ 3 أشياء حواليك بتشوفها بوضوح', textEn: 'Notice 3 things around you that you can clearly see' },
      { textAr: 'حس بقدمك على الأرض، وارخي كتافك', textEn: 'Feel your feet on the ground, and relax your shoulders' },
      { textAr: 'ذكر نفسك: هاد الشعور مؤقت وبيمر', textEn: 'Remind yourself: this feeling is temporary and will pass' },
    ],
  },
  {
    id: 'stress-muscle-release',
    category: 'stressRelief',
    titleAr: 'تفريغ التوتر الجسدي',
    titleEn: 'Release physical tension',
    descriptionAr: 'شد وارخي عضلاتك الرئيسية لتفريغ التوتر المتراكم بجسمك بسبب الضغط.',
    descriptionEn: 'Tense and release your main muscle groups to release tension your body has built up from pressure.',
    durationSeconds: 150,
    kind: 'guided',
    steps: [
      { textAr: 'شد قبضة إيدك 5 ثواني، وبعدين ارخيها بالكامل', textEn: 'Clench your fist for 5s, then fully release it' },
      { textAr: 'ارفع كتافك لفوق 5 ثواني، وبعدين خليهم يوقعوا وترتاح', textEn: 'Raise your shoulders for 5s, then let them drop and relax' },
      { textAr: 'شد عضلات فكّك ووجهك 5 ثواني، وبعدين ارخيهم', textEn: 'Tense your jaw and face for 5s, then release' },
      { textAr: 'خذ نفس طويل وحس بالفرق بين التوتر والراحة', textEn: 'Take a long breath and notice the difference between tension and ease' },
    ],
  },
  {
    id: 'stress-reframing',
    category: 'stressRelief',
    titleAr: 'إعادة صياغة الفكرة',
    titleEn: 'Reframe the thought',
    descriptionAr: 'خطوات بسيطة تساعدك تشوف الموقف اللي مضغطك من زاوية تانية أهدى.',
    descriptionEn: 'A few simple steps to help you see what’s pressuring you from a calmer angle.',
    durationSeconds: 150,
    kind: 'guided',
    steps: [
      { textAr: 'سمّي الفكرة اللي عم تضغط عليك هلأ بجملة وحدة', textEn: 'Name the thought that’s pressuring you right now, in one sentence' },
      { textAr: 'اسأل حالك: هاد أكيد صاير، ولا أنا خايف يصير؟', textEn: 'Ask yourself: is this actually happening, or am I afraid it will?' },
      { textAr: 'فكر: شو ممكن أحكيه لصاحبي لو كان بنفس الموقف؟', textEn: 'Think: what would I tell a friend in this same situation?' },
      { textAr: 'جرب تعيد صياغة الفكرة بشكل أهدى وأكتر واقعية', textEn: 'Try rewording the thought in a calmer, more realistic way' },
    ],
  },
];

/** The technique surfaced by the Overview screen's "quick relief" shortcut. */
export const quickReliefTechniqueId = 'stress-quick-calm';

/**
 * [ASSUMPTION] Not in either spec doc — stubbed per this feature's own
 * "Data & state" section. Structural session metadata only; no freeform
 * note field (business rule: no logging of private session content).
 */
export interface StressSession {
  id: string;
  techniqueId: string;
  category: 'stressRelief';
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number;
  /** Set if the user completed the optional post-session mood check-in. */
  moodEntryId?: string;
}
