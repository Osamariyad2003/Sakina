import { storage, storageKeys } from '../../../core/storage/mmkv';
import { containsRiskLanguage } from '../models/riskDetection';
import { config } from '../../../config';
import { apiClient } from '../../../core/api/client';
import type { ChatMessage } from '../../../types/models';

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
}

interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  riskDetected: boolean;
  suggestion?: 'stressManagement';
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

/** Calls the Claude-backed proxy and returns the assistant's reply text. */
async function fetchLiveReply(history: ChatMessage[]): Promise<string> {
  const messages = history
    .slice(-MAX_HISTORY_SENT)
    .map((m) => ({ role: m.role, content: m.content }));
  // apiClient's interceptors map transport errors to AppError and attach auth.
  const { data } = await apiClient.post<{ reply: string }>(config.companionApiPath, { messages });
  const reply = data?.reply?.trim();
  if (!reply) {
    // Empty/blocked model output must not render as a blank bubble.
    return genericReplies[0];
  }
  return reply;
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
  if (riskDetected) {
    // Safety short-circuit — never route crisis language through the model.
    fullReply = RISK_RESPONSE;
  } else if (config.featureFlags.aiCompanionLive) {
    fullReply = await fetchLiveReply(readMessages());
  } else {
    fullReply = pickMockReply(userText);
  }

  await streamOut(fullReply, options.onToken);

  const assistantMessage: ChatMessage = {
    id: `msg-${Date.now()}-assistant`,
    conversationId: DEFAULT_CONVERSATION_ID,
    role: 'assistant',
    content: fullReply,
    createdAt: new Date().toISOString(),
  };
  writeMessages([...readMessages(), assistantMessage]);

  return { userMessage, assistantMessage, riskDetected, suggestion };
}

export const companionService = {
  getMessages,
  sendMessage,
};
