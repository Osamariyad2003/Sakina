# Sakina — سكينة

Arabic-first mental-health and emotional-wellbeing mobile app for young
Arabic-speaking users in Jordan. React Native (Expo, TypeScript), Arabic/RTL
as the source layout.

Governing specs: [`docs/mobile-engineering-spec.md`](docs/mobile-engineering-spec.md) ·
[`docs/product-definition.md`](docs/product-definition.md). Open assumptions
and stubs: [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Status

Build is proceeding in phases (see engineering spec §40). Currently complete:

- **Phase 0** — project scaffold, dependencies, feature-sliced folder structure.
- **Phase 1** — design tokens, theme provider (light/dark), Thmanyah font
  loading (with system-font fallback until real font files are supplied —
  see `ASSUMPTIONS.md`), and the shared primitive component library
  (`src/ui/primitives`).
- **Phase 2** — app shell: i18next (`ar`/`en`) with RTL forced from the
  persisted language and a reload-on-change flow; the full navigator tree
  (Onboarding → Auth → bottom tabs) with session/onboarding-aware routing;
  a typed axios client with token-refresh interceptors; TanStack Query
  provider; Zustand auth/onboarding stores; secure-store token storage +
  MMKV cache storage; a global error boundary with Arabic error mapping;
  offline detection banner; splash held until fonts + session restore
  resolve. Every screen in the nav tree is real and navigable — most are
  intentionally content-placeholders (see `ASSUMPTIONS.md`) until their
  feature phase.

- **Phase 3 — Authentication** — Login, Register, Forgot/Reset Password are
  now real, full-DoD screens: React Hook Form + Zod validation with Arabic
  (and English) messages, a `PasswordField` with a visibility toggle,
  loading/error/success states, keyboard-avoiding + safe-area layout, RTL.
  Backed by a mock service (`config.useMockServices`) that persists a fake
  user table to MMKV so register → logout → login round-trips correctly —
  clearly flagged as not real security in `ASSUMPTIONS.md`. Session restore
  now also recovers the last-known profile, not just tokens.

- **Phase 4 — Onboarding** — Goals is a real multi-select (7 drafted goals,
  `[ASSUMPTION]`-flagged content) and Baseline is a real 4-question
  sequential flow with a progress bar, both persisted to MMKV. Consent now
  has an actual functional gate (explicit agree-toggle required before
  continuing), though its copy is still placeholder pending legal review.

- **Phase 5 — Mood** — full check-in flow (Mood → Emotion → Trigger →
  optional Note → Save → Confirmation, haptics, keyboard-aware note step),
  history list (FlashList) with an `react-native-svg` weekly/monthly trend
  chart (RTL-aware axis order), and loading/empty/error states throughout.
  Backed by a mock service persisting to MMKV. Home's mood card now shows
  real "today's mood" data instead of a static placeholder.

- **Phase 6 — AI Companion** — full chat UI: message bubbles (memoized),
  word-by-word streaming into the last AI bubble, a typing indicator,
  suggested prompts, retry-on-failure, and a persistent non-clinical
  disclaimer. A minimal keyword-based risk detector triggers a pinned
  `SafetyBanner` linking straight to the Safety screen — a real (if
  intentionally minimal) enforcement of the "never present as doctor/
  therapist, must escalate" business rule, clearly flagged as not a
  clinical policy in `ASSUMPTIONS.md`.

- **Phase 7 — Journaling** — full CRUD (create/view/edit/delete), a
  date-grouped searchable list (FlashList), guided prompts, local draft
  autosave (MMKV, debounced, restored on resume), native delete
  confirmation, and a real-but-gated AI-reflection UI slot (feature-flagged
  off, per MVP scope — shows "coming soon" rather than being omitted).

- **Phase 8 — Wellness** — category tabs, exercise list, and the full
  Details → Preparation → Exercise → Progress → Completion flow. A
  breathing exercise gets a Reanimated 3 pulsing-circle visualizer (UI
  thread, not JS `setInterval`) synced to an inhale/hold/exhale pattern;
  grounding/relaxation exercises get step-by-step guided instructions.
  Screen stays awake during the exercise (`expo-keep-awake`) and the
  visualizer respects reduced-motion.

- **Phase 9 — Profile & Settings** — Profile (view/edit name, email
  display, links out), Settings (language switch reusing the RTL-reload
  flow, a disabled "coming soon" notifications toggle, app version), and
  Privacy (consent status + a real "clear my data" action that actually
  wipes local mood/journal/chat/onboarding data, not a decorative button).

Every MVP module from product-definition.md §13 is now built. Not yet
built: Insights and Professional Help — both explicitly deferred from MVP.
`App.tsx` boots the real navigator tree, gated by real (mock-backed) auth.

## Requirements

- Node.js 18+
- npm
- For native builds: Xcode (iOS, macOS only) and/or Android Studio (Android)
- [Expo Go](https://expo.dev/go) is **not** sufficient once native modules
  land (MMKV, Skia, Nitro Modules, secure-store) — use a **dev client** build.

## Setup

```bash
npm install
```

## Run

```bash
npx expo start          # then press a (Android) / i (iOS) / scan the QR with a dev-client build
npm run android          # build & run on a connected Android device/emulator
npm run ios              # build & run on iOS (macOS only)
```

The first native run requires building a dev client (`npx expo run:android` /
`npx expo run:ios`, or `eas build --profile development`) because the app
depends on native modules not present in the stock Expo Go app.

## Project structure

```
src/
  core/         # api client, auth, error mapping, secure/cache storage
  ui/           # design tokens, ThemeProvider, Thmanyah fonts, primitives
  features/     # one folder per module: screens/components/state/services/models/validation
  navigation/   # RootNavigator, AuthStack, OnboardingStack, AppTabs
  i18n/         # i18next config + ar/en resources
  config/       # API base URL, feature flags, [ASSUMPTION] placeholders
  types/        # cross-cutting shared types
```

## Verifying changes

```bash
npx tsc --noEmit     # typecheck
npx expo-doctor       # dependency/config health check
```

There's no emulator/device available in this environment, so UI changes here
have been verified via typecheck only — a real device/emulator run is needed
to confirm visual and interaction behavior.
