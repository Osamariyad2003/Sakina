import { AxiosError } from 'axios';
import i18n from '../../i18n';
import { AppError } from './AppError';

/**
 * Turns any thrown error into an AppError with a human-readable, translated
 * message. This is the ONLY place allowed to inspect HTTP status codes /
 * AxiosError internals — everything downstream (hooks, screens) only ever
 * sees `AppError.message` (spec §27: never expose HTTP 500 / AxiosError /
 * stack traces / backend exceptions to the user).
 */
export function mapError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof AxiosError) {
    if (!error.response) {
      return new AppError(i18n.t('errors.network'), 'network');
    }

    const status = error.response.status;

    if (status === 401) {
      return new AppError(i18n.t('errors.sessionExpired'), 'sessionExpired', status);
    }
    if (status === 422 || status === 400) {
      return new AppError(i18n.t('errors.validation'), 'validation', status);
    }
    if (status >= 500) {
      return new AppError(i18n.t('errors.server'), 'server', status);
    }
    return new AppError(i18n.t('errors.unknown'), 'unknown', status);
  }

  return new AppError(i18n.t('errors.unknown'), 'unknown');
}
