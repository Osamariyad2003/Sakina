import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Shared date/time formatting for the booking flow. Kept in one hook so the
 * directory, slot picker, confirmation and appointment cards can never drift
 * into different formats — the same reason `sleep/components/useSleepFormat`
 * exists for the Sleep feature.
 */
export function useAppointmentFormat() {
  const { i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en-GB' : 'ar-JO';

  const formatTime = useCallback(
    (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' }),
    [locale],
  );

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
    [locale],
  );

  const formatDateShort = useCallback(
    (iso: string) => new Date(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric' }),
    [locale],
  );

  const formatDateTime = useCallback(
    (iso: string) => `${formatDate(iso)} · ${formatTime(iso)}`,
    [formatDate, formatTime],
  );

  return { locale, formatTime, formatDate, formatDateShort, formatDateTime };
}
