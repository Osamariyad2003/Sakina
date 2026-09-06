import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { config } from '../../../config';
import { moodService } from '../../mood/services/moodService';
import { journalService } from '../../journal/services/journalService';
import { professionalService } from '../../professional-help/services/professionalService';
import { getProfessional } from '../../professional-help/models/professionalContent';
import { notificationScheduler } from './notificationScheduler';
import {
  defaultReminderPreferences,
  type AppNotification,
  type ReminderPreferences,
  type ReminderPreference,
} from '../models/notificationContent';

/**
 * [ASSUMPTION] No backend exists (product-definition.md Open Question #4) —
 * the inbox persists to MMKV, same mock pattern as journal/mood/appointments.
 *
 * Inbox entries are **derived, not pushed**: `refresh()` looks at the user's
 * own real data (last check-in, upcoming appointments) and generates at most
 * one entry per rule per day, de-duplicated by a deterministic id. That keeps
 * the inbox honest — every item corresponds to something that actually
 * happened — and means it can never spam, however often `refresh()` runs.
 */

function fakeDelay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readInbox(): AppNotification[] {
  return storage.getJSON<AppNotification[]>(storageKeys.mockNotifications) ?? [];
}

function writeInbox(notifications: AppNotification[]) {
  storage.setJSON(storageKeys.mockNotifications, notifications);
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

async function getPreferences(): Promise<ReminderPreferences> {
  const stored = storage.getJSON<ReminderPreferences>(storageKeys.reminderPreferences);
  if (!stored) return defaultReminderPreferences;
  // Merge so a reminder kind added in a later release appears with its default
  // rather than silently missing from an older stored blob.
  const byKind = new Map(stored.reminders?.map((r) => [r.kind, r]) ?? []);
  return {
    reminders: defaultReminderPreferences.reminders.map((fallback) => byKind.get(fallback.kind) ?? fallback),
    quietHours: stored.quietHours ?? defaultReminderPreferences.quietHours,
  };
}

async function savePreferences(preferences: ReminderPreferences): Promise<ReminderPreferences> {
  storage.setJSON(storageKeys.reminderPreferences, preferences);
  // The one call-site that keeps the OS schedule in step with the preferences.
  await notificationScheduler.sync(preferences);
  return preferences;
}

async function setReminder(kind: ReminderPreference['kind'], patch: Partial<ReminderPreference>): Promise<ReminderPreferences> {
  const preferences = await getPreferences();
  const next: ReminderPreferences = {
    ...preferences,
    reminders: preferences.reminders.map((r) => (r.kind === kind ? { ...r, ...patch } : r)),
  };
  return savePreferences(next);
}

async function setQuietHours(quietHours: ReminderPreferences['quietHours']): Promise<ReminderPreferences> {
  const preferences = await getPreferences();
  return savePreferences({ ...preferences, quietHours });
}

/** Adds a notification unless one with the same deterministic id already exists. */
function addOnce(existing: AppNotification[], candidate: AppNotification): AppNotification[] {
  if (existing.some((n) => n.id === candidate.id)) return existing;
  return [candidate, ...existing];
}

/**
 * Regenerates derived inbox entries from the user's real data. Safe to call on
 * every Notifications-screen focus: ids are deterministic, so nothing is ever
 * duplicated.
 */
async function refresh(): Promise<AppNotification[]> {
  await fakeDelay();
  const preferences = await getPreferences();
  const today = dayKey();
  const now = new Date();
  let inbox = readInbox();

  const [moodEntries, journalEntries, appointments] = await Promise.all([
    moodService.listEntries(),
    journalService.list(),
    config.featureFlags.professionalBooking ? professionalService.listAppointments() : Promise.resolve([]),
  ]);

  const checkInReminder = preferences.reminders.find((r) => r.kind === 'moodCheckIn');
  const loggedToday = moodEntries.some((e) => e.createdAt.slice(0, 10) === today);
  if (checkInReminder?.enabled && !loggedToday) {
    inbox = addOnce(inbox, {
      id: `reminder-mood-${today}`,
      category: 'reminder',
      titleAr: 'كيف كان يومك؟',
      titleEn: 'How was your day?',
      bodyAr: 'خذ دقيقة تسجل فيها مزاجك — بدون ضغط، ومتى ما ناسبك.',
      bodyEn: 'Take a minute to log how you feel — no pressure, whenever suits you.',
      createdAt: now.toISOString(),
      target: { kind: 'moodCheckIn' },
    });
  }

  const journalReminder = preferences.reminders.find((r) => r.kind === 'journal');
  const wroteToday = journalEntries.some((e) => e.createdAt.slice(0, 10) === today);
  if (journalReminder?.enabled && !wroteToday) {
    inbox = addOnce(inbox, {
      id: `reminder-journal-${today}`,
      category: 'reminder',
      titleAr: 'مساحة للكتابة',
      titleEn: 'A space to write',
      bodyAr: 'سطر واحد يكفي. اكتب اللي براسك بدون ترتيب.',
      bodyEn: 'One line is enough. Write whatever is on your mind.',
      createdAt: now.toISOString(),
      target: { kind: 'journal' },
    });
  }

  const appointmentReminder = preferences.reminders.find((r) => r.kind === 'appointment');
  if (appointmentReminder?.enabled) {
    for (const appointment of appointments) {
      if (appointment.status === 'cancelled' || appointment.status === 'completed') continue;
      const startsAt = new Date(appointment.startsAt);
      const hoursAway = (startsAt.getTime() - now.getTime()) / 3600000;
      if (hoursAway <= 0 || hoursAway > 24) continue;
      const professional = getProfessional(appointment.professionalId);
      inbox = addOnce(inbox, {
        id: `appointment-${appointment.id}-${dayKey(startsAt)}`,
        category: 'appointment',
        titleAr: 'جلستك قريبة',
        titleEn: 'Your session is coming up',
        bodyAr: `موعدك مع ${professional?.fullName ?? 'المختص'} خلال أقل من ٢٤ ساعة.`,
        bodyEn: `Your appointment with ${professional?.fullName ?? 'your professional'} is in under 24 hours.`,
        createdAt: now.toISOString(),
        target: { kind: 'appointment', appointmentId: appointment.id },
      });
    }
  }

  writeInbox(inbox);
  return sortInbox(inbox);
}

function sortInbox(inbox: AppNotification[]): AppNotification[] {
  return [...inbox].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function list(): Promise<AppNotification[]> {
  await fakeDelay(120);
  return sortInbox(readInbox());
}

async function unreadCount(): Promise<number> {
  return readInbox().filter((n) => !n.readAt).length;
}

async function markRead(id: string): Promise<void> {
  const now = new Date().toISOString();
  writeInbox(readInbox().map((n) => (n.id === id && !n.readAt ? { ...n, readAt: now } : n)));
}

async function markAllRead(): Promise<void> {
  const now = new Date().toISOString();
  writeInbox(readInbox().map((n) => (n.readAt ? n : { ...n, readAt: now })));
}

async function clearAll(): Promise<void> {
  writeInbox([]);
}

/**
 * Posts a notification the app itself raised (a badge just unlocked, a
 * booking changed). Idempotent on `id`, same as the derived entries.
 */
async function push(notification: AppNotification): Promise<void> {
  writeInbox(addOnce(readInbox(), notification));
}

if (!config.useMockServices) {
  throw new AppError(
    'notificationService: config.useMockServices=false but no real implementation is wired up yet.',
    'unknown',
  );
}

export const notificationService = {
  list,
  refresh,
  unreadCount,
  markRead,
  markAllRead,
  clearAll,
  push,
  getPreferences,
  savePreferences,
  setReminder,
  setQuietHours,
};
