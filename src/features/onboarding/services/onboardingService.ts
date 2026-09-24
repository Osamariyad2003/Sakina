import { config } from '../../../config';
import { apiClient } from '../../../core/api';
import { useOnboardingAnswersStore } from '../state/onboardingAnswersStore';

/**
 * Onboarding happens before login, so the answers live on the device first
 * (onboardingAnswersStore). After a successful login/register with the real API
 * on, they are pushed once to `PUT /onboarding { goals, baseline, completed }`.
 * The backend needs at least one goal and a flat baseline of string/number/
 * boolean values, so the app's three answer maps are flattened into one:
 * single-choice answers as-is, multi-choice answers comma-joined, and scale
 * answers as numbers. Best-effort: a failure never blocks logging in, and the
 * answers stay local either way.
 */
export async function syncOnboardingAnswers(): Promise<void> {
  if (config.useMockServices) return;

  const { goalIds, baseline, multiAnswers, scaleAnswers } = useOnboardingAnswersStore.getState();
  if (goalIds.length === 0) return; // the backend requires at least one goal

  const flatBaseline: Record<string, string | number> = { ...baseline, ...scaleAnswers };
  for (const [questionId, optionIds] of Object.entries(multiAnswers)) {
    if (optionIds.length > 0) flatBaseline[questionId] = optionIds.join(',');
  }

  await apiClient.put('/onboarding', { goals: goalIds, baseline: flatBaseline, completed: true });
}
