import { storage, storageKeys } from '../../../core/storage/mmkv';
import { AppError } from '../../../core/errors';
import { config } from '../../../config';
import i18n from '../../../i18n';
import {
  therapistCatalog,
  filterProfessionals,
  buildDaySlots,
  getProfessional,
  DEFAULT_SESSION_MINUTES,
  type DirectoryFilter,
  type AvailabilitySlot,
} from '../models/professionalContent';
import type { Appointment, Professional, SessionMode } from '../../../types/models';

/**
 * [ASSUMPTION] No booking backend exists (product-definition.md Open
 * Question #2/#7) — the directory is a static catalogue and appointments
 * persist to MMKV, the same mock pattern as journal/mood/sleep. Nothing
 * here takes payment: `book()` records an intent to meet and returns a
 * `pending` appointment, because only a real provider can confirm one.
 * The exported signatures are the contract the screens depend on; swap the
 * bodies for `apiClient` calls once a backend exists.
 */

function fakeDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readAppointments(): Appointment[] {
  return storage.getJSON<Appointment[]>(storageKeys.mockAppointments) ?? [];
}

function writeAppointments(appointments: Appointment[]) {
  storage.setJSON(storageKeys.mockAppointments, appointments);
}

async function listProfessionals(filter: DirectoryFilter = {}): Promise<Professional[]> {
  await fakeDelay();
  const isArabic = i18n.language !== 'en';
  return filterProfessionals(therapistCatalog, filter, isArabic);
}

async function getProfessionalById(id: string): Promise<Professional> {
  await fakeDelay(150);
  const professional = getProfessional(id);
  if (!professional) {
    throw new AppError(i18n.t('professionals.notFound'), 'unknown', 404);
  }
  return professional;
}

/**
 * Slots for one day, with anything the user has already booked marked
 * unavailable so the same slot can't be double-booked locally.
 */
async function getAvailability(professionalId: string, isoDate: string): Promise<AvailabilitySlot[]> {
  await fakeDelay(200);
  const taken = new Set(
    readAppointments()
      .filter((a) => a.status !== 'cancelled')
      .map((a) => a.startsAt),
  );
  return buildDaySlots(professionalId, isoDate).map((slot) =>
    taken.has(slot.startsAt) ? { ...slot, available: false } : slot,
  );
}

async function listAppointments(): Promise<Appointment[]> {
  await fakeDelay(200);
  return [...readAppointments()].sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
}

async function getAppointment(id: string): Promise<Appointment> {
  await fakeDelay(120);
  const appointment = readAppointments().find((a) => a.id === id);
  if (!appointment) {
    throw new AppError(i18n.t('professionals.appointmentNotFound'), 'unknown', 404);
  }
  return appointment;
}

export interface BookingInput {
  professionalId: string;
  startsAt: string;
  mode: SessionMode;
  reason?: string;
}

async function book(input: BookingInput): Promise<Appointment> {
  await fakeDelay();
  const professional = getProfessional(input.professionalId);
  if (!professional) {
    throw new AppError(i18n.t('professionals.notFound'), 'unknown', 404);
  }
  const existing = readAppointments();
  if (existing.some((a) => a.startsAt === input.startsAt && a.status !== 'cancelled')) {
    throw new AppError(i18n.t('professionals.slotTakenError'), 'validation', 409);
  }
  const appointment: Appointment = {
    id: `appointment-${Date.now()}`,
    professionalId: input.professionalId,
    startsAt: input.startsAt,
    durationMinutes: DEFAULT_SESSION_MINUTES,
    mode: input.mode,
    // Only a real provider can confirm — the app never self-confirms a booking.
    status: 'pending',
    reason: input.reason?.trim() ? input.reason.trim() : undefined,
    createdAt: new Date().toISOString(),
  };
  writeAppointments([appointment, ...existing]);
  return appointment;
}

async function reschedule(id: string, startsAt: string): Promise<Appointment> {
  await fakeDelay();
  const appointments = readAppointments();
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new AppError(i18n.t('professionals.appointmentNotFound'), 'unknown', 404);
  }
  const updated: Appointment = { ...appointments[index], startsAt, status: 'pending' };
  appointments[index] = updated;
  writeAppointments(appointments);
  return updated;
}

async function cancel(id: string): Promise<Appointment> {
  await fakeDelay();
  const appointments = readAppointments();
  const index = appointments.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new AppError(i18n.t('professionals.appointmentNotFound'), 'unknown', 404);
  }
  const updated: Appointment = {
    ...appointments[index],
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
  };
  appointments[index] = updated;
  writeAppointments(appointments);
  return updated;
}

if (!config.useMockServices) {
  throw new AppError(
    'professionalService: config.useMockServices=false but no real implementation is wired up yet.',
    'unknown',
  );
}

export const professionalService = {
  listProfessionals,
  getProfessionalById,
  getAvailability,
  listAppointments,
  getAppointment,
  book,
  reschedule,
  cancel,
};
