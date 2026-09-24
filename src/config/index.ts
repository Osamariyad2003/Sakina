/**
 * Single source of truth for API base URL, feature flags, and every
 * [ASSUMPTION] placeholder that depends on a business decision the source
 * specs don't make. See ASSUMPTIONS.md and docs/product-definition.md
 * → "Open Questions to Resolve Before SRS" for what each one is waiting on.
 */

import { Platform } from 'react-native';

export const config = {
  /**
   * Backend base URL (…/api/v1), set via EXPO_PUBLIC_API_BASE_URL at build time.
   * The browser can't use the Android emulator's host alias (10.0.2.2), so web
   * may set EXPO_PUBLIC_API_BASE_URL_WEB (e.g. http://localhost:27360/api/v1);
   * it falls back to EXPO_PUBLIC_API_BASE_URL when unset.
   */
  apiBaseUrl:
    (Platform.OS === 'web' ? process.env.EXPO_PUBLIC_API_BASE_URL_WEB : undefined) ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    'https://api.sakina.example/v1',

  /**
   * The single switch between the local mocks and the real backend. While
   * true, every features/*\/services implementation uses its mock branch;
   * when false they call `apiClient` (auth, journal, mood, …). Turn the real
   * API on at build time with EXPO_PUBLIC_LIVE_API=true. Services with no
   * backend counterpart (see ASSUMPTIONS.md) stay on their mock either way.
   */
  useMockServices: process.env.EXPO_PUBLIC_LIVE_API !== 'true',

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
    aiCompanionLive:
      process.env.EXPO_PUBLIC_LIVE_API === 'true' || process.env.EXPO_PUBLIC_AI_COMPANION_LIVE === 'true',
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
