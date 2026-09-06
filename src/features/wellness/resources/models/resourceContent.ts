/**
 * Wellness resources & workshops (SH Freud reference section "Wellness
 * Resources & Workshops", and the reference Home screen's "Mindful
 * Resources" carousel).
 *
 * [ASSUMPTION] Editorial content is drafted, not clinically reviewed — the
 * same posture as `onboardingContent.ts` / `moodContent.ts` / the stress
 * technique copy. Nothing here diagnoses, promises an outcome, or tells the
 * reader what is wrong with them; articles are practical and optional.
 * Workshops are illustrative sessions with fictional facilitators and carry
 * no payment or attendance guarantee (product-definition.md Open Question
 * #2/#7). See ASSUMPTIONS.md.
 */

export type ResourceTopic = 'anxiety' | 'sleep' | 'stress' | 'mood' | 'relationships' | 'focus';

export interface ResourceTopicMeta {
  id: ResourceTopic;
  labelAr: string;
  labelEn: string;
  accent: 'reflection' | 'mood' | 'mindful' | 'journaling' | 'stress' | 'sleep';
}

export const resourceTopics: ResourceTopicMeta[] = [
  { id: 'anxiety', labelAr: 'القلق', labelEn: 'Anxiety', accent: 'mood' },
  { id: 'sleep', labelAr: 'النوم', labelEn: 'Sleep', accent: 'sleep' },
  { id: 'stress', labelAr: 'الضغوط', labelEn: 'Stress', accent: 'stress' },
  { id: 'mood', labelAr: 'المزاج', labelEn: 'Mood', accent: 'reflection' },
  { id: 'relationships', labelAr: 'العلاقات', labelEn: 'Relationships', accent: 'mindful' },
  { id: 'focus', labelAr: 'التركيز', labelEn: 'Focus', accent: 'journaling' },
];

export function getTopic(id: ResourceTopic): ResourceTopicMeta | undefined {
  return resourceTopics.find((t) => t.id === id);
}

export interface ResourceSection {
  headingAr: string;
  headingEn: string;
  bodyAr: string;
  bodyEn: string;
}

export interface ResourceArticle {
  id: string;
  topic: ResourceTopic;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  /** Rough read time in minutes — shown so nothing feels like a commitment. */
  readMinutes: number;
  sections: ResourceSection[];
  /** Optional next step inside the app, so an article can end in something doable. */
  practice?: { kind: 'wellnessExercise'; exerciseId: string } | { kind: 'journalPrompt'; promptAr: string; promptEn: string };
}

export const resourceArticles: ResourceArticle[] = [
  {
    id: 'article-anxiety-body',
    topic: 'anxiety',
    titleAr: 'لما يسبق جسمك أفكارك',
    titleEn: 'When your body reacts before your thoughts do',
    summaryAr: 'ليش القلق يبان بالجسم أول، وكيف تتعامل معه بدون ما تصارعه.',
    summaryEn: 'Why anxiety often shows up in the body first, and how to meet it without fighting it.',
    readMinutes: 4,
    sections: [
      {
        headingAr: 'الإشارة قبل الفكرة',
        headingEn: 'The signal before the thought',
        bodyAr: 'كثير من الناس يلاحظون تسارع النبض أو ضيق النفس قبل ما يعرفون إنهم قلقانين. هذي استجابة طبيعية، مو علامة على إن شي غلط فيك.',
        bodyEn: 'Many people notice a faster heartbeat or tight breathing before they realise they feel anxious. That is an ordinary response, not a sign something is wrong with you.',
      },
      {
        headingAr: 'ابدأ من النَفَس',
        headingEn: 'Start with the breath',
        bodyAr: 'إطالة الزفير أكثر من الشهيق تساعد الجسم يهدأ تدريجياً. جرّب دقيقة وحدة فقط، ولا تلزم نفسك أكثر.',
        bodyEn: 'Making the out-breath longer than the in-breath helps the body settle. Try just one minute — you do not owe yourself more than that.',
      },
      {
        headingAr: 'متى تطلب دعم',
        headingEn: 'When to reach for support',
        bodyAr: 'إذا صار القلق يمنعك من نومك أو شغلك أو علاقاتك لفترة ممتدة، الكلام مع مختص خطوة عملية — مو خطوة أخيرة.',
        bodyEn: 'If anxiety keeps getting in the way of sleep, work or relationships over time, talking to a professional is a practical step — not a last resort.',
      },
    ],
    practice: { kind: 'wellnessExercise', exerciseId: 'breathing-478' },
  },
  {
    id: 'article-sleep-winddown',
    topic: 'sleep',
    titleAr: 'الساعة اللي قبل النوم',
    titleEn: 'The hour before sleep',
    summaryAr: 'روتين بسيط يهيّئ جسمك للنوم بدون قواعد صارمة.',
    summaryEn: 'A simple wind-down that prepares the body for sleep, without strict rules.',
    readMinutes: 3,
    sections: [
      {
        headingAr: 'الضوء والإيقاع',
        headingEn: 'Light and rhythm',
        bodyAr: 'خفض الإضاءة قبل النوم بساعة يعطي الجسم إشارة إن اليوم قارب ينتهي.',
        bodyEn: 'Dimming the lights an hour before bed gives the body a cue that the day is closing.',
      },
      {
        headingAr: 'أفرغ راسك على ورق',
        headingEn: 'Put your head on paper',
        bodyAr: 'اكتب اللي مأجلّه لبكرة. هذا يقلل دوران الأفكار وقت ما تحاول تنام.',
        bodyEn: 'Write down what you are carrying into tomorrow. It reduces the looping that starts when you lie down.',
      },
    ],
    practice: {
      kind: 'journalPrompt',
      promptAr: 'شو الشي الوحيد اللي أقدر أأجله لبكرة بضمير مرتاح؟',
      promptEn: 'What is one thing I can put down until tomorrow with a clear conscience?',
    },
  },
  {
    id: 'article-stress-capacity',
    topic: 'stress',
    titleAr: 'الضغط مو ضعف',
    titleEn: 'Stress is not weakness',
    summaryAr: 'كيف تعرف حدودك بدون ما تلوم نفسك عليها.',
    summaryEn: 'How to read your own limits without turning them into blame.',
    readMinutes: 5,
    sections: [
      {
        headingAr: 'الطاقة مورد محدود',
        headingEn: 'Energy is a finite resource',
        bodyAr: 'الأيام مو متساوية. اليوم اللي تقدر فيه على أقل، ما يعني إنك رجعت للوراء.',
        bodyEn: 'Days are not equal. A day when you can do less is not a step backwards.',
      },
      {
        headingAr: 'علامات مبكرة',
        headingEn: 'Early signals',
        bodyAr: 'تغيّر النوم، قصر البال، والانسحاب من الناس — كلها إشارات مبكرة تستحق انتباه، مو حكم على شخصك.',
        bodyEn: 'Changes in sleep, a shorter fuse, pulling away from people — these are early signals worth noticing, not verdicts about who you are.',
      },
    ],
  },
  {
    id: 'article-mood-tracking',
    topic: 'mood',
    titleAr: 'ليش نسجل المزاج أصلاً',
    titleEn: 'Why track mood at all',
    summaryAr: 'التسجيل مو تقييم لنفسك — هو طريقة تشوف فيها النمط.',
    summaryEn: 'Logging is not grading yourself — it is how a pattern becomes visible.',
    readMinutes: 3,
    sections: [
      {
        headingAr: 'النمط أهم من اليوم',
        headingEn: 'The pattern matters more than the day',
        bodyAr: 'يوم واحد ما يقول شي. أسبوعين يبدأون يوضحون الظروف اللي تتكرر حولك.',
        bodyEn: 'A single day says little. Two weeks start to show the circumstances that keep repeating around you.',
      },
      {
        headingAr: 'بدون أحكام',
        headingEn: 'Without a verdict',
        bodyAr: 'ما في مزاج "صح" ومزاج "غلط". التسجيل وصف، مو درجة.',
        bodyEn: 'There is no right or wrong mood. A log is a description, not a score.',
      },
    ],
  },
  {
    id: 'article-relationships-boundaries',
    topic: 'relationships',
    titleAr: 'حدود بدون قطيعة',
    titleEn: 'Boundaries without walls',
    summaryAr: 'كيف تقول "لا" وتبقى العلاقة سليمة.',
    summaryEn: 'How to say no and keep the relationship intact.',
    readMinutes: 4,
    sections: [
      {
        headingAr: 'الحد وصف مو عقاب',
        headingEn: 'A boundary describes, it does not punish',
        bodyAr: 'قل ما الذي تقدر عليه، بدل ما توصف الطرف الثاني.',
        bodyEn: 'Say what you can do, rather than characterising the other person.',
      },
    ],
  },
  {
    id: 'article-focus-attention',
    topic: 'focus',
    titleAr: 'الانتباه عضلة تتعب',
    titleEn: 'Attention is a muscle that tires',
    summaryAr: 'لماذا التشتت مو كسل، وكيف ترتب يومك حوله.',
    summaryEn: 'Why distraction is not laziness, and how to build a day around it.',
    readMinutes: 4,
    sections: [
      {
        headingAr: 'فترات قصيرة',
        headingEn: 'Short stretches',
        bodyAr: 'فترة تركيز قصيرة متبوعة براحة قصيرة أنفع من محاولة تركيز طويلة متقطعة.',
        bodyEn: 'A short focused stretch followed by a short break beats a long one you keep breaking.',
      },
    ],
  },
];

export function getArticle(id: string): ResourceArticle | undefined {
  return resourceArticles.find((a) => a.id === id);
}

export interface Workshop {
  id: string;
  topic: ResourceTopic;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  /** ISO datetime. Seed data is generated relative to today so it never goes stale. */
  startsAt: string;
  durationMinutes: number;
  facilitatorName: string;
  facilitatorTitleAr: string;
  facilitatorTitleEn: string;
  /** Illustrative only — the app takes no payment and holds no seat inventory. */
  capacity: number;
  online: boolean;
}

/** Seed workshops are dated relative to today so the list is never empty or expired. */
function daysFromNow(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const workshops: Workshop[] = [
  {
    id: 'workshop-breathing',
    topic: 'stress',
    titleAr: 'ورشة: التنفس تحت الضغط',
    titleEn: 'Workshop: Breathing under pressure',
    summaryAr: 'جلسة تطبيقية قصيرة على تمارين تنفس تنفع في وسط اليوم.',
    summaryEn: 'A short practical session on breathing techniques that work mid-day.',
    startsAt: daysFromNow(3, 19),
    durationMinutes: 60,
    facilitatorName: 'أ. ريم الدوسري',
    facilitatorTitleAr: 'مدربة استرخاء',
    facilitatorTitleEn: 'Relaxation coach',
    capacity: 40,
    online: true,
  },
  {
    id: 'workshop-sleep',
    topic: 'sleep',
    titleAr: 'ورشة: إصلاح روتين النوم',
    titleEn: 'Workshop: Repairing your sleep routine',
    summaryAr: 'خطة أسبوعين لضبط وقت النوم والاستيقاظ تدريجياً.',
    summaryEn: 'A two-week plan for gradually resetting bed and wake times.',
    startsAt: daysFromNow(6, 20),
    durationMinutes: 75,
    facilitatorName: 'د. نورة الزهراني',
    facilitatorTitleAr: 'أخصائية اضطرابات النوم',
    facilitatorTitleEn: 'Sleep specialist',
    capacity: 30,
    online: true,
  },
  {
    id: 'workshop-anxiety',
    topic: 'anxiety',
    titleAr: 'ورشة: التعامل مع القلق اليومي',
    titleEn: 'Workshop: Working with everyday anxiety',
    summaryAr: 'أدوات عملية للتعامل مع القلق المتكرر، بدون وعود بالشفاء.',
    summaryEn: 'Practical tools for recurring anxiety, with no promises of a cure.',
    startsAt: daysFromNow(10, 18),
    durationMinutes: 90,
    facilitatorName: 'د. سلمى الحارثي',
    facilitatorTitleAr: 'أخصائية نفسية إكلينيكية',
    facilitatorTitleEn: 'Clinical psychologist',
    capacity: 25,
    online: false,
  },
  {
    id: 'workshop-focus',
    topic: 'focus',
    titleAr: 'ورشة: يوم عمل أهدأ',
    titleEn: 'Workshop: A calmer working day',
    summaryAr: 'ترتيب المهام حول طاقتك بدل ما تصارعها.',
    summaryEn: 'Arranging tasks around your energy instead of fighting it.',
    startsAt: daysFromNow(14, 17),
    durationMinutes: 60,
    facilitatorName: 'أ. ليان القحطاني',
    facilitatorTitleAr: 'مرشدة نفسية',
    facilitatorTitleEn: 'Counsellor',
    capacity: 50,
    online: true,
  },
];

export function getWorkshop(id: string): Workshop | undefined {
  return workshops.find((w) => w.id === id);
}

/** Upcoming workshops only, soonest first. */
export function upcomingWorkshops(now = Date.now()): Workshop[] {
  return workshops
    .filter((w) => new Date(w.startsAt).getTime() > now)
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
}
