import { AppError } from '../../../core/errors/AppError';
import { AppointmentSchema, ProfessionalSchema } from '../../../types/models';
import { parseContract } from '../../../core/api';
import { apiClient, fetchAllPages, unwrap, type ApiSuccess } from '../../../core/api';
import { DEFAULT_SESSION_MINUTES } from '../models/professionalContent';
import type { Appointment, ContentImage, Professional, SessionMode } from '../../../types/models';
import type { AppointmentRepository, BookingInput, ProfessionalDirectory } from './professionalRepository';

/**
 * The two repositories over the real backend.
 *
 * /professionals (GET list · GET /:id, verified-only by default) and
 * /appointments (POST · GET · GET /:id · PATCH /:id/reschedule · POST /:id/cancel).
 * Notes on the mapping:
 *   - the backend has one `title`/`biography`, used for both Arabic and English
 *   - session modes: phone ⇄ audio, inPerson ⇄ in_person; the backend's
 *     `chat` mode has no app equivalent and is dropped
 *   - `startsAt` ⇄ `scheduledAt`, `reason` ⇄ `notes`, `durationMinutes` ⇄ `durationMin`
 *
 * Transport and mapping only. Not-found is reported as `null` rather than an
 * error, so the use case decides what a missing record means; other failures
 * propagate as the AppError `apiClient` already mapped.
 */

interface ApiProfessional {
  id: string;
  fullName: string;
  title?: string | null;
  biography?: string | null;
  /** Deprecated backend column, still sent during the image migration. */
  photoUrl?: string | null;
  imageUrl?: string | null;
  imageThumbUrl?: string | null;
  imageBlurHash?: string | null;
  imageAltAr?: string | null;
  imageAltEn?: string | null;
  imageSource?: 'unsplash' | 'upload' | null;
  imageAuthorName?: string | null;
  imageAuthorUrl?: string | null;
  experienceYears?: number | null;
  city?: string | null;
  feeAmount?: string | number | null;
  feeCurrency?: string | null;
  ratingAverage?: string | number | null;
  reviewCount: number;
  licenceNumber?: string | null;
  isVerified: boolean;
  specialties: { specialty: string }[];
  languages: { language: 'ar' | 'en' }[];
  sessionModes: { mode: string }[];
}

interface ApiAppointment {
  id: string;
  professionalId: string;
  scheduledAt: string;
  durationMin: number;
  mode: string;
  status: Appointment['status'];
  notes?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
}

const modeFromApi: Record<string, SessionMode | undefined> = { video: 'video', audio: 'phone', in_person: 'inPerson' };
const modeToApi: Record<SessionMode, string> = { video: 'video', phone: 'audio', inPerson: 'in_person' };

/**
 * Backend rows carry the image as flat `image*` columns; older rows only have
 * the deprecated `photoUrl`. Returns undefined when there's no image at all so
 * callers can fall back to initials.
 */
function toContentImage(p: ApiProfessional): ContentImage | undefined {
  const url = p.imageUrl ?? p.photoUrl ?? undefined;
  if (!url) return undefined;
  return {
    url,
    thumbUrl: p.imageThumbUrl ?? undefined,
    blurHash: p.imageBlurHash ?? undefined,
    altAr: p.imageAltAr ?? undefined,
    altEn: p.imageAltEn ?? undefined,
    source: p.imageSource ?? undefined,
    authorName: p.imageAuthorName ?? undefined,
    authorUrl: p.imageAuthorUrl ?? undefined,
  };
}

function fromApiProfessional(p: ApiProfessional): Professional {
  const sessionModes = p.sessionModes.map((m) => modeFromApi[m.mode]).filter((m): m is SessionMode => Boolean(m));
  const rating = p.ratingAverage !== null && p.ratingAverage !== undefined ? Number(p.ratingAverage) : 0;
  const mapped = {
    id: p.id,
    fullName: p.fullName,
    titleAr: p.title ?? '',
    titleEn: p.title ?? '',
    bioAr: p.biography ?? undefined,
    bioEn: p.biography ?? undefined,
    photoUrl: p.photoUrl ?? undefined,
    image: toContentImage(p),
    specialtyIds: p.specialties.map((s) => s.specialty),
    languages: p.languages.length ? p.languages.map((l) => l.language) : ['ar'],
    yearsExperience: p.experienceYears ?? 0,
    sessionModes: sessionModes.length ? sessionModes : ['video'],
    city: p.city ?? undefined,
    feePerSession: p.feeAmount !== null && p.feeAmount !== undefined ? Number(p.feeAmount) : undefined,
    currency: p.feeCurrency ?? 'SAR',
    rating: p.reviewCount > 0 && rating > 0 ? rating : undefined,
    reviewCount: p.reviewCount,
    verified: p.isVerified,
    licenceNumber: p.licenceNumber ?? undefined,
  };

  return parseContract(ProfessionalSchema, mapped, 'GET /professionals');
}

function fromApiAppointment(a: ApiAppointment): Appointment {
  const mapped = {
    id: a.id,
    professionalId: a.professionalId,
    startsAt: a.scheduledAt,
    durationMinutes: a.durationMin,
    mode: modeFromApi[a.mode] ?? 'video',
    status: a.status,
    reason: a.notes ?? undefined,
    createdAt: a.createdAt,
    cancelledAt: a.cancelledAt ?? undefined,
  };

  return parseContract(AppointmentSchema, mapped, 'GET /appointments');
}

const notFoundAsNull = async <T>(load: () => Promise<T>): Promise<T | null> => {
  try {
    return await load();
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return null;
    throw error;
  }
};

export const httpProfessionalDirectory: ProfessionalDirectory = {
  async list() {
    return (await fetchAllPages<ApiProfessional>('/professionals')).map(fromApiProfessional);
  },

  async findById(id: string) {
    return notFoundAsNull(async () =>
      fromApiProfessional(unwrap(await apiClient.get<ApiSuccess<ApiProfessional>>(`/professionals/${id}`))),
    );
  },
};

export const httpAppointmentRepository: AppointmentRepository = {
  async list() {
    const appointments = (await fetchAllPages<ApiAppointment>('/appointments')).map(fromApiAppointment);
    return appointments.sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
  },

  async findById(id: string) {
    return notFoundAsNull(async () =>
      fromApiAppointment(unwrap(await apiClient.get<ApiSuccess<ApiAppointment>>(`/appointments/${id}`))),
    );
  },

  async create(input: BookingInput) {
    const body = {
      professionalId: input.professionalId,
      mode: modeToApi[input.mode],
      scheduledAt: input.startsAt,
      durationMin: DEFAULT_SESSION_MINUTES,
      notes: input.reason?.trim() || undefined,
    };
    return fromApiAppointment(unwrap(await apiClient.post<ApiSuccess<ApiAppointment>>('/appointments', body)));
  },

  async reschedule(id: string, startsAt: string) {
    const response = await apiClient.patch<ApiSuccess<ApiAppointment>>(`/appointments/${id}/reschedule`, {
      scheduledAt: startsAt,
    });
    return fromApiAppointment(unwrap(response));
  },

  async cancel(id: string) {
    return fromApiAppointment(unwrap(await apiClient.post<ApiSuccess<ApiAppointment>>(`/appointments/${id}/cancel`)));
  },
};
