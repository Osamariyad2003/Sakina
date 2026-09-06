import { z } from 'zod';

/**
 * Typed models per eng spec §23, validated with Zod at the API boundary
 * (repository layer). Fields marked [ASSUMPTION] are a reasonable shape
 * inferred from the specs, not a confirmed backend contract — reconcile
 * with the real API schema once it exists (product-definition.md Open
 * Question #4/#8).
 */

export const UserSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  email: z.string().email().optional(),
  language: z.enum(['ar', 'en']).default('ar'),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const EmotionSchema = z.object({
  id: z.string(),
  labelAr: z.string(),
  labelEn: z.string(),
  emoji: z.string().optional(),
});
export type Emotion = z.infer<typeof EmotionSchema>;

export const TriggerSchema = z.object({
  id: z.string(),
  labelAr: z.string(),
  labelEn: z.string(),
});
export type Trigger = z.infer<typeof TriggerSchema>;

export const MoodLevelSchema = z.enum(['veryLow', 'low', 'neutral', 'good', 'veryGood']);
export type MoodLevel = z.infer<typeof MoodLevelSchema>;

/** Self-reported 1-10 / qualitative context captured during a mood check-in. */
export const MoodMetricsSchema = z.object({
  /** How active you were, 1-10. */
  active: z.number().min(1).max(10).optional(),
  /** How well you ate, 1-10. */
  eat: z.number().min(1).max(10).optional(),
  /** How you slept. */
  sleepQuality: z.enum(['bad', 'ok', 'good']).optional(),
  /** How stressed you are, 1-10. */
  stress: z.number().min(1).max(10).optional(),
});
export type MoodMetrics = z.infer<typeof MoodMetricsSchema>;

export const MoodEntrySchema = z.object({
  id: z.string(),
  mood: MoodLevelSchema,
  emotionIds: z.array(z.string()).default([]),
  triggerIds: z.array(z.string()).default([]),
  note: z.string().optional(),
  /** Who you were with — ids from moodContent.companionCatalog. */
  companionIds: z.array(z.string()).default([]),
  /** A user-typed place label — never GPS coordinates (see MoodCheckIn "we don't track location"). */
  locationLabel: z.string().optional(),
  metrics: MoodMetricsSchema.optional(),
  createdAt: z.string(),
});
export type MoodEntry = z.infer<typeof MoodEntrySchema>;

export const JournalEntrySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string(),
  promptId: z.string().optional(),
  aiReflection: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  createdAt: z.string(),
  /** True while an assistant message is still streaming in. */
  streaming: z.boolean().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatConversationSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ChatConversation = z.infer<typeof ChatConversationSchema>;

export const WellnessCategorySchema = z.enum([
  'breathing',
  'grounding',
  'relaxation',
  'meditation',
  'stressRelief',
  'sleep',
]);
export type WellnessCategory = z.infer<typeof WellnessCategorySchema>;

export const WellnessExerciseSchema = z.object({
  id: z.string(),
  category: WellnessCategorySchema,
  titleAr: z.string(),
  titleEn: z.string(),
  descriptionAr: z.string(),
  durationSeconds: z.number(),
});
export type WellnessExercise = z.infer<typeof WellnessExerciseSchema>;

export const InsightSchema = z.object({
  id: z.string(),
  titleAr: z.string(),
  bodyAr: z.string(),
  createdAt: z.string(),
});
export type Insight = z.infer<typeof InsightSchema>;

/** How a session is delivered. In-person needs a `city`; video/phone don't. */
export const SessionModeSchema = z.enum(['video', 'phone', 'inPerson']);
export type SessionMode = z.infer<typeof SessionModeSchema>;

/**
 * [ASSUMPTION] Vetting/licensing fields shaped per product-definition.md
 * Open Question #2 (who vets professionals, and against which register).
 * `licenceNumber`/`verified` are carried so the UI can be honest about
 * which listings are verified rather than implying all of them are.
 */
export const ProfessionalSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  titleAr: z.string(),
  titleEn: z.string(),
  bioAr: z.string().optional(),
  bioEn: z.string().optional(),
  photoUrl: z.string().optional(),
  /** Specialty ids from professionalContent.specialtyCatalog. */
  specialtyIds: z.array(z.string()).default([]),
  /** Language codes the professional practises in. */
  languages: z.array(z.enum(['ar', 'en'])).default(['ar']),
  yearsExperience: z.number().nonnegative(),
  sessionModes: z.array(SessionModeSchema).default(['video']),
  city: z.string().optional(),
  /** Fee per session in the local currency; omitted when the professional doesn't publish one. */
  feePerSession: z.number().nonnegative().optional(),
  currency: z.string().default('SAR'),
  /** [ASSUMPTION] Aggregate rating shape — no review backend exists yet. */
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().nonnegative().default(0),
  /** True only when the licence has been checked — never defaulted to true. */
  verified: z.boolean().default(false),
  licenceNumber: z.string().optional(),
});
export type Professional = z.infer<typeof ProfessionalSchema>;

export const AppointmentStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed']);
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;

/**
 * [ASSUMPTION] Payment is deliberately NOT modelled — product-definition.md
 * Open Question #7 (who takes payment, and who carries liability) is
 * unresolved, so booking records an intent to meet and nothing more. The
 * mock service confirms bookings locally; a real backend owns confirmation.
 */
export const AppointmentSchema = z.object({
  id: z.string(),
  professionalId: z.string(),
  startsAt: z.string(),
  durationMinutes: z.number().positive(),
  mode: SessionModeSchema,
  status: AppointmentStatusSchema,
  /** What the user wants to talk about — optional, and never shown outside this record. */
  reason: z.string().optional(),
  createdAt: z.string(),
  cancelledAt: z.string().optional(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;
