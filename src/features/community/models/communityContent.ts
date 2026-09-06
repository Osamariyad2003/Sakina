/**
 * Community support (SH Freud reference section "Community Support").
 *
 * Peer support in a mental-health app is the highest-risk surface in the
 * product, so three rules are encoded in the model rather than left to the
 * screens:
 *
 * 1. **Pseudonymous by default.** Posts carry a user-chosen alias, never the
 *    account's display name or email. `communityProfile` is stored locally
 *    and nothing links it back to the auth profile.
 * 2. **Guidelines before posting.** `hasAcceptedGuidelines` gates composing,
 *    not reading — someone can always read what is there.
 * 3. **Risk language never becomes a post.** The composer routes to Safety
 *    instead, using the same `containsRiskLanguage` heuristic the AI
 *    Companion uses. Peers are not a crisis service.
 *
 * [ASSUMPTION] There is no moderation backend and no real community
 * (product-definition.md Open Question #3 covers escalation policy; nothing
 * covers moderation staffing). Seed threads below are ILLUSTRATIVE, written
 * for this app, and `report()` records locally only. A real launch needs
 * human moderation before this feature is switched on. See ASSUMPTIONS.md.
 */

export interface CommunityGroup {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: 'heart-outline' | 'moon-outline' | 'leaf-outline' | 'people-outline' | 'sunny-outline';
  accent: 'reflection' | 'mood' | 'mindful' | 'journaling' | 'stress' | 'sleep';
}

export const communityGroups: CommunityGroup[] = [
  {
    id: 'group-anxiety',
    nameAr: 'التعايش مع القلق',
    nameEn: 'Living with anxiety',
    descriptionAr: 'مساحة لمشاركة ما ينفع في الأيام القلقة.',
    descriptionEn: 'A space to share what helps on anxious days.',
    icon: 'heart-outline',
    accent: 'mood',
  },
  {
    id: 'group-sleep',
    nameAr: 'النوم والراحة',
    nameEn: 'Sleep and rest',
    descriptionAr: 'تجارب مع الأرق وروتين ما قبل النوم.',
    descriptionEn: 'Experiences with insomnia and wind-down routines.',
    icon: 'moon-outline',
    accent: 'sleep',
  },
  {
    id: 'group-stress',
    nameAr: 'ضغوط الدراسة والعمل',
    nameEn: 'Study and work pressure',
    descriptionAr: 'الحديث عن الضغط بدون تقليل من شأنه.',
    descriptionEn: 'Talking about pressure without minimising it.',
    icon: 'leaf-outline',
    accent: 'stress',
  },
  {
    id: 'group-firststeps',
    nameAr: 'الخطوات الأولى',
    nameEn: 'First steps',
    descriptionAr: 'لمن بدأ للتو يهتم بصحته النفسية.',
    descriptionEn: 'For anyone just starting to look after their mental health.',
    icon: 'sunny-outline',
    accent: 'reflection',
  },
];

export function getGroup(id: string): CommunityGroup | undefined {
  return communityGroups.find((g) => g.id === id);
}

export interface CommunityPost {
  id: string;
  threadId: string;
  /** Author's chosen alias — never the account display name. */
  authorAlias: string;
  /** True when this device wrote the post, so the UI can offer delete instead of report. */
  isMine: boolean;
  body: string;
  createdAt: string;
  /** Count of "this helped me too" acknowledgements. Support, not popularity. */
  supportCount: number;
  supportedByMe?: boolean;
  /** Locally recorded report — a real moderation queue replaces this. */
  reportedByMe?: boolean;
}

export interface CommunityThread {
  id: string;
  groupId: string;
  title: string;
  authorAlias: string;
  isMine: boolean;
  createdAt: string;
  /** First post's body, shown in the thread list. */
  excerpt: string;
  replyCount: number;
  supportCount: number;
}

/** Seed content dated relative to today so the groups never look abandoned. */
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

export interface SeedThread {
  thread: Omit<CommunityThread, 'replyCount' | 'supportCount' | 'isMine'>;
  posts: Omit<CommunityPost, 'isMine' | 'supportedByMe' | 'reportedByMe'>[];
}

export const seedThreads: SeedThread[] = [
  {
    thread: {
      id: 'thread-anxiety-mornings',
      groupId: 'group-anxiety',
      title: 'الصباح أصعب جزء في يومي',
      authorAlias: 'قمر',
      createdAt: hoursAgo(30),
      excerpt: 'أول ساعة بعد ما أصحى تكون أثقل شي. حاسس إن قلبي سريع قبل ما أفكر بأي شي.',
    },
    posts: [
      {
        id: 'post-anxiety-1',
        threadId: 'thread-anxiety-mornings',
        authorAlias: 'قمر',
        body: 'أول ساعة بعد ما أصحى تكون أثقل شي. حاسس إن قلبي سريع قبل ما أفكر بأي شي. حدا مر بنفس الإحساس؟',
        createdAt: hoursAgo(30),
        supportCount: 12,
      },
      {
        id: 'post-anxiety-2',
        threadId: 'thread-anxiety-mornings',
        authorAlias: 'رمال',
        body: 'نفس الشي عندي. الشي الوحيد اللي ساعدني إني ما أفتح التلفون أول ١٠ دقايق. مو حل سحري بس فرق.',
        createdAt: hoursAgo(26),
        supportCount: 8,
      },
      {
        id: 'post-anxiety-3',
        threadId: 'thread-anxiety-mornings',
        authorAlias: 'ندى',
        body: 'جربت تمرين التنفس الموجود بالتطبيق قبل ما أقوم من السرير. أحياناً بيهدي، وأحياناً لأ، وهذا عادي.',
        createdAt: hoursAgo(20),
        supportCount: 5,
      },
    ],
  },
  {
    thread: {
      id: 'thread-sleep-routine',
      groupId: 'group-sleep',
      title: 'كم صار عمر روتين نومكم قبل ما ينضبط؟',
      authorAlias: 'ليل',
      createdAt: hoursAgo(52),
      excerpt: 'صارلي أسبوعين ألتزم بوقت نوم ثابت وحاسس إني ما تحسنت. متى بيبين الفرق؟',
    },
    posts: [
      {
        id: 'post-sleep-1',
        threadId: 'thread-sleep-routine',
        authorAlias: 'ليل',
        body: 'صارلي أسبوعين ألتزم بوقت نوم ثابت وحاسس إني ما تحسنت. متى بيبين الفرق؟',
        createdAt: hoursAgo(52),
        supportCount: 6,
      },
      {
        id: 'post-sleep-2',
        threadId: 'thread-sleep-routine',
        authorAlias: 'سراج',
        body: 'عندي أخذ حوالي شهر. وأهم شي كان وقت الاستيقاظ مو وقت النوم.',
        createdAt: hoursAgo(44),
        supportCount: 11,
      },
    ],
  },
  {
    thread: {
      id: 'thread-stress-exams',
      groupId: 'group-stress',
      title: 'كيف تفصلون بين الشغل والبيت؟',
      authorAlias: 'هدوء',
      createdAt: hoursAgo(8),
      excerpt: 'من يوم ما صار شغلي من البيت ما عدت أعرف وين ينتهي الدوام.',
    },
    posts: [
      {
        id: 'post-stress-1',
        threadId: 'thread-stress-exams',
        authorAlias: 'هدوء',
        body: 'من يوم ما صار شغلي من البيت ما عدت أعرف وين ينتهي الدوام. أي شي ساعدكم؟',
        createdAt: hoursAgo(8),
        supportCount: 4,
      },
      {
        id: 'post-stress-2',
        threadId: 'thread-stress-exams',
        authorAlias: 'مها',
        body: 'مشوار قصير بعد آخر اجتماع. صار عندي إشارة إن اليوم خلص.',
        createdAt: hoursAgo(5),
        supportCount: 9,
      },
    ],
  },
  {
    thread: {
      id: 'thread-firststeps-hello',
      groupId: 'group-firststeps',
      title: 'أول مرة أستخدم تطبيق للصحة النفسية',
      authorAlias: 'بداية',
      createdAt: hoursAgo(72),
      excerpt: 'ما أعرف من وين أبدأ بالضبط. أي نصيحة لأول أسبوع؟',
    },
    posts: [
      {
        id: 'post-first-1',
        threadId: 'thread-firststeps-hello',
        authorAlias: 'بداية',
        body: 'ما أعرف من وين أبدأ بالضبط. أي نصيحة لأول أسبوع؟',
        createdAt: hoursAgo(72),
        supportCount: 15,
      },
      {
        id: 'post-first-2',
        threadId: 'thread-firststeps-hello',
        authorAlias: 'ورد',
        body: 'سجل مزاجك بس. بدون ما تحاول تغير شي أول أسبوع. بعدين بتشوف النمط بنفسك.',
        createdAt: hoursAgo(70),
        supportCount: 21,
      },
    ],
  },
];

export interface CommunityProfile {
  /** User-chosen alias. Empty until they pick one. */
  alias: string;
  hasAcceptedGuidelines: boolean;
}

export const emptyCommunityProfile: CommunityProfile = { alias: '', hasAcceptedGuidelines: false };

/** Alias suggestions so nobody feels pushed into using their real name. */
export const aliasSuggestions = ['هدوء', 'سراج', 'ندى', 'ورد', 'ليل', 'قمر', 'رمال', 'بداية'];

export const MAX_POST_LENGTH = 1000;
export const MIN_POST_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 24;

/**
 * The rules, shown before anyone can post and linked from every thread.
 * Deliberately short — a wall of legal text is not read.
 */
export interface Guideline {
  id: string;
  textAr: string;
  textEn: string;
}

export const communityGuidelines: Guideline[] = [
  {
    id: 'support',
    textAr: 'شارك تجربتك، ولا تعطِ تشخيصاً أو وصفة دواء لأحد.',
    textEn: 'Share your experience — never diagnose someone or recommend medication.',
  },
  {
    id: 'privacy',
    textAr: 'لا تنشر أسماء أو أرقام أو تفاصيل تعرّف بك أو بغيرك.',
    textEn: 'Do not post names, numbers, or details that identify you or anyone else.',
  },
  {
    id: 'method',
    textAr: 'لا تشارك تفاصيل عن إيذاء النفس أو وسائله.',
    textEn: 'Do not share details or methods of self-harm.',
  },
  {
    id: 'crisis',
    textAr: 'المجتمع ليس خدمة طوارئ. إذا كنت في خطر الآن، افتح صفحة الأمان.',
    textEn: 'This community is not an emergency service. If you are in danger now, open the Safety page.',
  },
  {
    id: 'report',
    textAr: 'إذا رأيت منشوراً يقلقك، أبلغ عنه بدل الرد عليه.',
    textEn: 'If a post worries you, report it rather than replying.',
  },
];
