import { storage, storageKeys } from '../../../core/storage/mmkv';
import { config } from '../../../config';
import { AppError } from '../../../core/errors';
import { containsRiskLanguage } from '../../ai-companion/models/riskDetection';
import { rankConditions, type CheckerMethod, type CheckerSession, type ConditionMatch } from '../models/checkerContent';

/**
 * [ASSUMPTION] No backend / no clinical model exists (product-definition.md
 * Open Questions #3/#4). Same mock pattern as the other services: MMKV
 * persistence + `fakeDelay` to exercise the "Analyzing…" state. The analysis
 * is the deterministic `rankConditions` demo heuristic — NOT a diagnosis (see
 * checkerContent.ts header). `flagsRisk` reuses the AI Companion's keyword
 * risk detector; it is a minimal placeholder, not a clinical risk tool, and
 * the UI always routes flagged input to the real Safety resources.
 */

function fakeDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  await fakeDelay(1200); // "Analyzing Data…"
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
  await fakeDelay(200);
  return readSessions();
}

if (!config.useMockServices) {
  throw new AppError('checkerService: config.useMockServices=false but no real implementation is wired up yet.', 'unknown');
}

export const checkerService = { analyze, listSessions };
