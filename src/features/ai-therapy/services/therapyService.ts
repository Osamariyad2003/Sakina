import { storage, storageKeys } from '../../../core/storage/mmkv';
import { config } from '../../../config';
import { apiClient } from '../../../core/api/client';
import { containsRiskLanguage } from '../../ai-companion/models/riskDetection';
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
 * `config.featureFlags.aiCompanionLive` is on, the same Claude-backed proxy as
 * the AI Companion (the app never holds the key — see server/companion-proxy/).
 *
 * SAFETY: `containsRiskLanguage` runs client-side on every user turn; crisis
 * language short-circuits to a supportive reply + a `crisis` emotion tag and
 * NEVER calls the model — the UI turns that into an active crisis-support
 * banner routing to the real Safety resources. Still the placeholder keyword
 * detector (Open Question #3).
 */

function fakeDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  await fakeDelay(200);
  return readConversations().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

async function getConversation(id: string): Promise<TherapyConversation | undefined> {
  await fakeDelay(120);
  return readConversations().find((c) => c.id === id);
}

async function createConversation(input: CreateConversationInput): Promise<TherapyConversation> {
  await fakeDelay(250);
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
  await fakeDelay(150);
  const next = readConversations().map((c) =>
    c.id === id ? { ...c, trashed, trashedAt: trashed ? new Date().toISOString() : undefined } : c,
  );
  writeConversations(next);
  return next;
}

async function deleteForever(id: string): Promise<TherapyConversation[]> {
  await fakeDelay(150);
  storage.delete(messagesKey(id));
  const next = readConversations().filter((c) => c.id !== id);
  writeConversations(next);
  return next;
}

// --- Messages --------------------------------------------------------------

async function getMessages(conversationId: string): Promise<TherapyMessage[]> {
  await fakeDelay(150);
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

async function fetchLiveReply(history: TherapyMessage[]): Promise<string> {
  const messages = history.slice(-MAX_HISTORY_SENT).map((m) => ({ role: m.role, content: m.content }));
  const { data } = await apiClient.post<{ reply: string }>(config.companionApiPath, { messages });
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
    await fakeDelay(perWordMs);
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
  options: { onToken?: (partial: string) => void } = {},
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

  await fakeDelay(riskDetected ? 300 : 500);

  let fullReply: string;
  if (riskDetected) {
    fullReply = CRISIS_REPLY; // never route crisis language to the model
  } else if (config.featureFlags.aiCompanionLive) {
    fullReply = await fetchLiveReply(readMessages(conversationId));
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
