/**
 * Help centre content (SH Freud reference section "Profile Settings & Help
 * Center").
 *
 * Written to answer the questions this app actually raises — what happens to
 * my data, is the AI a therapist, why does the app say it isn't a diagnosis —
 * rather than generic FAQ filler. Where an answer depends on an unresolved
 * business decision, the article says so instead of inventing a policy.
 */

export type HelpCategory = 'gettingStarted' | 'privacy' | 'ai' | 'safety' | 'account' | 'troubleshooting';

export const helpCategories: { id: HelpCategory; icon: 'compass-outline' | 'lock-closed-outline' | 'sparkles-outline' | 'shield-outline' | 'person-outline' | 'construct-outline' }[] = [
  { id: 'gettingStarted', icon: 'compass-outline' },
  { id: 'privacy', icon: 'lock-closed-outline' },
  { id: 'ai', icon: 'sparkles-outline' },
  { id: 'safety', icon: 'shield-outline' },
  { id: 'account', icon: 'person-outline' },
  { id: 'troubleshooting', icon: 'construct-outline' },
];

export interface HelpArticle {
  id: string;
  category: HelpCategory;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  /** An in-app destination that resolves the question, when one exists. */
  action?: { kind: 'safety' | 'privacy' | 'settings' | 'contact' | 'notifications' };
}

export const helpArticles: HelpArticle[] = [
  {
    id: 'where-to-start',
    category: 'gettingStarted',
    questionAr: 'من وين أبدأ؟',
    questionEn: 'Where do I start?',
    answerAr:
      'ابدأ بتسجيل مزاجك يومياً لأسبوع. هذا وحده يعطيك صورة عن نمطك بدون ما تغير أي شي بحياتك. بعدها جرّب تمرين تنفس واحد، أو اكتب سطر باليوميات. ما في ترتيب صحيح — كل شي بالتطبيق اختياري.',
    answerEn:
      'Start by logging your mood daily for a week. That alone gives you a picture of your pattern without changing anything else. Then try one breathing exercise, or write a single line in the journal. There is no correct order — everything in the app is optional.',
  },
  {
    id: 'what-data-is-stored',
    category: 'privacy',
    questionAr: 'وين تُحفظ بياناتي؟',
    questionEn: 'Where is my data stored?',
    answerAr:
      'حالياً كل ما تكتبه — المزاج، اليوميات، المحادثات، الحجوزات — محفوظ على جهازك فقط، ولا يُرسل لأي خادم. عند إضافة خادم لاحقاً سيتم إعلامك قبل أي مزامنة. تقدر تمسح كل بياناتك من صفحة الخصوصية.',
    answerEn:
      'Right now everything you write — moods, journal, conversations, bookings — is stored on your device only and is not sent to any server. If a server is added later you will be told before anything syncs. You can erase all of it from the Privacy page.',
    action: { kind: 'privacy' },
  },
  {
    id: 'delete-my-data',
    category: 'privacy',
    questionAr: 'كيف أمسح بياناتي؟',
    questionEn: 'How do I delete my data?',
    answerAr:
      'من الملف الشخصي ← الخصوصية، اضغط على مسح البيانات. هذا يمسح المزاج واليوميات والمحادثات والجلسات من الجهاز نهائياً ولا يمكن التراجع عنه.',
    answerEn:
      'Go to Profile → Privacy and choose to erase your data. That permanently removes moods, journal entries, conversations and sessions from this device, and cannot be undone.',
    action: { kind: 'privacy' },
  },
  {
    id: 'is-the-ai-a-therapist',
    category: 'ai',
    questionAr: 'هل المساعد الذكي معالج نفسي؟',
    questionEn: 'Is the AI assistant a therapist?',
    answerAr:
      'لا. المساعد أداة دعم للحديث والتأمل، وليس بديلاً عن مختص ولا يقدم تشخيصاً ولا وصفة دواء. إذا احتجت رعاية حقيقية، دليل المختصين داخل التطبيق نقطة بداية.',
    answerEn:
      'No. The assistant is a tool for talking things through and reflecting. It is not a substitute for a professional, and it does not diagnose or prescribe. If you need real care, the therapist directory in the app is a starting point.',
  },
  {
    id: 'why-not-a-diagnosis',
    category: 'ai',
    questionAr: 'ليش فاحص الأعراض ما يعطيني تشخيص؟',
    questionEn: 'Why does the symptom checker not give me a diagnosis?',
    answerAr:
      'لأن التشخيص يحتاج مختصاً يعرف تاريخك وسياقك. الفاحص يعرض حالات قد تتشابه مع ما وصفته لتساعدك تصيغ كلامك مع مختص — لا أكثر.',
    answerEn:
      'Because a diagnosis needs a professional who knows your history and context. The checker surfaces conditions that overlap with what you described, to help you put words to it with a professional — nothing more.',
  },
  {
    id: 'crisis-help',
    category: 'safety',
    questionAr: 'أحتاج مساعدة الآن',
    questionEn: 'I need help right now',
    answerAr:
      'صفحة الأمان فيها أرقام الطوارئ والدعم، وهي متاحة من كل شاشة رئيسية بضغطتين. إذا كنت في خطر فوري، اتصل بالطوارئ مباشرة.',
    answerEn:
      'The Safety page holds emergency and support numbers, and is reachable in two taps from every main screen. If you are in immediate danger, call emergency services directly.',
    action: { kind: 'safety' },
  },
  {
    id: 'community-safety',
    category: 'safety',
    questionAr: 'كيف يُدار المجتمع؟',
    questionEn: 'How is the community moderated?',
    answerAr:
      'المشاركة باسم مستعار، والإرشادات تُعرض قبل أي نشر. المنشورات التي تحتوي لغة خطر لا تُنشر إطلاقاً، ويُوجَّه كاتبها لصفحة الأمان. الإبلاغ حالياً يُخفي المنشور عن جهازك — لا يوجد فريق إشراف بعد، وهذا مذكور داخل الصفحة.',
    answerEn:
      'Posting is pseudonymous and the guidelines appear before you can post. Posts containing risk language are never published; the writer is routed to the Safety page instead. Reporting currently hides a post on your device — there is no moderation team yet, and the page says so.',
  },
  {
    id: 'change-language',
    category: 'account',
    questionAr: 'كيف أغيّر اللغة؟',
    questionEn: 'How do I change the language?',
    answerAr: 'من الملف الشخصي ← الإعدادات. التطبيق يدعم العربية والإنجليزية، ويعيد ترتيب الواجهة تلقائياً حسب اتجاه اللغة.',
    answerEn:
      'Profile → Settings. The app supports Arabic and English and flips the layout direction automatically.',
    action: { kind: 'settings' },
  },
  {
    id: 'reminders-not-arriving',
    category: 'troubleshooting',
    questionAr: 'ما تصلني التذكيرات',
    questionEn: 'My reminders are not arriving',
    answerAr:
      'التذكيرات حالياً تظهر داخل التطبيق فقط ولا تصل كإشعارات على الجهاز — هذه ميزة قيد التطوير ومذكورة في صفحة التذكيرات. تحقق أيضاً من ساعات الهدوء، فهي تلغي أي تذكير يقع داخلها.',
    answerEn:
      'Reminders currently appear inside the app only and are not delivered as device notifications — that is still in development and the Reminders page says so. Also check quiet hours, which suppress any reminder that falls inside them.',
    action: { kind: 'notifications' },
  },
  {
    id: 'booking-not-confirmed',
    category: 'troubleshooting',
    questionAr: 'حجزي ما زال قيد الانتظار',
    questionEn: 'My booking is still pending',
    answerAr:
      'الحجز يسجل رغبتك في موعد فقط؛ لا يوجد نظام حجز حقيقي بعد ولا يتم أي دفع داخل التطبيق. المختص وحده يقدر يؤكد الموعد.',
    answerEn:
      'Booking records your intent to meet only; there is no real booking system yet and no payment is taken in the app. Only the professional can confirm an appointment.',
  },
  {
    id: 'contact-support',
    category: 'account',
    questionAr: 'كيف أتواصل مع الدعم؟',
    questionEn: 'How do I contact support?',
    answerAr: 'من صفحة الدعم داخل مركز المساعدة. اكتب رسالتك وسنعود إليك عبر البريد المرتبط بحسابك.',
    answerEn: 'From the Contact page inside the Help Centre. Write your message and we will reply to the email on your account.',
    action: { kind: 'contact' },
  },
];

export function getHelpArticle(id: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.id === id);
}

export function searchHelp(query: string, isArabic: boolean): HelpArticle[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return helpArticles;
  return helpArticles.filter((article) => {
    const haystack = isArabic
      ? `${article.questionAr} ${article.answerAr}`
      : `${article.questionEn} ${article.answerEn}`;
    return haystack.toLowerCase().includes(needle);
  });
}

/** Support-request topics — kept short so the form stays one screen. */
export const supportTopics = ['account', 'privacy', 'bug', 'content', 'other'] as const;
export type SupportTopic = (typeof supportTopics)[number];
