import { afterEach, describe, expect, it } from 'vitest';
import { AppError } from '../../../core/errors/AppError';
import type { Appointment, Professional } from '../../../types/models';
import { professionalService, setProfessionalRepositories } from './professionalService';
import type { AppointmentRepository, BookingInput, ProfessionalDirectory } from './professionalRepository';

/**
 * Booking rules, exercised without HTTP or MMKV — the point of the repository
 * seam (docs/architecture-review.md §2.3). Every error assertion checks the
 * `messageKey`, not a translated string: the use cases no longer know the
 * user's language.
 */

const professional = (id: string): Professional =>
  ({
    id,
    fullName: 'Dr Test',
    titleAr: '',
    titleEn: '',
    specialtyIds: [],
    languages: ['ar'],
    yearsExperience: 1,
    sessionModes: ['video'],
    currency: 'JOD',
    reviewCount: 0,
    verified: true,
  }) as Professional;

const appointment = (id: string, startsAt: string, status: Appointment['status'] = 'pending'): Appointment => ({
  id,
  professionalId: 'p1',
  startsAt,
  durationMinutes: 50,
  mode: 'video',
  status,
  createdAt: '2026-09-01T00:00:00.000Z',
});

function fakes(options: { professionals?: Professional[]; appointments?: Appointment[]; createFails?: AppError } = {}) {
  const stored = [...(options.appointments ?? [])];
  const created: BookingInput[] = [];

  const directory: ProfessionalDirectory = {
    async list() {
      return options.professionals ?? [professional('p1')];
    },
    async findById(id) {
      return (options.professionals ?? [professional('p1')]).find((p) => p.id === id) ?? null;
    },
  };

  const appointments: AppointmentRepository = {
    async list() {
      return stored;
    },
    async findById(id) {
      return stored.find((a) => a.id === id) ?? null;
    },
    async create(input) {
      if (options.createFails) throw options.createFails;
      created.push(input);
      return appointment('new', input.startsAt);
    },
    async reschedule(id, startsAt) {
      const found = stored.find((a) => a.id === id);
      if (!found) throw new AppError('not found', 'unknown', 404);
      return { ...found, startsAt, status: 'pending' };
    },
    async cancel(id) {
      const found = stored.find((a) => a.id === id);
      if (!found) throw new AppError('not found', 'unknown', 404);
      return { ...found, status: 'cancelled', cancelledAt: '2026-09-02T00:00:00.000Z' };
    },
  };

  return { directory, appointments, created };
}

let restore: (() => void) | undefined;
afterEach(() => {
  restore?.();
  restore = undefined;
});

describe('booking', () => {
  it('books when the slot is free', async () => {
    const { directory, appointments, created } = fakes();
    restore = setProfessionalRepositories({ directory, appointments });

    const booked = await professionalService.book({
      professionalId: 'p1',
      startsAt: '2026-10-01T09:00:00.000Z',
      mode: 'video',
    });

    expect(booked.id).toBe('new');
    expect(created).toHaveLength(1);
  });

  it('refuses a slot the user already holds, without calling the repository', async () => {
    const { directory, appointments, created } = fakes({
      appointments: [appointment('a1', '2026-10-01T09:00:00.000Z')],
    });
    restore = setProfessionalRepositories({ directory, appointments });

    await expect(
      professionalService.book({ professionalId: 'p1', startsAt: '2026-10-01T09:00:00.000Z', mode: 'video' }),
    ).rejects.toMatchObject({ messageKey: 'professionals.slotTakenError', status: 409 });

    expect(created).toHaveLength(0);
  });

  it('allows rebooking a time the user previously cancelled', async () => {
    const { directory, appointments, created } = fakes({
      appointments: [appointment('a1', '2026-10-01T09:00:00.000Z', 'cancelled')],
    });
    restore = setProfessionalRepositories({ directory, appointments });

    await professionalService.book({ professionalId: 'p1', startsAt: '2026-10-01T09:00:00.000Z', mode: 'video' });

    expect(created).toHaveLength(1);
  });

  it('reports an unknown professional rather than booking with nobody', async () => {
    const { directory, appointments } = fakes({ professionals: [] });
    restore = setProfessionalRepositories({ directory, appointments });

    await expect(
      professionalService.book({ professionalId: 'ghost', startsAt: '2026-10-01T09:00:00.000Z', mode: 'video' }),
    ).rejects.toMatchObject({ messageKey: 'professionals.notFound', status: 404 });
  });

  it("translates the backend's 409 into the slot-taken key", async () => {
    const { directory, appointments } = fakes({ createFails: new AppError('conflict', 'validation', 409) });
    restore = setProfessionalRepositories({ directory, appointments });

    await expect(
      professionalService.book({ professionalId: 'p1', startsAt: '2026-10-01T09:00:00.000Z', mode: 'video' }),
    ).rejects.toMatchObject({ messageKey: 'professionals.slotTakenError' });
  });
});

describe('availability', () => {
  // `buildDaySlots` opens only part of the grid by design (illustrative
  // availability, and never a slot in the past), so this asserts the delta the
  // rule is responsible for rather than the shape of the generated grid.
  it("marks the user's own booked times unavailable", async () => {
    const day = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const { directory, appointments } = fakes({ appointments: [] });
    restore = setProfessionalRepositories({ directory, appointments });

    const before = await professionalService.getAvailability('p1', day);
    const openSlot = before.find((slot) => slot.available);
    expect(openSlot).toBeDefined();

    restore();
    restore = setProfessionalRepositories(fakes({ appointments: [appointment('a1', openSlot!.startsAt)] }));

    const after = await professionalService.getAvailability('p1', day);
    expect(after.find((slot) => slot.startsAt === openSlot!.startsAt)?.available).toBe(false);
    // Everything else keeps whatever the grid said.
    expect(after.filter((slot) => slot.available).length).toBe(
      before.filter((slot) => slot.available).length - 1,
    );
  });

  it('frees the slot again once that appointment is cancelled', async () => {
    const day = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    restore = setProfessionalRepositories(fakes({ appointments: [] }));
    const open = (await professionalService.getAvailability('p1', day)).find((slot) => slot.available)!;

    restore();
    restore = setProfessionalRepositories(
      fakes({ appointments: [appointment('a1', open.startsAt, 'cancelled')] }),
    );

    const after = await professionalService.getAvailability('p1', day);
    expect(after.find((slot) => slot.startsAt === open.startsAt)?.available).toBe(true);
  });
});

describe('lookups', () => {
  it('reports a missing appointment with its key', async () => {
    const { directory, appointments } = fakes({ appointments: [] });
    restore = setProfessionalRepositories({ directory, appointments });

    await expect(professionalService.getAppointment('nope')).rejects.toMatchObject({
      messageKey: 'professionals.appointmentNotFound',
      status: 404,
    });
  });

  it('filters the directory by verification', async () => {
    const unverified = { ...professional('p2'), verified: false };
    const { directory, appointments } = fakes({ professionals: [professional('p1'), unverified] });
    restore = setProfessionalRepositories({ directory, appointments });

    const all = await professionalService.listProfessionals({});
    const verifiedOnly = await professionalService.listProfessionals({ verifiedOnly: true });

    expect(all).toHaveLength(2);
    expect(verifiedOnly.map((p) => p.id)).toEqual(['p1']);
  });
});
