import type { Appointment, Professional, SessionMode } from '../../../types/models';

/**
 * The two seams the professional-help feature depends on.
 *
 * They are split because they have genuinely different lifetimes and owners:
 * the directory is read-only reference data (a static catalogue offline, a
 * verified list from the backend online), while appointments are user-owned
 * records that are created and changed. Merging them would force every fake
 * in a test to implement both.
 *
 * Neither interface holds business rules: no slot generation, no conflict
 * policy, no filtering by locale. Those live in `models/` and in the use
 * cases (docs/architecture-review.md §2.3, §6.1).
 */

export interface ProfessionalDirectory {
  /** Every professional this build can show; filtering happens in the use case. */
  list(): Promise<Professional[]>;
  findById(id: string): Promise<Professional | null>;
}

export interface AppointmentRepository {
  list(): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  create(input: BookingInput): Promise<Appointment>;
  reschedule(id: string, startsAt: string): Promise<Appointment>;
  cancel(id: string): Promise<Appointment>;
}

export interface BookingInput {
  professionalId: string;
  startsAt: string;
  mode: SessionMode;
  reason?: string;
}
