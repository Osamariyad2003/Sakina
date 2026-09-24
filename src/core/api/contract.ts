import type { ZodType } from 'zod';
// Imported from the class module, not the `../errors` barrel: that barrel
// also exports `ErrorBoundary`, a React component, and pulling React Native
// into the data path makes this module untestable under plain Node.
import { AppError } from '../errors/AppError';

/**
 * Runtime check that what the backend sent still matches what this build
 * expects.
 *
 * `src/types/models.ts` has always claimed its zod schemas are "validated at
 * the API boundary", but until now nothing parsed them: responses were cast
 * through hand-written `Api*` interfaces, which disappear at compile time. A
 * renamed or dropped field therefore reached the UI as `undefined` rather
 * than as a caught error. See docs/architecture-review.md §2.4 / §13 (P0).
 *
 * Applied to the *mapped domain object*, not the raw payload, so it also
 * catches mistakes in the `fromApi*` mappers themselves.
 *
 * Failure policy: throw. A screen showing its error state is a better outcome
 * than a screen confidently rendering wrong or missing data — this app shows
 * people their own mood, sleep and crisis resources. zod objects ignore
 * unknown keys, so a backend adding fields stays compatible; only a missing
 * or wrong-typed field fails.
 */
export function parseContract<T>(schema: ZodType<T>, value: unknown, context: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const summary = result.error.issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');

  // `__DEV__` is injected by Metro, not by Node — guard it so this path also
  // works under the test runner.
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[contract] ${context} did not match its schema — ${summary}`, result.error.issues);
  }

  // `kind: 'server'` so errorMapper renders the generic "something went wrong"
  // copy. The detail below is for logs, never for display.
  throw new AppError(`Unexpected response shape from ${context}`, 'server');
}

/** Same check for a list endpoint, reported with the failing index. */
export function parseContractList<T>(schema: ZodType<T>, values: unknown[], context: string): T[] {
  return values.map((value, index) => parseContract(schema, value, `${context}[${index}]`));
}
