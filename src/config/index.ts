/**
 * Single source of truth for API base URL, feature flags, and every
 * [ASSUMPTION] placeholder that depends on a business decision the source
 * specs don't make. See ASSUMPTIONS.md and docs/product-definition.md
 * → "Open Questions to Resolve Before SRS" for what each one is waiting on.
 */

export const config = {
  /**
   * [ASSUMPTION] Real backend base URL is unknown (product-definition.md,
   * Open Question #4/#8 — LLM/backend provider undecided). Override via
   * EXPO_PUBLIC_API_BASE_URL at build time once a backend exists.
   */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.sakina.example/v1',

  /**
   * While true, every features/*\/services implementation must use its mock
   * branch instead of calling `apiClient`. Flip once a real backend + the
   * open questions above are resolved.
   */
  useMockServices: true,

  featureFlags: {
    /**
     * Therapist directory + appointment booking (features/professional-help).
     * Now implemented against the local mock service — flip to false to hide
     * every booking entry point again (Home section, Appointments screens).
     * Real booking still needs a backend + the payment/liability decisions in
     * product-definition.md Open Question #2/#7 — see ASSUMPTIONS.md.
     */
    professionalBooking: true,
    /** Deferred from MVP — journal AI reflection is optional/stubbed even when true. */
    aiJournalReflection: false,
    /**
     * In-app notification inbox + reminder preferences
     * (features/notifications). OS-level delivery is a separate concern —
     * see `notificationScheduler.ts`, which is the single seam where
     * expo-notifications plugs in once that dependency is added.
     */
    notifications: true,
    /** Rich Insights beyond simple trends — deferred from MVP. */
    richInsights: false,
    /**
     * When true, the AI Companion calls the real Claude-backed proxy
     * (`companionApiPath` under `apiBaseUrl`) instead of the local mock.
     * Gated per-feature (not via `useMockServices`, which is global) so real
     * AI can be enabled for the Companion alone. Requires a deployed proxy
     * that holds the Anthropic key server-side — see `server/companion-proxy/`.
     * Override at build time with EXPO_PUBLIC_AI_COMPANION_LIVE=true.
     */
    aiCompanionLive: process.env.EXPO_PUBLIC_AI_COMPANION_LIVE === 'true',
  },

  /**
   * Flips the whole app to the maintenance screen (features/errors). Kept as
   * config rather than a server flag because there is no backend yet; wire it
   * to a remote config value once one exists.
   */
  maintenanceMode: false,

  /** Path (under apiBaseUrl) of the Claude-backed companion proxy endpoint. */
  companionApiPath: '/companion/message',

  defaultLanguage: 'ar' as const,
} as const;
