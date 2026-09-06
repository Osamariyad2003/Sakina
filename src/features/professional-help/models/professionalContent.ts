import type { Professional, SessionMode } from '../../../types/models';

/**
 * Therapist directory + booking content (SH Freud reference section
 * "Therapist Booking & Appointment").
 *
 * [ASSUMPTION] Every professional below is ILLUSTRATIVE SEED DATA, not a
 * real practitioner: product-definition.md Open Question #2 (who vets
 * professionals, against which licensing register) and #7 (who takes
 * payment and carries liability) are both unresolved, and no backend
 * exists. `licenceNumber` is an obvious placeholder pattern so nothing here
 * can be mistaken for a real licence. Replace this catalogue wholesale with
 * a vetted API feed before launch — see ASSUMPTIONS.md.
 *
 * Two product rules are encoded here rather than left to the screens:
 * 1. `verified` is per-professional and never defaults to true, so the UI
 *    can say plainly which listings have had a licence checked.
 * 2. No payment is modelled anywhere — booking records an intent to meet.
 */

export interface Specialty {
  id: string;
  labelAr: string;
  labelEn: string;
}

export const specialtyCatalog: Specialty[] = [
  { id: 'anxiety', labelAr: 'القلق', labelEn: 'Anxiety' },
  { id: 'depression', labelAr: 'الاكتئاب', labelEn: 'Depression' },
  { id: 'stress', labelAr: 'ضغوط الحياة', labelEn: 'Stress' },
  { id: 'sleep', labelAr: 'اضطرابات النوم', labelEn: 'Sleep' },
  { id: 'grief', labelAr: 'الفقد والحزن', labelEn: 'Grief' },
  { id: 'relationships', labelAr: 'العلاقات', labelEn: 'Relationships' },
  { id: 'trauma', labelAr: 'الصدمات', labelEn: 'Trauma' },
  { id: 'youth', labelAr: 'المراهقون والشباب', labelEn: 'Youth' },
];

export function getSpecialty(id: string): Specialty | undefined {
  return specialtyCatalog.find((s) => s.id === id);
}

export const sessionModeMeta: Record<
  SessionMode,
  { labelAr: string; labelEn: string; icon: 'videocam-outline' | 'call-outline' | 'location-outline' }
> = {
  video: { labelAr: 'جلسة مرئية', labelEn: 'Video session', icon: 'videocam-outline' },
  phone: { labelAr: 'مكالمة صوتية', labelEn: 'Phone call', icon: 'call-outline' },
  inPerson: { labelAr: 'حضوري', labelEn: 'In person', icon: 'location-outline' },
};

/** Standard session length. A real directory would carry this per professional. */
export const DEFAULT_SESSION_MINUTES = 50;

/** How far ahead the directory offers slots — booking beyond this needs a backend. */
export const BOOKING_HORIZON_DAYS = 14;

export const therapistCatalog: Professional[] = [
  {
    id: 'pro-1',
    fullName: 'د. سلمى الحارثي',
    titleAr: 'أخصائية نفسية إكلينيكية',
    titleEn: 'Clinical psychologist',
    bioAr: 'تعمل مع البالغين على القلق وضغوط العمل بأسلوب معرفي سلوكي، وتركز على خطوات صغيرة قابلة للتطبيق.',
    bioEn: 'Works with adults on anxiety and work stress using a CBT approach, focused on small practical steps.',
    specialtyIds: ['anxiety', 'stress', 'sleep'],
    languages: ['ar', 'en'],
    yearsExperience: 9,
    sessionModes: ['video', 'phone'],
    feePerSession: 320,
    currency: 'SAR',
    rating: 4.6,
    reviewCount: 84,
    verified: true,
    licenceNumber: 'PLACEHOLDER-0001',
  },
  {
    id: 'pro-2',
    fullName: 'د. عمر الشمري',
    titleAr: 'استشاري طب نفسي',
    titleEn: 'Consultant psychiatrist',
    bioAr: 'خبرة في الاكتئاب واضطرابات المزاج، ويجمع بين المتابعة الدوائية والعلاج النفسي عند الحاجة.',
    bioEn: 'Experienced in depression and mood disorders, combining medication review with talk therapy where needed.',
    specialtyIds: ['depression', 'anxiety'],
    languages: ['ar'],
    yearsExperience: 15,
    sessionModes: ['video', 'inPerson'],
    city: 'الرياض',
    feePerSession: 450,
    currency: 'SAR',
    rating: 4.8,
    reviewCount: 152,
    verified: true,
    licenceNumber: 'PLACEHOLDER-0002',
  },
  {
    id: 'pro-3',
    fullName: 'أ. ليان القحطاني',
    titleAr: 'مرشدة نفسية',
    titleEn: 'Counsellor',
    bioAr: 'ترافق الشباب في مرحلة الدراسة والانتقال للعمل، وتعمل على الثقة بالنفس والعلاقات.',
    bioEn: 'Supports young people through study and early career transitions, working on confidence and relationships.',
    specialtyIds: ['youth', 'relationships', 'stress'],
    languages: ['ar', 'en'],
    yearsExperience: 5,
    sessionModes: ['video', 'phone'],
    feePerSession: 200,
    currency: 'SAR',
    rating: 4.4,
    reviewCount: 37,
    verified: true,
    licenceNumber: 'PLACEHOLDER-0003',
  },
  {
    id: 'pro-4',
    fullName: 'د. هالة بن ناصر',
    titleAr: 'أخصائية علاج الصدمات',
    titleEn: 'Trauma specialist',
    bioAr: 'تعمل على أثر الصدمات والفقد بأسلوب متدرج يحترم إيقاع كل شخص.',
    bioEn: 'Works on the effects of trauma and loss at a pace set by the person, never rushed.',
    specialtyIds: ['trauma', 'grief'],
    languages: ['ar'],
    yearsExperience: 12,
    sessionModes: ['video', 'inPerson'],
    city: 'جدة',
    feePerSession: 400,
    currency: 'SAR',
    rating: 4.7,
    reviewCount: 61,
    verified: true,
    licenceNumber: 'PLACEHOLDER-0004',
  },
  {
    id: 'pro-5',
    fullName: 'أ. فيصل العتيبي',
    titleAr: 'مرشد أسري',
    titleEn: 'Family counsellor',
    bioAr: 'يعمل مع الأزواج والعائلات على التواصل وحل الخلافات.',
    bioEn: 'Works with couples and families on communication and resolving conflict.',
    specialtyIds: ['relationships'],
    languages: ['ar'],
    yearsExperience: 7,
    sessionModes: ['phone', 'inPerson'],
    city: 'الدمام',
    currency: 'SAR',
    rating: 4.1,
    reviewCount: 19,
    // Licence not yet checked — the UI must say so rather than imply vetting.
    verified: false,
  },
  {
    id: 'pro-6',
    fullName: 'د. نورة الزهراني',
    titleAr: 'أخصائية اضطرابات النوم',
    titleEn: 'Sleep specialist',
    bioAr: 'تعالج الأرق بأسلوب سلوكي مع متابعة أسبوعية قصيرة.',
    bioEn: 'Treats insomnia behaviourally with short weekly follow-ups.',
    specialtyIds: ['sleep', 'stress'],
    languages: ['ar', 'en'],
    yearsExperience: 10,
    sessionModes: ['video'],
    feePerSession: 350,
    currency: 'SAR',
    rating: 4.5,
    reviewCount: 48,
    verified: true,
    licenceNumber: 'PLACEHOLDER-0006',
  },
];

export function getProfessional(id: string): Professional | undefined {
  return therapistCatalog.find((p) => p.id === id);
}

export interface DirectoryFilter {
  /** Free-text over name/title/specialty labels. */
  search?: string;
  specialtyId?: string | null;
  mode?: SessionMode | null;
  /** Only show listings whose licence has actually been checked. */
  verifiedOnly?: boolean;
}

/** A bookable slot. Deterministic (derived from the date + professional id), never random. */
export interface AvailabilitySlot {
  /** ISO datetime the session starts. */
  startsAt: string;
  durationMinutes: number;
  available: boolean;
}

/**
 * Deterministic pseudo-availability so the same professional always shows the
 * same slots for a given day across reloads. A real backend replaces this
 * entirely — the shape (`AvailabilitySlot[]`) is the contract screens use.
 */
export function buildDaySlots(professionalId: string, isoDate: string): AvailabilitySlot[] {
  const seed = [...(professionalId + isoDate)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 9973, 7);
  const startHours = [9, 10, 11, 13, 14, 15, 16, 17, 19, 20];
  return startHours.map((hour, index) => {
    const startsAt = new Date(`${isoDate}T${String(hour).padStart(2, '0')}:00:00`);
    return {
      startsAt: startsAt.toISOString(),
      durationMinutes: DEFAULT_SESSION_MINUTES,
      // ~half the grid is open, stable per professional/day; past slots never are.
      available: (seed >> index) % 2 === 0 && startsAt.getTime() > Date.now(),
    };
  });
}

/** Next `count` day-keys (YYYY-MM-DD) starting today — the booking date strip. */
export function bookingDateKeys(count = BOOKING_HORIZON_DAYS): string[] {
  const keys: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

/** Applies a directory filter. Pure, so both the service and tests can use it. */
export function filterProfessionals(all: Professional[], filter: DirectoryFilter, isArabic: boolean): Professional[] {
  const needle = filter.search?.trim().toLowerCase() ?? '';
  return all.filter((p) => {
    if (filter.verifiedOnly && !p.verified) return false;
    if (filter.specialtyId && !p.specialtyIds.includes(filter.specialtyId)) return false;
    if (filter.mode && !p.sessionModes.includes(filter.mode)) return false;
    if (!needle) return true;
    const specialtyLabels = p.specialtyIds
      .map((id) => getSpecialty(id))
      .map((s) => (s ? (isArabic ? s.labelAr : s.labelEn) : ''))
      .join(' ');
    return `${p.fullName} ${p.titleAr} ${p.titleEn} ${specialtyLabels}`.toLowerCase().includes(needle);
  });
}
