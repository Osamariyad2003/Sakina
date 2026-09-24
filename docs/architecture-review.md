# Sakina mobile app — architecture review

**Scope:** `D:\Sakina` (Expo / React Native client) only. The backend
(`Sakina-backend`) and admin panel (`Sakina-admin`) are referenced where the
app's architecture depends on them, but are not reviewed here.

**Intent:** assessment of the code as it exists on 2026-09-24, against Clean
Architecture and SOLID, with a prioritised gap list. This is not a
rewrite proposal — the structure is sound enough that the gaps are worth
closing in place.

**Sources of truth used:** `docs/product-definition.md`,
`docs/mobile-engineering-spec.md`, `docs/Frontend Engineering & UI
Architecture Specification.md`, `ASSUMPTIONS.md`. Where this document states
something the specs do not cover, it is marked **[assumption]**.

---

## 1. Architecture overview (as built)

The app is **feature-first**, not layer-first. Each feature under
`src/features/<feature>/` owns its own vertical slice:

```
src/features/mood/
  components/   presentational widgets
  models/       content + domain-ish types and weights
  screens/      React Navigation screens
  services/     data access + business rules + mapping  ← does the most work
  state/        React Query hooks (thin)
  validation/   zod form schemas
```

Cross-cutting concerns live in `src/core/` (API client, errors, storage,
network), `src/ui/` (primitives + design tokens), `src/navigation/`,
`src/i18n/`, `src/types/` and `src/companion/` (the Rive/voice avatar, which
is deliberately outside `features/` because two features drive it).

Mapped onto Clean Architecture's four layers, the current reality is:

| Clean layer | Where it lives today | Verdict |
|---|---|---|
| Presentation | `features/*/screens`, `features/*/components`, `ui/` | Mostly clean; some logic leaks in (§6) |
| Application | `features/*/state` (React Query hooks) | Thin and consistent — the healthiest layer |
| Domain | `features/*/models`, `types/models.ts` | Exists, but rules are scattered outside it (§6) |
| Infrastructure | `core/api`, `core/storage`, `features/*/services` | Fused with Application and Domain inside `services/` |

**The central finding: there is no Application/Domain/Infrastructure
separation inside `services/`.** 23 service modules (3,767 LOC) each hold
transport, persistence, mapping, and business rules in one file. Everything
else in the structure is better than that layer.

---

## 2. Architecture decisions and their justification

These are decisions the codebase has already made. Each is assessed on
whether it earns its cost.

### 2.1 Feature-first over layer-first — **justified, keep**

A layer-first tree (`screens/`, `services/`, `models/`) would spread a single
feature across the repo. With 18 features and 98 screens, feature-first keeps
a change to Mood inside `features/mood/`. This is the right call for an app
of this size and is applied consistently.

### 2.2 React Query as the application layer — **justified, keep**

`features/*/state/*.ts` are uniformly thin: query-key factories plus
`useQuery`/`useMutation` wrappers over a service call
([useMoodQueries.ts](../src/features/mood/state/useMoodQueries.ts)). Caching,
retry, invalidation and loading state are handled by the library instead of
hand-rolled. This is a legitimate Application layer for a mobile client and
it is the most disciplined part of the codebase.

### 2.3 Mock/live services toggled by a build flag — **not justified as built**

[config/index.ts](../src/config/index.ts) exposes `useMockServices`, and 13
services branch on it. The selection happens at **module load**:

```ts
// src/features/mood/services/moodService.ts:259
export const moodService = config.useMockServices ? mockMoodService : liveMoodService;
```

The goal — develop without a backend — is sound. The mechanism is not:

- Consumers import a *concrete module*, so there is no seam to substitute a
  fake in a test. This is a Dependency Inversion violation.
- Both implementations ship in the production bundle.
- The two branches drift; only the live branch is exercised against the real
  API, and only the mock branch against local data.
- 32 references to the flag across `src/` make the behaviour of any given
  screen dependent on build configuration rather than on injected collaborators.

### 2.4 Zod for domain models — **justified in intent; enforced since 2026-09-24**

`src/types/models.ts` defines 15 schemas and states they are "validated with
Zod at the API boundary (repository layer)". Across all 23 services there is
**one** `.parse()` call. Responses are cast through hand-written TypeScript
interfaces (`ApiProfessional`, `ApiMoodEntry`, `ApiContentImage`) and trusted.
TypeScript interfaces vanish at runtime, so a backend contract change reaches
the UI as `undefined`, not as a caught error.

### 2.5 On-device risk detection duplicated with the backend — **justified, but fragile**

[riskDetection.ts](../src/features/ai-companion/models/riskDetection.ts)
keeps a keyword list that the backend also keeps
(`riskDetection.service.js`), with a comment instructing humans to "keep the
two term lists in step". Duplicating it is defensible — it works offline and
before any network call, and it is a safety rule where recall matters more
than precision. Manual synchronisation of a **safety-critical** rule across
two repos is the fragile part (§12).

---

## 3. Layer responsibilities — intended vs actual

### Presentation — `screens/`, `components/`, `ui/`

**Intended:** render, collect input, call an application hook, format output.

**Actual:** largely correct. `apiClient` is never imported by a `.tsx` file —
transport genuinely does not leak into the UI. `ui/primitives` + design
tokens are used consistently instead of raw values.

**Leaks found:** business rules computed inside components (§6.2), and six
screens that call a service directly, skipping the state layer (§6.4).

### Application — `state/`

**Intended:** orchestrate use cases, no rendering, no transport details.

**Actual:** correct, but *anaemic* — the hooks pass straight through to a
service. Use-case logic that should live here (the orchestration of "log a
mood, invalidate the trend, award a badge") sits either in the service below
or the component above.

### Domain — `models/`, `types/models.ts`

**Intended:** framework-free business rules and types.

**Actual:** the content files (`moodContent.ts`, `stressContent.ts`,
`badgeContent.ts` — 3,141 LOC) are genuinely framework-free and carry real
domain data (mood weights, stress bands, badge criteria). But the *rules* that
operate on that data are elsewhere (§6.1, §6.2), so the domain is a data
model without behaviour.

### Infrastructure — `core/api`, `core/storage`, plus half of every service

**Intended:** implement interfaces defined by inner layers.

**Actual:** `core/` is well-bounded. `core/storage` deliberately splits
non-sensitive cache (MMKV) from tokens
([secureStore.ts](../src/core/storage/secureStore.ts)), with tokens never
written to MMKV — a good security boundary, documented in code. But there are
no interfaces for infrastructure to implement: services *are* the
infrastructure, and callers depend on them concretely.

---

## 4. Module breakdown

Grouped by responsibility rather than listing all 18 features. For each:
layer weight, key files, dependencies, and architectural notes.

### 4.1 Safety (cross-cutting, highest risk)

- **Responsibility:** detect risk language, surface crisis resources, keep the
  route to a human ≤2 taps.
- **Files:** [riskDetection.ts](../src/features/ai-companion/models/riskDetection.ts),
  `features/safety/`, the crisis branch of
  [useVoiceLoop.ts](../src/companion/useVoiceLoop.ts),
  `companionService.ts:197`, `therapyService.ts:191`, `communityService.ts`.
- **Dependencies:** none (pure function) — correct.
- **Note:** consumed by three features but *owned* by `ai-companion`. A rule
  this important should not live inside one feature's folder (§6.3).

### 4.2 AI Companion + voice avatar

- **Responsibility:** conversation, risk escalation, TTS/STT loop, avatar state.
- **Files:** `features/ai-companion/`, `src/companion/` (avatar, voice loop,
  TTS provider behind an interface).
- **Architectural highlight:** `companion/tts/ttsProvider.ts` is the one place
  in the app where an external service sits behind an interface with a
  swappable implementation. This is the pattern the rest of the app lacks.
- **Dependencies:** `companionService` (which owns risk + transport),
  `expo-speech`, `expo-speech-recognition`, `rive-react-native`.

### 4.3 Tracking features — Mood, Sleep, Stress, Hydration, Journal

- **Responsibility:** capture self-reported entries, aggregate them into trends.
- **Files:** `features/mood/`, `features/wellness/{sleep,hydration,stress-management}/`,
  `features/journal/`.
- **Note:** the aggregation rules (`buildTrend`, stress banding, sleep
  averaging) are domain logic living in service files (§6.1).

### 4.4 Home / Insights (aggregators)

- **Responsibility:** present cross-feature summaries.
- **Files:** `features/home/` (17 components), `features/insights/`.
- **Note:** the highest coupling in the app —
  [CombinedMetricsCard.tsx](../src/features/home/components/CombinedMetricsCard.tsx)
  imports state and models from mood, stress and sleep, and computes a
  sleep↔stress correlation inline (§6.2). Aggregation features legitimately
  read from many others, but should do it through an application-layer
  use case, not by reaching into six feature folders from a component.

### 4.5 Professional help

- **Responsibility:** browse professionals, book/reschedule/cancel appointments.
- **Files:** `professionalService.ts` (369 LOC — the largest service),
  `features/professional-help/`.
- **Note:** contains real booking rules (slot generation, conflict handling,
  mode mapping) mixed with transport and i18n. Prime candidate for the first
  extraction (§13).

### 4.6 Content + imagery (recently added)

- **Responsibility:** editorial articles and wellness exercises whose copy
  ships in the app, with imagery curated server-side.
- **Files:** `features/wellness/resources/`,
  [contentImageService.ts](../src/features/wellness/services/contentImageService.ts),
  [useContentImages.ts](../src/features/wellness/state/useContentImages.ts),
  [ContentImage.tsx](../src/ui/primitives/ContentImage.tsx).
- **Note:** a good recent example of the intended shape — service fetches and
  maps, hook caches, primitive renders, and the service degrades to a cached
  copy rather than failing the screen.

### 4.7 Core

- **api:** `client.ts` (axios + token refresh), `envelope.ts` (`unwrap`),
  `paginate.ts`, `queryClient.ts`, `catalog.ts`.
- **errors:** `AppError`, `errorMapper`, `ErrorBoundary`.
- **storage:** `mmkv.ts` (cache) / `secureStore.ts` (tokens only).
- **network:** online status + offline banner.
- **Verdict:** the best-factored area of the app. Single responsibility per
  file, no feature imports, no UI concerns except the two deliberate
  components.

---

## 5. Project structure (actual, abridged)

```
src/
  companion/            avatar + voice loop (cross-feature, not a feature)
    CompanionAvatar.tsx / .web.tsx   platform split
    CompanionFace.tsx                code-drawn fallback
    useVoiceLoop.ts                  listen → reflect → speak → crisis
    tts/ttsProvider.ts               ← interface + implementation (good pattern)
  config/               build-time flags, incl. useMockServices
  core/
    api/      client · envelope · paginate · queryClient · catalog
    auth/     authStore (zustand) · index
    errors/   AppError · errorMapper · ErrorBoundary
    network/  useOnlineStatus · OfflineBanner
    storage/  mmkv (cache) · secureStore (tokens)
  features/<18 features>/
    components/ models/ screens/ services/ state/ validation/
  i18n/       ar.json · en.json  (Arabic-first)
  navigation/ stacks + tab navigator + types
  types/      models.ts (15 zod schemas)
  ui/         primitives/ · theme/ · tokens/ · splash/
```

Counts: 98 screens, 23 services, 26 state modules, 21 model modules,
**0 test files**.

---

## 6. Dependency flow and the violations found

The intended direction holds at the outer edges:

```
screens/components  →  state (React Query)  →  services  →  core/api · core/storage
        ↓                                          ↓
   ui/primitives                              types/models · features/*/models
```

Confirmed clean: no `.tsx` file imports `apiClient`; `core/` imports no
feature; `ui/` imports no feature.

The violations, with evidence:

### 6.1 Domain rules inside infrastructure — `services/`

`buildTrend()` in
[moodService.ts:101](../src/features/mood/services/moodService.ts) computes
daily mood averages from `moodLevelWeight` — a domain rule, defined in a file
whose other half is axios calls. Same shape in `stressBand()`
(moodService.ts:164), sleep averaging (`sleepService.ts`), and the booking
rules in `professionalService.ts`.

**Consequence:** the rule cannot be tested without stubbing storage or HTTP.

### 6.2 Domain rules inside presentation — components

[CombinedMetricsCard.tsx:43-68](../src/features/home/components/CombinedMetricsCard.tsx)
computes average sleep hours, then splits stress entries into `<6h` and `6h+`
groups, requires ≥4 samples in each, and compares mean stress weight to
decide whether to show a correlation callout. Those thresholds (6 hours, 4
samples) are **product rules embedded in a React component**, and the result
is formatted with `t()` in the same place.

**Consequence:** a clinically-relevant heuristic is invisible to anyone
reading the domain layer, and untestable without rendering a component with
six mocked hooks.

### 6.3 A cross-cutting domain rule owned by one feature *(resolved 2026-09-24)*

`containsRiskLanguage` lives in `features/ai-companion/models/` and is
imported by `features/ai-therapy/services/therapyService.ts:5` and
`features/community/services/communityService.ts:4`. Feature folders should
not import from one another's internals; a shared safety rule belongs in a
shared domain location.

### 6.4 Presentation reaching past the application layer

Six screens import a service directly instead of going through `state/`:
`ProfileScreen`, `PrivacyScreen`, `SymptomResultsScreen`,
`SleepAIAutosuggestScreen`, `ReminderSettingsScreen`,
`AssessmentSummaryScreen`. These bypass React Query's caching and
invalidation, so their data can disagree with the rest of the app.

### 6.5 Presentation concerns inside services — i18n *(resolved 2026-09-24)*

Nine services import `src/i18n` directly. In
[professionalService.ts:41,49](../src/features/professional-help/services/professionalService.ts)
the service reads `i18n.language` to choose a field and throws
`new AppError(i18n.t('professionals.notFound'), …)`.

**Consequence:** errors carry pre-translated strings, so the same error cannot
be re-rendered after a language switch, cannot be asserted on in a test
without booting i18n, and cannot be logged in a stable language. Errors should
carry a *code*; the Presentation layer should translate it.

### 6.6 No abstraction between use case and infrastructure

13 services call `apiClient` directly; 18 touch `storage` directly. There is
no `MoodRepository` interface that a use case depends on. Combined with the
build-flag swap (§2.3), there is no seam for a test double anywhere in the
data path.

### 6.7 Structural noise *(resolved 2026-09-24)*

`validation/` directories exist in ~11 features but contain files in only
three (`authentication`, `journal`, `mood`). The rest are **empty
directories**, implying a layer that does not exist.

---

## 7. Key interfaces and abstractions

### Exists and works

| Abstraction | Location | Why it is good |
|---|---|---|
| `TtsProvider` | `companion/tts/ttsProvider.ts` | Real interface + `expoSpeechProvider` implementation; swapping to a cloud TTS touches no caller |
| `CompanionAvatarHandle` | `companion/companionState.ts` | Platform-agnostic contract implemented by both the Rive avatar and the drawn `CompanionFace` |
| `AppError` + `errorMapper` | `core/errors/` | One error type across the app, mapped at the boundary |
| `secureStorage` | `core/storage/secureStore.ts` | Platform split behind one interface; tokens never touch MMKV |
| `ContentImageData` | `ui/primitives/ContentImage.tsx` | Render contract independent of where the image came from |

### Missing, in priority order

1. **`Repository` interfaces per aggregate** — `MoodRepository`,
   `AppointmentRepository`, `JournalRepository`. Use cases depend on these;
   `Http*Repository` and `Local*Repository` implement them. This is what makes
   §2.3's mock/live split legitimate instead of a build flag.
2. **Use-case functions** for multi-step flows (log mood → invalidate trend →
   evaluate badges; book appointment → conflict check → notification).
3. **A response-validation boundary** — one `parseResponse(Schema, data)` helper
   applied where `unwrap()` is called today, making §2.4's stated contract real.
4. **An error-code contract** so services stop importing i18n (§6.5).

---

## 8. Data flow for important use cases

### 8.1 Mood check-in (typical write path)

```
MoodCheckInScreen
  → useCreateMoodMutation            (state/useMoodQueries.ts)
    → moodService.createEntry        ← build-flag: mock or live
      → apiClient.post('/mood')  |  storage.setJSON(mockMoodEntries)
      → fromApiEntry() mapping
  → invalidate mood query keys
  → navigate back; Home re-reads trend
```

**Gap:** `buildTrend` (domain) and `fromApiEntry` (infrastructure mapping) sit
in the same module as the transport call, and the branch is chosen at import
time.

### 8.2 Companion message with risk escalation (safety-critical)

```
ConversationScreen / useVoiceLoop
  → companionService.sendMessage(text)
    → containsRiskLanguage(text)                    ← domain rule, runs first, offline-safe
    → apiClient.post('/companion/message')          ← backend runs its own classifier
    → riskDetected = client OR server
  → crisis: stop TTS, avatar → Crisis, navigate to Safety   (one-way gate in useVoiceLoop)
```

This flow is **well designed** — the local check runs before any network call,
either side can trigger, and the gate is explicitly one-way with no automatic
exit. Its weakness is organisational, not structural (§6.3, §12).

### 8.3 Content imagery (recent, closest to the target shape)

```
ResourceCard / detail screens
  → useContentImage(target, key)        (state/useContentImages.ts, 1h stale)
    → contentImageService.list()
      → GET /content-images → toMap()
      → on success: cache to MMKV; on failure: serve last-seen cache
  → ContentImage primitive renders; content-file image is the fallback
```

Clean separation of fetch / cache / render, with an explicit degradation
policy. **Use this as the reference pattern** when refactoring older features.

---

## 9. Clean Code assessment

**Holding well:**
- Naming is intention-revealing throughout (`containsRiskLanguage`,
  `useCreateWellnessSessionMutation`, `CompanionState.Reflecting`). No `data`,
  `obj`, `manager`, `process()` anywhere in `src/`.
- Functions are small; the largest service function is well under 50 lines.
- Comments explain *why*, not *what* — and unusually, they record product
  decisions and their rationale (`ASSUMPTIONS.md` plus docblocks like the one
  on `riskDetection.ts`). This is genuinely above average and should be kept.
- Design tokens are respected; features do not hardcode colours or spacing.

**Not holding:**
- **SRP at module level:** a service is simultaneously repository, mapper,
  domain service and translator.
- **DIP:** concrete modules imported everywhere; no injected collaborators.
- **DRY:** `fromApiX` mappers are re-implemented per service with no shared
  convention; the same `fakeDelay` helper is redefined in several services.
- **Dead structure:** empty `validation/` directories (§6.7); `config`
  branches that ship both code paths.

---

## 10. Testing strategy

**Current state (updated 2026-09-24):** Vitest is configured and there are 100
tests — risk detection (61), the API contract helper (6), the sleep↔stress
rule (12), the Mood use cases (7), the booking use cases (9) and error
rendering (5). The last two groups run against injected fakes. At the time of
the original review there were none. Every claim about correctness in this app currently rests on
TypeScript plus manual checking. For an application that escalates
self-harm language, that is the most serious gap in this review.

Recommended, in the order the refactors above make possible:

1. **Domain unit tests first — no refactor needed.** `containsRiskLanguage`,
   `moodLevelWeight`/`stressLevelWeight` tables, badge criteria and
   `buildTrend` can be tested today as pure functions. Risk detection should
   have a test per keyword family and per false-positive case.
2. **Use-case tests once repositories exist** (§7.1–7.2): inject a fake
   repository, assert orchestration without HTTP or storage.
3. **Mapper tests** on `fromApi*` against recorded backend payloads — these
   are where a silent contract break would otherwise surface as `undefined`.
4. **Component tests** for the few components holding logic today, or delete
   the need for them by moving that logic to the domain (§6.2).
5. **A contract check against the backend's OpenAPI document** — the backend
   already enforces route/docs parity in its own suite; the app could assert
   its `Api*` interfaces against the same document.

Suggested runner: **Vitest** with `@testing-library/react-native` (already the
backend's runner, so one mental model across repos).

---

## 11. Security considerations

**Correct today:**
- Tokens are stored only in `secureStore`, never MMKV, and the split is
  enforced by module boundary and documented in code.
- The web fallback to `localStorage` is explicitly marked as *not* secure
  storage, with a comment saying so rather than quietly pretending otherwise.
- `apiClient` centralises auth headers and single-flight refresh — no feature
  hand-rolls authentication.
- No secrets in the app bundle: the Unsplash access key lives server-side and
  the app never talks to an image provider directly.

**Weaknesses:**
- **Unvalidated API responses (§2.4)** are a security concern as well as a
  correctness one: server-controlled strings flow into rendering without
  schema validation.
- **Pre-translated error strings (§6.5)** risk leaking backend detail into
  user-visible copy, since the service decides the message.
- **[assumption]** No certificate pinning and no jailbreak/root signal. For a
  mental-health app handling journal content, worth an explicit decision
  rather than silence.
- `EXPO_PUBLIC_*` values are build-time public by definition; the app base URL
  is fine there, but nothing sensitive must ever join them.

---

## 12. Architectural risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Risk-keyword lists drift between app and backend | ~~High~~ → Low; **confirmed: they had already drifted** (5 phrases) | **Safety-critical**: an untranslated escalation phrase silently stops escalating on-device | ~~Mitigated~~ by the shared fixture asserted in both suites. A single published source is still the stronger fix |
| R2 | Backend contract change reaches the UI as `undefined` | Medium | Broken screens, no error surfaced | Enforce zod at the boundary (§7.3) |
| R3 | Mock and live branches diverge | High | Features that work in development fail against the real API | Repository interfaces + DI; delete the build-flag swap |
| R4 | No tests anywhere | Certain | Regressions in safety flows ship silently | Start with domain tests (§10.1) |
| R5 | Home's coupling to six features | Medium | A change to Mood's hooks breaks Home | Aggregation use case in the application layer |
| R6 | Business rules in components | Medium | Product rules invisible and unreviewable | Move to domain (§6.2) |

---

## 13. Prioritised gap list

Ordered by risk-reduction per unit of effort. Each item is independently
shippable.

### P0 — safety and correctness

**Status: done (2026-09-24), with one open product question below.**

1. ~~**Add a test runner and test `riskDetection` exhaustively.**~~ **Done.**
   Vitest configured for domain-only tests (`vitest.config.ts`); 61 tests in
   `src/features/ai-companion/models/riskDetection.test.ts`.
2. ~~**Resolve the risk-list duplication (R1).**~~ **Done.** A shared fixture
   (`escalationPhrases.fixture.ts` in the app,
   `tests/fixtures/escalationPhrases.js` in the backend) is asserted by both
   suites. It immediately found five phrases the backend escalated on and the
   app did not — `no reason to live`, `أنهي حياتي`, `أقتل نفسي`,
   `الكل أحسن بدوني`, `أحسن لو ما كنت موجود` — now added to the app detector.
3. ~~**Validate API responses with the existing zod schemas.**~~ **Done,
   rollout complete.** `core/api/contract.ts` (`parseContract` /
   `parseContractList`) now runs on **every** live mapper: mood, journal,
   stress check-ins, professionals, appointments, sleep, hydration, symptom
   checker, content images, and both auth responses. Three feature-local types
   had no schema — `SleepRecordSchema`, `HydrationLogSchema` and
   `CheckerSessionSchema` were written beside the interfaces they validate,
   rather than dumped into `types/models.ts`. No live service maps a response
   without checking it any more.

**Open product question raised by this work:** the app treats
`مش قادر أكمل` ("I can't go on") as full crisis escalation, while the backend
classifies it as `CONCERN` — support text, no hand-off. Both behaviours are
defensible; they should not both be shipped. The phrase is deliberately absent
from the shared fixture until that is decided.

### P1 — structural

**Status: 4, 5 (Mood) and 7 done (2026-09-24). 6 re-estimated, not started.**

4. ~~**Extract domain rules out of components.**~~ **Done.** The sleep↔stress
   rule and its four thresholds now live in
   `features/insights/models/sleepStressCorrelation.ts` with 12 tests, and
   return a structured verdict instead of a translated string.
   `CombinedMetricsCard` is down to 116 lines and holds no rules.
5. ~~**Introduce repository interfaces for two features.**~~ **Done (Mood +
   Professional help).** `MoodRepository`, and `ProfessionalDirectory` +
   `AppointmentRepository` split because their lifetimes differ (reference
   data vs user-owned records). Each has an HTTP and a local implementation;
   both services are now use cases that import **no** implementation.
   `core/composition.ts` is the composition root, called from `App.tsx`.
   Domain rules extracted alongside: `models/moodTrend.ts` and
   `models/availability.ts` (the availability rule had been written twice —
   once per branch). 18 use-case tests run against injected fakes.
6. ~~**Stop importing i18n in services.**~~ **Done, all 9.** `AppError.messageKey`
   + `AppError.withKey()` + `core/errors/errorText.ts` (takes `t` as an
   argument, imports no i18n). 25 throw sites now carry keys; 51 display sites
   across 45 files render them with `errorText(error, t)`; 41 now-unused
   `AppError` imports removed. The five `i18n.language` reads became explicit
   parameters (`search`, `listArticles`, companion/therapy `language`,
   registration `language`), with language added to the affected React Query
   cache keys — those searches match localised labels and had been sharing one
   cache entry across languages. `companionService` also stopped translating AI
   action labels: it returns the key and `AIActionRow` renders it.

   **No service in `src/features/**/services` imports i18n any more.**

7. ~~**Route the six direct-service screens through `state/` hooks.**~~ **Done
   — and the review overstated it.** Only three were real violations:
   `SymptomResultsScreen` imports a pure helper, `SleepAIAutosuggestScreen`
   imports a type, and `ReminderSettingsScreen` uses a device scheduler, not a
   data service. The three genuine ones are fixed via
   `features/profile/state/useProfileMutations.ts` and the existing mood
   mutation.

**Defect found while doing 7:** "Clear my data" wiped MMKV but never cleared
the React Query cache, so already-fetched mood/journal/sleep data kept
rendering after the user was told it was deleted. `useClearMyDataMutation`
now clears server → local → query cache, in that order.

### P2 — hygiene

**Status: all four done (2026-09-24).**

8. ~~Move `riskDetection` to a shared domain location.~~ **Done.** Now
   `src/domain/safety/`, with a `src/domain/README.md` stating the rule for
   what belongs there (framework-free, and only once a second feature needs
   it). It turned out to have **five** consumers, not three — symptom-checker
   imported it too, which the original review missed.
9. ~~Delete the empty `validation/` directories.~~ **Done** — 14 empty
   directories removed (not just `validation/`: `insights/components`,
   `onboarding/components`, `profile/models`, `safety/services`,
   `safety/state` were also empty scaffolding).
10. ~~Extract a shared `fakeDelay` convention.~~ **Done.**
   `core/async/simulateLatency.ts`, replacing 14 private copies plus the two
   in the new local repositories. `companionService`'s own `delay()` was
   deliberately left: it paces streamed tokens and the "thinking" beat, which
   is UX behaviour, not simulated latency.
11. ~~Give Home an aggregation use case.~~ **Done.**
   `features/home/state/useCombinedMetrics.ts` owns the fan-out across Mood,
   Stress and Sleep and returns a view model. `CombinedMetricsCard` went from
   134 lines with six cross-feature imports to 94 lines with **zero** — its
   only remaining `../../` imports are `ui/` and `navigation/`.

### Explicitly *not* recommended

- A full layer-first restructure. The feature-first tree is a strength.
- Interfaces for every service. Abstract where a test double or a second
  implementation genuinely exists (repositories, TTS, storage) — not by rote.
- Rewriting `state/` into custom use-case classes. React Query is already
  doing that job well.

---

## 14. Final review

**What is genuinely good:** the feature-first structure, the thin and
consistent React Query layer, `core/`'s boundaries, the token/cache storage
split, the TTS and avatar interfaces, the design-token discipline, the
Arabic-first i18n, and a documented-assumptions culture that is rare in a
codebase this young.

**The one structural problem:** `services/` is four layers fused into one
file, selected by a build flag. Every P0/P1 item above is a consequence of
that single decision. Fixing it for two features first, then rolling the
pattern out, addresses most of this document.

**The one non-negotiable:** an app that detects self-harm language must have
tests for that detection. It currently has none.
