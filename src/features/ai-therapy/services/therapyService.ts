import { storage, storageKeys } from '../../../core/storage/mmkv';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { config } from '../../../config';
import { apiClient } from '../../../core/api/client';
import { containsRiskLanguage } from '../../../domain/safety/riskDetection';
import {
  detectEmotion,
  type CommunicationStyle,
  type DetectedEmotion,
  type TherapyConversation,
  type TherapyMessage,
} from '../models/therapyContent';

/**
 * AI Therapy chatbot service. Conversations + per-conversation messages are
 * mock-persisted to MMKV. Replies come from the mock generator or, when
 * `config.featureFlags.aiCompanionLive` is on (it is whenever the real API is on),
 * the backend's /companion/message — the same AI as the Companion (the app never
 * holds a model key).
 *
 * SAFETY: `containsRiskLanguage` runs client-side on every user turn; crisis
 * language short-circuits to a supportive reply + a `crisis` emotion tag and
 * NEVER calls the model — the UI turns that into an active crisis-support
 * banner routing to the real Safety resources. Still the placeholder keyword
 * detector (Open Question #3).
 */


const MAX_HISTORY_SENT = 20;

// --- Conversations ---------------------------------------------------------

function readConversations(): TherapyConversation[] {
  return storage.getJSON<TherapyConversation[]>(storageKeys.mockTherapyConversations) ?? [];
}
function writeConversations(list: TherapyConversation[]) {
  storage.setJSON(storageKeys.mockTherapyConversations, list);
}
function messagesKey(conversationId: string) {
  return `${storageKeys.therapyMessagesPrefix}${conversationId}`;
}
function readMessages(conversationId: string): TherapyMessage[] {
  return storage.getJSON<TherapyMessage[]>(messagesKey(conversationId)) ?? [];
}
function writeMessages(conversationId: string, messages: TherapyMessage[]) {
  storage.setJSON(messagesKey(conversationId), messages);
}

export interface CreateConversationInput {
  topicName: string;
  preferredName: string;
  iconId: string;
  style: CommunicationStyle;
  goalId: string;
  checkpointIds: string[];
  isPublic: boolean;
}

async function listConversations(): Promise<TherapyConversation[]> {
  await simulateLatency(200);
  return readConversations().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

async function getConversation(id: string): Promise<TherapyConversation | undefined> {
  await simulateLatency(120);
  return readConversations().find((c) => c.id === id);
}

async function createConversation(input: CreateConversationInput): Promise<TherapyConversation> {
  await simulateLatency(250);
  const now = new Date().toISOString();
  const conversation: TherapyConversation = {
    id: `therapy-${Date.now()}`,
    topicName: input.topicName.trim() || 'New conversation',
    preferredName: input.preferredName.trim(),
    iconId: input.iconId,
    style: input.style,
    goalId: input.goalId,
    checkpointIds: input.checkpointIds,
    isPublic: input.isPublic,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    lastEmotion: 'neutral',
    trashed: false,
  };
  writeConversations([conversation, ...readConversations()]);
  return conversation;
}

async function setTrashed(id: string, trashed: boolean): Promise<TherapyConversation[]> {
  await simulateLatency(150);
  const next = readConversations().map((c) =>
    c.id === id ? { ...c, trashed, trashedAt: trashed ? new Date().toISOString() : undefined } : c,
  );
  writeConversations(next);
  return next;
}

async function deleteForever(id: string): Promise<TherapyConversation[]> {
  await simulateLatency(150);
  storage.delete(messagesKey(id));
  storage.delete(`${storageKeys.therapyServerConversationPrefix}${id}`);
  const next = readConversations().filter((c) => c.id !== id);
  writeConversations(next);
  return next;
}

// --- Messages --------------------------------------------------------------

async function getMessages(conversationId: string): Promise<TherapyMessage[]> {
  await simulateLatency(150);
  return readMessages(conversationId);
}

const CRISIS_REPLY =
  'أنا آسف إنك حاسس هيك، وكلامك مهم كتير. أنا رفيق للدعم مش بديل عن مختص، وهاد الوضع بحاجة دعم فوري. ' +
  'رجاءً افتح صفحة الدعم والطوارئ الآن، أو تواصل مع حدا بتثق فيه أو خدمات الطوارئ فوراً.';

const styleReplies: Record<CommunicationStyle, string[]> = {
  casual: [
    'سمعتك تماماً. احكيلي أكتر، شو اللي دايخ ببالك هلأ؟',
    'مبيّن إنه هالشي تقيل عليك. خذ راحتك، أنا معك.',
  ],
  formal: [
    'شكراً لمشاركتك هذا. هل يمكن أن تخبرني أكثر عمّا تشعر به الآن؟',
    'أتفهّم أن هذا الأمر مهم بالنسبة لك. لنعمل عليه معاً بخطوات هادئة.',
  ],
  fun: [
    'تمام، إحنا فريق هلأ 💪 احكيلي شو صاير وبنفكّها سوا.',
    'أنا هون وجاهز أسمعك — شو أكتر إشي بدك نشتغل عليه اليوم؟',
  ],
};

function pickMockReply(style: CommunicationStyle): string {
  const pool = styleReplies[style] ?? styleReplies.casual;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * There is no separate therapy endpoint: this reuses the backend's
 * POST /companion/message, which takes only { conversationId?, messages,
 * language } and answers { reply, riskFlagged, conversationId } (no
 * { success, data } envelope). Consequently the conversation's style, preferred
 * name and goal are NOT sent — the backend's system prompt is fixed — and the
 * backend conversation id is remembered per therapy conversation so its replies
 * stay in one server-side thread.
 */
async function fetchLiveReply(
  conversationId: string,
  history: TherapyMessage[],
  language: 'ar' | 'en',
): Promise<string> {
  const serverKey = `${storageKeys.therapyServerConversationPrefix}${conversationId}`;
  const messages = history.slice(-MAX_HISTORY_SENT).map((m) => ({ role: m.role, content: m.content }));
  const { data } = await apiClient.post<{ reply?: string; conversationId?: string }>(config.companionApiPath, {
    messages,
    language,
    conversationId: storage.getJSON<string>(serverKey) ?? undefined,
  });
  if (data?.conversationId) storage.setJSON(serverKey, data.conversationId);
  return data?.reply?.trim() || 'أنا هون بسمعك. احكيلي أكتر عن اللي حاسس فيه.';
}

async function streamOut(fullReply: string, onToken?: (partial: string) => void, perWordMs = 45) {
  if (!onToken) return;
  const words = fullReply.split(' ');
  let streamed = '';
  for (const word of words) {
    streamed = streamed ? `${streamed} ${word}` : word;
    onToken(streamed);
    // eslint-disable-next-line no-await-in-loop
    await simulateLatency(perWordMs);
  }
}

export interface SendResult {
  userMessage: TherapyMessage;
  assistantMessage: TherapyMessage;
  emotion: DetectedEmotion;
  riskDetected: boolean;
}

async function sendMessage(
  conversationId: string,
  text: string,
  // `language` is supplied by the caller — this module does not render.
  options: { onToken?: (partial: string) => void; language?: 'ar' | 'en' } = {},
): Promise<SendResult> {
  const conversation = readConversations().find((c) => c.id === conversationId);
  const style: CommunicationStyle = conversation?.style ?? 'casual';

  const riskDetected = containsRiskLanguage(text);
  const emotion: DetectedEmotion = riskDetected ? 'crisis' : detectEmotion(text);

  const userMessage: TherapyMessage = {
    id: `tmsg-${Date.now()}-user`,
    conversationId,
    role: 'user',
    content: text,
    createdAt: new Date().toISOString(),
    emotion,
  };
  writeMessages(conversationId, [...readMessages(conversationId), userMessage]);

  await simulateLatency(riskDetected ? 300 : 500);

  let fullReply: string;
  if (riskDetected) {
    fullReply = CRISIS_REPLY; // never route crisis language to the model
  } else if (config.featureFlags.aiCompanionLive) {
    fullReply = await fetchLiveReply(conversationId, readMessages(conversationId), options.language ?? 'ar');
  } else {
    fullReply = pickMockReply(style);
  }

  await streamOut(fullReply, options.onToken);

  const assistantMessage: TherapyMessage = {
    id: `tmsg-${Date.now()}-assistant`,
    conversationId,
    role: 'assistant',
    content: fullReply,
    createdAt: new Date().toISOString(),
  };
  writeMessages(conversationId, [...readMessages(conversationId), assistantMessage]);

  // Update the conversation's rollup (count + last emotion + timestamp).
  const next = readConversations().map((c) =>
    c.id === conversationId
      ? { ...c, messageCount: c.messageCount + 2, lastEmotion: emotion, updatedAt: new Date().toISOString() }
      : c,
  );
  writeConversations(next);

  return { userMessage, assistantMessage, emotion, riskDetected };
}

export const therapyService = {
  listConversations,
  getConversation,
  createConversation,
  setTrashed,
  deleteForever,
  getMessages,
  sendMessage,
};
