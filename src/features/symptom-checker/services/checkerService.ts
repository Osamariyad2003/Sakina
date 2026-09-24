import { storage, storageKeys } from '../../../core/storage/mmkv';
import { parseContract } from '../../../core/api';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { config } from '../../../config';
import { apiClient, fetchAllPages, unwrap, type ApiSuccess } from '../../../core/api';
import { containsRiskLanguage } from '../../../domain/safety/riskDetection';
import { rankConditions, type CheckerMethod, type CheckerSession, type ConditionMatch, CheckerSessionSchema } from '../models/checkerContent';

/**
 * [ASSUMPTION] No backend / no clinical model exists (product-definition.md
 * Open Questions #3/#4). Same mock pattern as the other services: MMKV
 * persistence + `fakeDelay` to exercise the "Analyzing…" state. The analysis
 * is the deterministic `rankConditions` demo heuristic — NOT a diagnosis (see
 * checkerContent.ts header). `flagsRisk` reuses the AI Companion's keyword
 * risk detector; it is a minimal placeholder, not a clinical risk tool, and
 * the UI always routes flagged input to the real Safety resources.
 */


function readSessions(): CheckerSession[] {
  return storage.getJSON<CheckerSession[]>(storageKeys.mockCheckerSessions) ?? [];
}

function writeSessions(sessions: CheckerSession[]) {
  storage.setJSON(storageKeys.mockCheckerSessions, sessions);
}

export interface AnalyzeInput {
  method: CheckerMethod;
  symptomIds: string[];
  /** Free text collected during the run — scanned for risk language. */
  freeText?: string;
  /** Explicit self-harm answer from the chatbot flow. */
  selfHarmReported?: boolean;
}

export interface AnalyzeResult {
  sessionId: string;
  matches: ConditionMatch[];
  riskFlagged: boolean;
}

/** True if free text contains risk language OR self-harm was explicitly reported. */
export function flagsRisk(input: { freeText?: string; selfHarmReported?: boolean }): boolean {
  if (input.selfHarmReported) return true;
  return input.freeText ? containsRiskLanguage(input.freeText) : false;
}

async function analyze(input: AnalyzeInput): Promise<AnalyzeResult> {
  await simulateLatency(1200); // "Analyzing Data…"
  const matches = rankConditions(input.symptomIds);
  const riskFlagged = flagsRisk(input);
  const session: CheckerSession = {
    id: `checker-${Date.now()}`,
    method: input.method,
    createdAt: new Date().toISOString(),
    symptomIds: input.symptomIds,
    topConditionId: matches[0]?.conditionId ?? null,
    riskFlagged,
  };
  writeSessions([session, ...readSessions()]);
  return { sessionId: session.id, matches, riskFlagged };
}

async function listSessions(): Promise<CheckerSession[]> {
  await simulateLatency(200);
  return readSessions();
}

// --- Real backend (config.useMockServices false) ----------------------------
// /symptom-checker: POST { answers } · GET (paginated, newest first). The
// backend only *records* a session and attaches a non-diagnostic placeholder
// label — it does no condition matching — so `rankConditions` still runs in the
// app and the outcome is saved as the session's answers (symptom ids are sent
// comma-joined because answer values must be string/number/boolean). Free
// text is scanned for risk language locally and never sent.

interface ApiCheckerSession {
  id: string;
  createdAt: string;
  answers: Record<string, string | number | boolean>;
}

function fromApiSession(session: ApiCheckerSession): CheckerSession {
  const { method, symptomIds, topConditionId, riskFlagged } = session.answers;
  const mapped = {
    id: session.id,
    method: method as CheckerMethod,
    createdAt: session.createdAt,
    symptomIds: typeof symptomIds === 'string' && symptomIds ? symptomIds.split(',') : [],
    topConditionId: typeof topConditionId === 'string' && topConditionId ? topConditionId : null,
    riskFlagged: riskFlagged === true,
  };

  return parseContract(CheckerSessionSchema, mapped, 'GET /symptom-checker');
}

async function liveAnalyze(input: AnalyzeInput): Promise<AnalyzeResult> {
  const matches = rankConditions(input.symptomIds);
  const riskFlagged = flagsRisk(input);
  const answers = {
    method: input.method,
    symptomIds: input.symptomIds.join(','),
    topConditionId: matches[0]?.conditionId ?? '',
    riskFlagged,
  };
  const session = unwrap(await apiClient.post<ApiSuccess<ApiCheckerSession>>('/symptom-checker', { answers }));
  return { sessionId: session.id, matches, riskFlagged };
}

async function liveListSessions(): Promise<CheckerSession[]> {
  return (await fetchAllPages<ApiCheckerSession>('/symptom-checker')).map(fromApiSession);
}

export const checkerService = config.useMockServices
  ? { analyze, listSessions }
  : { analyze: liveAnalyze, listSessions: liveListSessions };
