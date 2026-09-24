import { AppError } from '../../../core/errors/AppError';
import {
  buildDaySlots,
  filterProfessionals,
  type AvailabilitySlot,
  type DirectoryFilter,
} from '../models/professionalContent';
import { hasClashingAppointment, markTakenSlots } from '../models/availability';
import type { Appointment, Professional } from '../../../types/models';
import type { AppointmentRepository, BookingInput, ProfessionalDirectory } from './professionalRepository';

/**
 * Professional-help use cases over `ProfessionalDirectory` and
 * `AppointmentRepository`.
 *
 * Three things moved out of here (docs/architecture-review.md §2.3, §6.1, §6.5):
 * - transport/persistence → `httpProfessionalRepository` / `localProfessionalRepository`;
 * - the availability rule → `models/availability.ts`, where it is written once
 *   instead of once per branch;
 * - i18n → the presentation layer. Errors now carry a `messageKey` and screens
 *   render them with `errorText(error, t)`. A module that does not render
 *   cannot know the user's language, and importing i18n here also dragged
 *   React Native into every test that touched this file.
 *
 * `search` needs to know which language's specialty labels to match, so the
 * caller passes `isArabic` explicitly rather than this module reading it from
 * a global.
 */

let directory: ProfessionalDirectory | null = null;
let appointments: AppointmentRepository | null = null;

/** Wires implementations. Returns a restore function, so tests can undo it. */
export function setProfessionalRepositories(next: {
  directory: ProfessionalDirectory;
  appointments: AppointmentRepository;
}): () => void {
  const previous = { directory, appointments };
  directory = next.directory;
  appointments = next.appointments;
  return () => {
    directory = previous.directory;
    appointments = previous.appointments;
  };
}

function activeDirectory(): ProfessionalDirectory {
  if (!directory) throw new Error('Professional directory has not been wired — call composeRepositories().');
  return directory;
}

function activeAppointments(): AppointmentRepository {
  if (!appointments) throw new Error('Appointment repository has not been wired — call composeRepositories().');
  return appointments;
}

async function listProfessionals(filter: DirectoryFilter = {}, isArabic = true): Promise<Professional[]> {
  return filterProfessionals(await activeDirectory().list(), filter, isArabic);
}

async function getProfessionalById(id: string): Promise<Professional> {
  const professional = await activeDirectory().findById(id);
  if (!professional) throw AppError.withKey('professionals.notFound', 'unknown', 404);
  return professional;
}

/**
 * Slots for one day, with the times this user already holds marked
 * unavailable. See `models/availability.ts` for what this can and cannot know.
 */
async function getAvailability(professionalId: string, isoDate: string): Promise<AvailabilitySlot[]> {
  const booked = await activeAppointments().list();
  return markTakenSlots(buildDaySlots(professionalId, isoDate), booked, professionalId);
}

async function listAppointments(): Promise<Appointment[]> {
  return activeAppointments().list();
}

async function getAppointment(id: string): Promise<Appointment> {
  const appointment = await activeAppointments().findById(id);
  if (!appointment) throw AppError.withKey('professionals.appointmentNotFound', 'unknown', 404);
  return appointment;
}

/**
 * Books an intent to meet. The clash check is a courtesy for the user's own
 * diary; a slot held by someone else is invisible to the app and comes back
 * from the backend as a 409, which is translated to the same message.
 */
async function book(input: BookingInput): Promise<Appointment> {
  const professional = await activeDirectory().findById(input.professionalId);
  if (!professional) throw AppError.withKey('professionals.notFound', 'unknown', 404);

  const existing = await activeAppointments().list();
  if (hasClashingAppointment(existing, input.startsAt)) {
    throw AppError.withKey('professionals.slotTakenError', 'validation', 409);
  }

  try {
    return await activeAppointments().create(input);
  } catch (error) {
    throw asBookingError(error);
  }
}

async function reschedule(id: string, startsAt: string): Promise<Appointment> {
  try {
    return await activeAppointments().reschedule(id, startsAt);
  } catch (error) {
    throw asBookingError(error);
  }
}

async function cancel(id: string): Promise<Appointment> {
  try {
    return await activeAppointments().cancel(id);
  } catch (error) {
    throw asBookingError(error);
  }
}

/** Gives 409/404 from either implementation the specific message key. */
function asBookingError(error: unknown): unknown {
  if (error instanceof AppError && error.status === 409) {
    return AppError.withKey('professionals.slotTakenError', 'validation', 409);
  }
  if (error instanceof AppError && error.status === 404) {
    return AppError.withKey('professionals.appointmentNotFound', 'unknown', 404);
  }
  return error;
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

export type { BookingInput } from './professionalRepository';
