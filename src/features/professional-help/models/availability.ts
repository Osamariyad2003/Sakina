import type { Appointment } from '../../../types/models';
import type { AvailabilitySlot } from './professionalContent';

/**
 * Which of a day's slots the user can still take.
 *
 * [ASSUMPTION] There is no availability endpoint (product-definition.md Open
 * Question #7): the grid itself is the app's illustrative one
 * (`buildDaySlots`), and this rule only removes the times *this user* has
 * already booked. A slot someone else holds is unknown to the app and is
 * rejected by the backend on booking with a 409.
 *
 * Cancelled appointments free their slot again. Extracted from
 * `professionalService`, where the same rule was written twice — once in the
 * offline branch and once in the online one (docs/architecture-review.md §6.1).
 */
export function markTakenSlots(
  slots: AvailabilitySlot[],
  appointments: Appointment[],
  professionalId: string,
): AvailabilitySlot[] {
  const taken = new Set(
    appointments
      .filter((appointment) => appointment.professionalId === professionalId && appointment.status !== 'cancelled')
      .map((appointment) => appointment.startsAt),
  );

  return slots.map((slot) => (taken.has(slot.startsAt) ? { ...slot, available: false } : slot));
}

/** True when the user already holds a live booking at that exact time. */
export function hasClashingAppointment(appointments: Appointment[], startsAt: string): boolean {
  return appointments.some(
    (appointment) => appointment.startsAt === startsAt && appointment.status !== 'cancelled',
  );
}
