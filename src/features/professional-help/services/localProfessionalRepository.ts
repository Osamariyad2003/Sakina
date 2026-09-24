import { storage, storageKeys } from '../../../core/storage/mmkv';
import { simulateLatency } from '../../../core/async/simulateLatency';
import { AppError } from '../../../core/errors/AppError';
import { therapistCatalog, getProfessional, DEFAULT_SESSION_MINUTES } from '../models/professionalContent';
import type { Appointment } from '../../../types/models';
import type { AppointmentRepository, BookingInput, ProfessionalDirectory } from './professionalRepository';

/**
 * Offline implementations: a static catalogue for the directory, MMKV for
 * appointments.
 *
 * [ASSUMPTION] No booking backend exists (product-definition.md Open
 * Question #2/#7). Nothing here takes payment — a booking records an intent
 * to meet and stays `pending`, because only a real provider can confirm one.
 */


function readAppointments(): Appointment[] {
  return storage.getJSON<Appointment[]>(storageKeys.mockAppointments) ?? [];
}

function writeAppointments(appointments: Appointment[]) {
  storage.setJSON(storageKeys.mockAppointments, appointments);
}

export const localProfessionalDirectory: ProfessionalDirectory = {
  async list() {
    await simulateLatency();
    return therapistCatalog;
  },

  async findById(id: string) {
    await simulateLatency(150);
    return getProfessional(id) ?? null;
  },
};

export const localAppointmentRepository: AppointmentRepository = {
  async list() {
    await simulateLatency(200);
    return [...readAppointments()].sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
  },

  async findById(id: string) {
    await simulateLatency(120);
    return readAppointments().find((appointment) => appointment.id === id) ?? null;
  },

  async create(input: BookingInput) {
    await simulateLatency();
    const appointment: Appointment = {
      id: `appointment-${Date.now()}`,
      professionalId: input.professionalId,
      startsAt: input.startsAt,
      durationMinutes: DEFAULT_SESSION_MINUTES,
      mode: input.mode,
      // Only a real provider can confirm — the app never self-confirms.
      status: 'pending',
      reason: input.reason?.trim() ? input.reason.trim() : undefined,
      createdAt: new Date().toISOString(),
    };
    writeAppointments([appointment, ...readAppointments()]);
    return appointment;
  },

  async reschedule(id: string, startsAt: string) {
    await simulateLatency();
    const appointments = readAppointments();
    const index = appointments.findIndex((appointment) => appointment.id === id);
    // Mirrors the backend's 404 so the use case handles one shape either way.
    if (index === -1) throw new AppError('appointment not found', 'unknown', 404);

    const updated: Appointment = { ...appointments[index], startsAt, status: 'pending' };
    appointments[index] = updated;
    writeAppointments(appointments);
    return updated;
  },

  async cancel(id: string) {
    await simulateLatency();
    const appointments = readAppointments();
    const index = appointments.findIndex((appointment) => appointment.id === id);
    if (index === -1) throw new AppError('appointment not found', 'unknown', 404);

    const updated: Appointment = {
      ...appointments[index],
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    };
    appointments[index] = updated;
    writeAppointments(appointments);
    return updated;
  },
};
