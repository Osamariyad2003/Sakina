import { isWithinQuietHours, type ReminderPreference, type ReminderPreferences } from '../models/notificationContent';

/**
 * [ASSUMPTION] OS-level delivery seam.
 *
 * `expo-notifications` is NOT a dependency of this project, and adding it
 * requires a native rebuild plus the permission/entitlement work that goes
 * with it — so reminders currently exist as real, persisted user preferences
 * that the in-app inbox honours, and nothing is delivered while the app is
 * closed. This module is the one place that changes when that dependency
 * lands: `sync()` is already called on every preference write, so wiring it
 * up is a body change here and nothing else.
 *
 * See ASSUMPTIONS.md. Deliberately dependency-free so it can be imported
 * from anywhere without pulling native modules into the bundle.
 */

export interface ScheduledReminder {
  kind: ReminderPreference['kind'];
  /** Local 24h "HH:MM". */
  time: string;
  /** 0 = Sunday. Empty means every day. */
  days: number[];
}

/**
 * The reminders that *should* be scheduled with the OS, after applying quiet
 * hours. Pure — exported separately from `sync` so the settings screen can
 * show the user exactly what would fire, and so it stays testable.
 */
export function resolveSchedule(preferences: ReminderPreferences): ScheduledReminder[] {
  return preferences.reminders
    .filter((reminder) => reminder.enabled)
    // `appointment` is relative to a booked session, not a wall-clock time.
    .filter((reminder) => reminder.kind !== 'appointment')
    .filter((reminder) => !isWithinQuietHours(reminder.time, preferences.quietHours))
    .map(({ kind, time, days }) => ({ kind, time, days }));
}

/** A reminder the user enabled that quiet hours will silently swallow. */
export function suppressedByQuietHours(preferences: ReminderPreferences): ReminderPreference[] {
  return preferences.reminders.filter(
    (reminder) =>
      reminder.enabled && reminder.kind !== 'appointment' && isWithinQuietHours(reminder.time, preferences.quietHours),
  );
}

/**
 * Hands the resolved schedule to the OS. A no-op today; the resolved schedule
 * is returned so callers (and future tests) can assert what would have been
 * scheduled.
 */
export async function sync(preferences: ReminderPreferences): Promise<ScheduledReminder[]> {
  const schedule = resolveSchedule(preferences);
  // Replace with expo-notifications' cancelAllScheduledNotificationsAsync +
  // scheduleNotificationAsync per entry once that dependency is added.
  return schedule;
}

export const notificationScheduler = { resolveSchedule, suppressedByQuietHours, sync };
