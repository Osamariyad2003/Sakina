/**
 * In-app notification inbox + reminder preferences (SH Freud reference
 * section "Notifications & Reminders").
 *
 * Two things are deliberately separate here:
 * - The **inbox** is app-generated, rule-based content the user can read in
 *   the app. It needs no OS permission and works offline.
 * - **Reminders** are the user's schedule preferences. Actually firing them
 *   while the app is closed needs an OS-level scheduler; `notificationScheduler
 *   .ts` is the single seam for that. See ASSUMPTIONS.md.
 *
 * Nothing here nags: every reminder is opt-in, defaults to off except the
 * gentle daily check-in, and quiet hours are honoured by the scheduler.
 */

export type NotificationCategory = 'reminder' | 'appointment' | 'community' | 'badge' | 'safety';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  createdAt: string;
  readAt?: string;
  /**
   * Where tapping the notification goes. Kept as a small tagged union rather
   * than a route name + params blob so the inbox can't be made to navigate
   * somewhere arbitrary by stored data.
   */
  target?: NotificationTarget;
}

export type NotificationTarget =
  | { kind: 'moodCheckIn' }
  | { kind: 'journal' }
  | { kind: 'wellness' }
  | { kind: 'appointments' }
  | { kind: 'appointment'; appointmentId: string }
  | { kind: 'community' }
  | { kind: 'badges' }
  | { kind: 'safety' };

export const categoryMeta: Record<
  NotificationCategory,
  { icon: 'notifications-outline' | 'calendar-outline' | 'people-outline' | 'ribbon-outline' | 'shield-outline' }
> = {
  reminder: { icon: 'notifications-outline' },
  appointment: { icon: 'calendar-outline' },
  community: { icon: 'people-outline' },
  badge: { icon: 'ribbon-outline' },
  safety: { icon: 'shield-outline' },
};

export type ReminderKind = 'moodCheckIn' | 'journal' | 'mindfulMinutes' | 'sleepWindDown' | 'appointment';

export interface ReminderPreference {
  kind: ReminderKind;
  enabled: boolean;
  /** Local 24h time, "HH:MM". Ignored for `appointment` (relative to the session). */
  time: string;
  /** Days of week the reminder runs, 0 = Sunday. Empty means every day. */
  days: number[];
}

export interface ReminderPreferences {
  reminders: ReminderPreference[];
  /** Nothing is delivered inside this window, whatever the per-reminder time says. */
  quietHours: { enabled: boolean; from: string; to: string };
}

export const reminderMeta: Record<
  ReminderKind,
  { icon: 'happy-outline' | 'book-outline' | 'leaf-outline' | 'moon-outline' | 'calendar-outline' }
> = {
  moodCheckIn: { icon: 'happy-outline' },
  journal: { icon: 'book-outline' },
  mindfulMinutes: { icon: 'leaf-outline' },
  sleepWindDown: { icon: 'moon-outline' },
  appointment: { icon: 'calendar-outline' },
};

/**
 * Defaults: one gentle evening check-in on, everything else off. An app about
 * calm should not arrive on day one with five daily alarms enabled.
 */
export const defaultReminderPreferences: ReminderPreferences = {
  reminders: [
    { kind: 'moodCheckIn', enabled: true, time: '20:00', days: [] },
    { kind: 'journal', enabled: false, time: '21:00', days: [] },
    { kind: 'mindfulMinutes', enabled: false, time: '13:00', days: [] },
    { kind: 'sleepWindDown', enabled: false, time: '22:30', days: [] },
    { kind: 'appointment', enabled: true, time: '09:00', days: [] },
  ],
  quietHours: { enabled: true, from: '23:00', to: '07:00' },
};

/** "HH:MM" → minutes since midnight. Returns null for anything malformed. */
export function parseTime(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** True when `time` falls inside the quiet-hours window (which may wrap midnight). */
export function isWithinQuietHours(time: string, quietHours: ReminderPreferences['quietHours']): boolean {
  if (!quietHours.enabled) return false;
  const at = parseTime(time);
  const from = parseTime(quietHours.from);
  const to = parseTime(quietHours.to);
  if (at == null || from == null || to == null) return false;
  return from <= to ? at >= from && at < to : at >= from || at < to;
}

/** The 30-minute grid the time picker offers — avoids a native date-picker dependency. */
export function timeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      options.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }
  return options;
}
