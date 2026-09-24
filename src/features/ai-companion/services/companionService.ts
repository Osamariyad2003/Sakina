import { storage, storageKeys } from '../../../core/storage/mmkv';
import { containsRiskLanguage } from '../../../domain/safety/riskDetection';
import { config } from '../../../config';
import { apiClient } from '../../../core/api/client';
import { AIActionSchema, type AIAction, type AIActionType, type ChatMessage } from '../../../types/models';
import { isAiPersonalizationEnabled } from '../state/useAiPersonalization';

/**
 * The AI Companion service. Two branches share one contract
 * (`getMessages` / `sendMessage`), selected by `config.featureFlags.aiCompanionLive`:
 *
 * - **mock** (default): persists a single default conversation to MMKV and
 *   "streams" canned replies — used until a backend exists.
 * - **live**: calls the Claude-backed proxy at `apiBaseUrl + companionApiPath`
 *   (the proxy holds the Anthropic key server-side — the app must NEVER embed
 *   it; see `server/companion-proxy/`). History is still cached in MMKV so it
 *   survives restarts without a history backend.
 *
 * SAFETY (both branches): `containsRiskLanguage` runs client-side on the
 * user's text; when it fires we short-circuit to the supportive RISK_RESPONSE
 * and do NOT call the LLM, so escalation happens even if the model or network
 * fails. This is still the minimal keyword placeholder from riskDetection.ts —
 * product-definition.md Open Question #3 (a real, ideally server-side,
 * clinician-reviewed policy) remains unresolved.
 */

const DEFAULT_CONVERSATION_ID = 'default';
const MAX_HISTORY_SENT = 20;

function readMessages(): ChatMessage[] {
  return storage.getJSON<ChatMessage[]>(storageKeys.mockChatMessages) ?? [];
}

function writeMessages(messages: ChatMessage[]) {
  storage.setJSON(storageKeys.mockChatMessages, messages);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RISK_RESPONSE =
  'سمعتك، وشو ما تحكيه مهم. أنا رفيق للدعم بس مش بديل عن مختص، وحاسس إنه الوضع أكبر من اللي فيني ساعد فيه لحالي. ' +
  'فيك تفتح صفحة الدعم والطوارئ من هون فوراً، أو تحكي مع حدا بتوثق فيه الآن.';

const genericReplies = [
  'شكراً إنك شاركتني هاد. احكيلي أكتر، شو اللي حاسس إنه أصعب شي هلأ؟',
  'واضح إنه هاد الموضوع مهم إلك. خذلك وقتك، أنا هون بسمعك.',
  'حاسس معك إنه مو سهل. شو رأيك نجرب سوا نفهم شو بالضبط مضايقك؟',
];

const keywordReplies: { keywords: string[]; reply: string; suggestion?: 'stressManagement' }[] = [
  {
    keywords: ['ضغط', 'متوتر', 'توتر', 'stress'],
    reply: 'حاسس إنه في ضغط كبير عليك هالأيام. تحب نجرب سوا تمرين تنفس قصير يساعدك تهدى شوي؟',
    suggestion: 'stressManagement',
  },
  { keywords: ['حزين', 'حزن', 'sad'], reply: 'مسموحلك تحس هيك. شو اللي صار وخلاك تحس حزن؟' },
  {
    keywords: ['وحيد', 'وحدة', 'lonely'],
    reply: 'الشعور بالوحدة صعب كتير. إنت مش لحالك هلأ، أنا هون. بتحب تحكي أكتر عن هاد الإحساس؟',
  },
  {
    keywords: ['تنفس', 'نفس', 'breathing'],
    reply: 'تمام، خلينا نبلش تمرين تنفس بسيط. فيك تلاقيه من تبويب "تمارين" — بوديك فيه على طول؟',
  },
];

/**
 * The i18n key for an action's button label. The service hands back a key,
 * not a translated string; `AIActionRow` renders it.
 */
function actionLabelKey(type: AIActionType): string {
  return `companion.actions.${type}`;
}

function makeAction(type: AIActionType): AIAction {
  return { type, label: actionLabelKey(type) };
}

/** Mock-mode stand-in for the backend's suggested actions: a few obvious keyword → action pairs. */
function pickMockActions(userText: string): AIAction[] {
  const text = userText.trim();
  if (['ضغط', 'متوتر', 'توتر', 'تنفس', 'نفس', 'stress', 'breathing', 'panic'].some((k) => text.includes(k))) {
    return [makeAction('breathing')];
  }
  if (['حزين', 'حزن', 'وحيد', 'وحدة', 'sad', 'lonely'].some((k) => text.includes(k))) {
    return [makeAction('journal'), makeAction('mood_checkin')];
  }
  if (['نوم', 'أرق', 'sleep', 'insomnia'].some((k) => text.includes(k))) {
    return [makeAction('sleep')];
  }
  return [];
}

/** Non-clinical topic hint (e.g. surface the Stress Management entry) — kept client-side in both branches. */
function pickSuggestion(userText: string): 'stressManagement' | undefined {
  const normalized = userText.trim();
  return keywordReplies.find((entry) => entry.keywords.some((k) => normalized.includes(k)))?.suggestion;
}

function pickMockReply(userText: string): string {
  const normalized = userText.trim();
  const matched = keywordReplies.find((entry) => entry.keywords.some((k) => normalized.includes(k)));
  return matched ? matched.reply : genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

interface SendMessageOptions {
  onToken?: (partialContent: string) => void;
  /**
   * Which language the reply should come back in. Passed by the caller — this
   * module does not render and so cannot read the user's language, and
   * importing i18n here drags React Native into its tests
   * (docs/architecture-review.md §6.5).
   */
  language?: 'ar' | 'en';
}

interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  riskDetected: boolean;
  suggestion?: 'stressManagement';
  /** Suggested next steps to render under the reply (already validated). */
  actions: AIAction[];
}

async function getMessages(): Promise<ChatMessage[]> {
  await delay(200);
  return readMessages();
}

/** Reveals `fullReply` progressively through `onToken`, preserving the streaming UI contract. */
async function streamOut(fullReply: string, onToken?: (partial: string) => void, perWordMs = 45) {
  if (!onToken) return;
  const words = fullReply.split(' ');
  let streamed = '';
  for (const word of words) {
    streamed = streamed ? `${streamed} ${word}` : word;
    onToken(streamed);
    // eslint-disable-next-line no-await-in-loop
    await delay(perWordMs);
  }
}

interface LiveReply {
  reply: string;
  actions: AIAction[];
  /** The backend's own safety layer classified the message as high risk. */
  crisis: boolean;
}

/** Calls the backend companion (POST /companion/message) and returns its structured reply. */
async function fetchLiveReply(history: ChatMessage[], language: 'ar' | 'en'): Promise<LiveReply> {
  const messages = history
    .slice(-MAX_HISTORY_SENT)
    .map((m) => ({ role: m.role, content: m.content }));
  // apiClient's interceptors map transport errors to AppError and attach auth.
  // The backend answers with { reply, riskFlagged, conversationId } directly (no { success, data }
  // envelope, unlike its other routes); tolerate the wrapped form too.
  const { data } = await apiClient.post<{
    reply?: string;
    conversationId?: string;
    riskLevel?: 'normal' | 'concern' | 'high';
    suggestedActions?: unknown;
    data?: { reply?: string };
  }>(
    config.companionApiPath,
    {
      messages,
      language,
      // Only true when the user turned on personalised replies (Companion / Privacy).
      personalize: isAiPersonalizationEnabled(),
      conversationId: storage.getJSON<string>(storageKeys.companionServerConversationId) ?? undefined,
    },
  );
  // Keep every reply in one server-side thread instead of opening a new one per message.
  if (data?.conversationId) storage.setJSON(storageKeys.companionServerConversationId, data.conversationId);
  const reply = (data?.reply ?? data?.data?.reply)?.trim();
  // Validate what the backend sent rather than trusting it: unknown action types are dropped.
  const actions = Array.isArray(data?.suggestedActions)
    ? data.suggestedActions.flatMap((item) => {
        const parsed = AIActionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
  return {
    // Empty/blocked model output must not render as a blank bubble.
    reply: reply || genericReplies[0],
    actions,
    crisis: data?.riskLevel === 'high',
  };
}

async function sendMessage(userText: string, options: SendMessageOptions = {}): Promise<SendMessageResult> {
  const now = new Date().toISOString();
  const userMessage: ChatMessage = {
    id: `msg-${Date.now()}-user`,
    conversationId: DEFAULT_CONVERSATION_ID,
    role: 'user',
    content: userText,
    createdAt: now,
  };
  writeMessages([...readMessages(), userMessage]);

  const riskDetected = containsRiskLanguage(userText);
  const suggestion = riskDetected ? undefined : pickSuggestion(userText);

  await delay(riskDetected ? 300 : 500); // "AI thinking" beat before streaming

  let fullReply: string;
  let actions: AIAction[] = [];
  let serverCrisis = false;
  if (riskDetected) {
    // Safety short-circuit — never route crisis language through the model.
    fullReply = RISK_RESPONSE;
    actions = [makeAction('safety'), makeAction('professionals')];
  } else if (config.featureFlags.aiCompanionLive) {
    const live = await fetchLiveReply(readMessages(), options.language ?? 'ar');
    fullReply = live.reply;
    actions = live.actions;
    serverCrisis = live.crisis;
  } else {
    fullReply = pickMockReply(userText);
    actions = pickMockActions(userText);
  }

  await streamOut(fullReply, options.onToken);

  const assistantMessage: ChatMessage = {
    id: `msg-${Date.now()}-assistant`,
    conversationId: DEFAULT_CONVERSATION_ID,
    role: 'assistant',
    content: fullReply,
    createdAt: new Date().toISOString(),
    ...(actions.length ? { actions } : {}),
  };
  writeMessages([...readMessages(), assistantMessage]);

  // The backend's classifier catches phrasing the on-device keyword list misses; either one raises the crisis UI.
  return { userMessage, assistantMessage, riskDetected: riskDetected || serverCrisis, suggestion, actions };
}

/**
 * Clears the on-device chat history and forgets the backend conversation id, so
 * the next message starts a fresh server-side thread (the model gets no earlier
 * context). The backend has no endpoint to delete a single companion
 * conversation, so earlier messages remain server-side until the user runs
 * Profile → Privacy → "Clear my data".
 */
async function clearHistory(): Promise<void> {
  writeMessages([]);
  storage.delete(storageKeys.companionServerConversationId);
}

export const companionService = {
  getMessages,
  sendMessage,
  clearHistory,
};
