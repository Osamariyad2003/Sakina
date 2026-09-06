/**
 * AI Therapy Chatbot ("Doctor Freud AI") — content, types, and pure helpers.
 *
 * Structure/flow mirrors the SH Freud UI Kit v1.7 "AI Chatbot" flow (intro →
 * dashboard → chats list with Recent/Trash → new conversation config →
 * per-conversation chat with emotion tagging + inline resources + crisis
 * support → custom instructions → delete/restore). Figma is a community file
 * with no editor access, so this is the flow reproduced with 100% Sakina
 * tokens/primitives and bilingual (ar/en) content — NO Figma visual values.
 *
 * ⚠️ NOT A CLINICIAN. This is a supportive, non-clinical companion, not
 * therapy and not a diagnosis (product-definition.md Open Questions #2/#3/#4).
 * Emotion "detection" here is a deterministic keyword heuristic, clearly
 * illustrative — never a clinical assessment. Crisis language always routes to
 * the real Safety resources (see therapyService + riskDetection).
 */

export type CommunicationStyle = 'casual' | 'formal' | 'fun';

export const communicationStyles: { id: CommunicationStyle; labelAr: string; labelEn: string }[] = [
  { id: 'casual', labelAr: 'عفوي', labelEn: 'Casual' },
  { id: 'formal', labelAr: 'رسمي', labelEn: 'Formal' },
  { id: 'fun', labelAr: 'مرِح', labelEn: 'Fun' },
];

export const therapyGoals: { id: string; labelAr: string; labelEn: string }[] = [
  { id: 'reduceStress', labelAr: 'تقليل التوتر', labelEn: 'Reduce stress level' },
  { id: 'sleepBetter', labelAr: 'نوم أفضل', labelEn: 'Sleep better' },
  { id: 'manageAnxiety', labelAr: 'إدارة القلق', labelEn: 'Manage anxiety' },
  { id: 'buildConfidence', labelAr: 'بناء الثقة', labelEn: 'Build confidence' },
  { id: 'processGrief', labelAr: 'تجاوز الفقد', labelEn: 'Process grief' },
  { id: 'generalWellbeing', labelAr: 'راحة نفسية عامة', labelEn: 'General wellbeing' },
];

/** Conversation avatar icons (Ionicons names) + which accent token colors them. */
export const conversationIcons: { id: string; icon: string; accent: 'sleep' | 'reflection' | 'stress' | 'hydration' | 'journaling' | 'steps' }[] = [
  { id: 'leaf', icon: 'leaf', accent: 'journaling' },
  { id: 'moon', icon: 'moon', accent: 'sleep' },
  { id: 'heart', icon: 'heart', accent: 'stress' },
  { id: 'flower', icon: 'flower', accent: 'reflection' },
  { id: 'sparkles', icon: 'sparkles', accent: 'steps' },
  { id: 'water', icon: 'water', accent: 'hydration' },
];

/**
 * "AI LLM checkpoints" selector. [ASSUMPTION] The Figma lists third-party
 * model names (GPT/Llama/PaLM/…); we deliberately DON'T reproduce those — the
 * app must not imply it calls other providers. These are Sakina-branded,
 * illustrative preference labels only; the real backend always uses Sakina's
 * own Claude-backed assistant regardless of selection (see ASSUMPTIONS.md).
 */
export const aiCheckpoints: { id: string; labelAr: string; labelEn: string }[] = [
  { id: 'core', labelAr: 'سكينة كور', labelEn: 'Sakina Core' },
  { id: 'calm', labelAr: 'سكينة كالم', labelEn: 'Sakina Calm' },
  { id: 'focus', labelAr: 'سكينة فوكَس', labelEn: 'Sakina Focus' },
  { id: 'deep', labelAr: 'سكينة ديب', labelEn: 'Sakina Deep' },
  { id: 'lite', labelAr: 'سكينة لايت', labelEn: 'Sakina Lite' },
  { id: 'guard', labelAr: 'سكينة جارد', labelEn: 'Sakina Guard' },
];
export const MAX_CHECKPOINTS = 3;

export type DetectedEmotion = 'happy' | 'sad' | 'anxious' | 'angry' | 'despair' | 'neutral' | 'crisis';

export interface TherapyConversation {
  id: string;
  topicName: string;
  preferredName: string;
  iconId: string;
  style: CommunicationStyle;
  goalId: string;
  checkpointIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  /** Most recent detected emotion — drives the list mood tag. */
  lastEmotion: DetectedEmotion;
  trashed: boolean;
  trashedAt?: string;
}

export interface TherapyMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  streaming?: boolean;
  /** Emotion tagged on a user turn (illustrative). */
  emotion?: DetectedEmotion;
}

export type ResourceKind = 'course' | 'book' | 'therapist';
export interface TherapyResource {
  id: string;
  kind: ResourceKind;
  titleAr: string;
  titleEn: string;
  metaAr: string;
  metaEn: string;
}

/** [ASSUMPTION] Illustrative resources surfaced inline by the bot — not a real catalog. */
export const therapyResources: TherapyResource[] = [
  { id: 'course-mindful-1', kind: 'course', titleAr: 'دورة اليقظة الذهنية #1', titleEn: 'Mindfulness Course #1', metaAr: '١٠ دقائق', metaEn: '10 min' },
  { id: 'book-noonday', kind: 'book', titleAr: 'شياطين الظهيرة', titleEn: 'The Noonday Demon', metaAr: '٢٥ صفحة · ٢٠ دقيقة', metaEn: '25 pages · 20 min' },
  { id: 'book-lost', kind: 'book', titleAr: 'روابط مفقودة', titleEn: 'Lost Connections', metaAr: '١٩ صفحة · ١٠ دقائق', metaEn: '19 pages · 10 min' },
  { id: 'book-overthinking', kind: 'book', titleAr: 'توقف عن التفكير الزائد', titleEn: 'Stop Overthinking', metaAr: '١٦ صفحة · ١٥ دقيقة', metaEn: '16 pages · 15 min' },
];

/** [ASSUMPTION] Read-only illustrative therapists for crisis/therapy suggestions (booking deferred). */
export const therapySuggestedTherapists: { id: string; name: string; specialtyAr: string; specialtyEn: string; distanceKm: number; rating: number }[] = [
  { id: 't1', name: 'Dr. Hannibal Lector', specialtyAr: 'قلق', specialtyEn: 'Anxiety', distanceKm: 1.1, rating: 4.1 },
  { id: 't2', name: 'Dr. Saylor Twift', specialtyAr: 'اكتئاب', specialtyEn: 'Depression', distanceKm: 0.9, rating: 3.4 },
];

// ---------------------------------------------------------------------------
// Pure helpers.
// ---------------------------------------------------------------------------

const emotionKeywords: { emotion: DetectedEmotion; keywords: string[] }[] = [
  { emotion: 'happy', keywords: ['سعيد', 'مبسوط', 'فرحان', 'happy', 'great', 'glad', 'excited'] },
  { emotion: 'angry', keywords: ['غاضب', 'زعلان', 'معصب', 'angry', 'furious', 'mad'] },
  { emotion: 'despair', keywords: ['يأس', 'ميؤوس', 'ما في أمل', 'despair', 'hopeless', 'worthless'] },
  { emotion: 'anxious', keywords: ['قلقان', 'متوتر', 'خايف', 'anxious', 'worried', 'nervous', 'stress'] },
  { emotion: 'sad', keywords: ['حزين', 'زعلان', 'مكتئب', 'sad', 'down', 'depressed', 'lonely', 'crying'] },
];

/**
 * Deterministic keyword emotion tag (illustrative only). Returns 'neutral'
 * when nothing matches. Crisis is NOT decided here — the service upgrades to
 * 'crisis' via the shared risk detector so escalation is centralized.
 */
export function detectEmotion(text: string): DetectedEmotion {
  const normalized = text.toLowerCase();
  const match = emotionKeywords.find((entry) => entry.keywords.some((k) => normalized.includes(k.toLowerCase())));
  return match?.emotion ?? 'neutral';
}

export function iconMeta(iconId: string) {
  return conversationIcons.find((i) => i.id === iconId) ?? conversationIcons[0];
}
