import { useTranslation } from 'react-i18next';
import { splitDuration, to12hParts } from '../models/sleepContent';

/**
 * Bilingual duration/time formatting shared across every Sleep screen, so
 * the whole feature flips cleanly between Arabic and English (numbers +
 * localized h/m and AM/PM labels, never hardcoded strings — spec §9).
 */
export function useSleepFormat() {
  const { t } = useTranslation();

  /** e.g. "8h 15m" / "8س 15د". Omits the hours part when it's zero. */
  function formatDuration(totalMinutes: number): string {
    const { hours, minutes } = splitDuration(totalMinutes);
    if (hours <= 0) return t('sleep.minutesOnly', { minutes });
    return t('sleep.durationValue', { hours, minutes });
  }

  /** e.g. "12:25 AM" / "12:25 ص" from a 24h "HH:MM". */
  function formatTime(clock: string): string {
    const { hour, minute, isAm } = to12hParts(clock);
    const mm = String(minute).padStart(2, '0');
    return `${hour}:${mm} ${isAm ? t('sleep.am') : t('sleep.pm')}`;
  }

  return { formatDuration, formatTime };
}
