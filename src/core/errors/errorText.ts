import { AppError } from './AppError';

/** The `t` from `useTranslation()` — typed locally so this module imports no i18n. */
type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Renders an error for a user: translates `messageKey` when the thrower set
 * one, otherwise falls back to the message it already carries (errors mapped
 * in `errorMapper` are translated there).
 *
 * Deliberately takes `t` as an argument rather than importing i18n, so the
 * layers below presentation can throw errors without depending on it.
 */
export function errorText(error: unknown, t: Translate): string {
  if (error instanceof AppError) {
    return error.messageKey ? t(error.messageKey) : error.message;
  }
  return t('errors.unknown');
}
