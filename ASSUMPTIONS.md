# Assumptions & Stubs

## Figma-as-structure-only UI pass

A request came in to build/align screens using the "SH Freud UI Kit v1.7"
Figma file as a **structure/content reference only**, with all visual
styling coming exclusively from Sakina's own tokens/primitives. Figma's
`get_metadata`/`get_design_context` tools returned "you don't have edit
access to this file" for the given URL (the Figma MCP requires editor
access, not just view; `whoami` confirmed auth otherwise works). Per that
task's own fallback instruction, screen structure/content instead came from
`mobile-engineering-spec.md` (§12–§21 per-screen sections, §36 screen
inventory) and `product-definition.md` (§6 workflows, §13 MVP scope).

A full screen-by-screen audit at the start of that pass found every MVP
screen already real and already 100% token-driven for colors/fonts (zero
hardcoded hex values or raw `fontFamily` strings anywhere) — this was not a
from-zero build. The pass closed the remaining gaps:
- Tokenized the handful of raw spacing/sizing numbers that had leaked past
  the token system in a few screens and primitives (new `src/ui/tokens/
  sizes.ts` for the 44pt touch-target / 40pt control-height constants used
  across `Button`, `IconButton`, `SegmentedControl`, `Tabs`, `TextField`).
- Built real `WelcomeScreen`/`IntroductionScreen` (previously thin wrappers
  around the temporary `PlaceholderScreen` scaffold) and deleted
  `PlaceholderScreen.tsx` per its own "delete once every screen is real"
  comment.
- Made `WellnessHomeScreen`'s empty-category state use the shared
  `EmptyState` primitive, matching every other list screen.

**Scope conflict, resolved per "specs win":** Figma's kit likely has
Insights and Professional-Help frames, but `product-definition.md` §13 and
this file (below) explicitly defer both from MVP — left unbuilt.

## Splash screen

Native `expo-splash-screen` only supports a static image (no animation
API), so the branded animation is a custom JS overlay (`src/ui/splash/
AnimatedSplash.tsx`) shown the instant the native splash is dismissed —
verified its `app.json` plugin config shape against the plugin's own
`.d.ts` (`image`/`imageWidth`/`resizeMode`/`backgroundColor`/`dark`), not
guessed. It reuses the Wellness breathing-halo motif for brand consistency,
respects reduced-motion, and its exit is gated on real app-readiness
(fonts + session restore) with a minimum visible time so it never flashes.
No `[ASSUMPTION]` here — this is pure engineering, not a content/business
gap. `assets/splash-icon.png` is the default template icon; swap it for a
real Sakina mark when one exists.


## Consistency pass (post Phase 9)

A cross-phase sweep found and fixed a real inconsistency: Authentication and
AI Companion screens used i18n keys throughout (spec §9 requires testing
both Arabic RTL and English LTR), but Mood, Wellness, Onboarding (Goals/
Intro/Consent), Home, and Safety had hardcoded Arabic UI-chrome strings —
meaning English-language mode would have shown broken mixed-language
screens in those features. Fixed by moving every such string into
`ar.json`/`en.json`; content-catalog fields (mood/emotion/trigger/exercise/
safety-resource labels selected via an `isArabic` ternary against
`labelAr`/`labelEn` pairs) were already correct and left as-is — that's a
deliberate, different pattern (data, not UI copy) and not a bug. Also added
English variants (`descriptionEn`, `titleEn`) to two content models
(`wellnessContent.ts`, `safety/models/resources.ts`) that only had Arabic
fields. Also normalized all four mock services (auth/mood/journal/companion)
to the same "loud failure if `config.useMockServices` is flipped without a
real implementation" guard — only `authService` had it before.


Tracks every `[ASSUMPTION]` placeholder in the codebase and the open decision
it's waiting on (see `docs/product-definition.md` → "Open Questions to
Resolve Before SRS" for the full list). Updated as each phase adds stubs.

## Confirmed in Phase 0

- **App identity**: name "Sakina", bundle id `com.sakina.app` — a working
  name chosen for scaffolding, not a confirmed final brand decision.

## Added in Phase 1 (design system)

| Stub | Location | Waiting on |
|---|---|---|
| ~~Thmanyah font files are not in the repo.~~ **Resolved:** real `.otf` files (Sans Regular/Medium/Bold, Serif Display Regular, Serif Text Regular) added under `assets/fonts/`, wired into `useAppFonts.ts` and the `expo-font` plugin config in `app.json`. | `src/ui/fonts/useAppFonts.ts`, `assets/fonts/README.md`, `app.json` | Done. |
| Dark-mode palette (`darkPalette` in `src/ui/tokens/colors.ts`) is derived by extrapolating the light palette's hue relationships — the spec only supplies light-mode hex values. | `src/ui/tokens/colors.ts` | Confirm dark palette against the SH Freud Figma reference once available. |

## Added in Phase 2 (app shell)

| Stub | Location | Waiting on |
|---|---|---|
| No backend exists, so `apiClient`'s refresh-token flow calls a placeholder `POST {apiBaseUrl}/auth/refresh` and `authStore.restoreSession()` trusts a stored token instead of calling a real `/me` endpoint. | `src/core/api/client.ts`, `src/core/auth/authStore.ts` | Real backend contract (Open Question #4). `config.useMockServices` gates all of this — flip it once a backend exists. |
| Login screen performs a mock, always-succeeding sign-in (no form, no validation) purely to make the Onboarding→Auth→App routing gate real and testable. | `src/features/authentication/screens/LoginScreen.tsx` | Replaced wholesale by the real Authentication feature (Phase 3, build order item 1) — RHF+Zod form, real error/loading states. |
| Register/ForgotPassword/ResetPassword, and all Onboarding step screens (Language excepted — that one is real) are navigation-only placeholders with no real content or form. | `src/features/authentication/screens/*`, `src/features/onboarding/screens/*` | Phase 3 build order items 1–2. |
| Onboarding Goals/Baseline screens have no real question content — the goal taxonomy and baseline questionnaire aren't specified in either source doc. | `src/features/onboarding/screens/GoalsScreen.tsx`, `BaselineScreen.tsx` | Content/taxonomy decision, not just a UI build. |
| Consent screen's copy is structural placeholder text, not real legal/consent language. | `src/features/onboarding/screens/ConsentScreen.tsx` | Legal review — real consent copy must replace it before ship. |
| Emergency/crisis phone numbers are placeholders (911 / 110), clearly marked in code and UI. | `src/features/safety/models/resources.ts` | Verified, current numbers for Jordan (product-definition.md §21). |
| A `features/safety` module was added (not present in the original Phase-0 folder list) since Safety & Emergency is its own product-definition module (#10) that Home and Profile both need a real route into. | `src/features/safety/` | None — this is a structural fix, not an open question. |

## Added in Phase 3 (Authentication feature)

| Stub | Location | Waiting on |
|---|---|---|
| Full mock backend: register/login/forgot/reset now work end-to-end against an MMKV-persisted fake user table instead of a placeholder always-succeeding login. Passwords are stored in **plain text** and reset tokens are an unencoded `mock-reset:<email>` string — neither is real security. | `src/features/authentication/services/authService.ts` | Real backend (Open Question #4). The exported function signatures are the contract the rest of the app depends on; swap the implementation, not the callers. |
| `authService` throws a loud `AppError` if `config.useMockServices` is ever flipped to `false`, since no real branch is wired up yet — this is intentional, not a bug, so the flip doesn't silently keep hitting mock data. | same file | Same as above. |
| `authStore.restoreSession()` now also restores the last-known user profile from an MMKV cache (written at login/register time) instead of calling a real `/me` endpoint. | `src/core/auth/authStore.ts` | Real session-restore endpoint. |

## Added in Phase 4 (Onboarding feature)

| Stub | Location | Waiting on |
|---|---|---|
| Goals taxonomy (7 goals) and a 4-question baseline questionnaire are drafted content, not a confirmed clinical/product decision — user-approved to draft rather than leave placeholder (see conversation). | `src/features/onboarding/models/onboardingContent.ts` | Clinical/content review before ship. |
| Goals/Baseline answers are persisted locally (MMKV) but have no consumer yet — Insights (which would use them) is deferred from MVP. | `src/features/onboarding/state/onboardingAnswersStore.ts` | Insights feature build. |
| Consent screen has a real functional gate (explicit toggle required to continue) but the copy itself is placeholder, not reviewed legal text. | `src/features/onboarding/screens/ConsentScreen.tsx` | Legal review (same item as Phase 2's note, now with a stronger UX gate). |

## Added in Phase 5 (Mood feature)

| Stub | Location | Waiting on |
|---|---|---|
| Mood-level scale (5 levels), emotion catalog (10), and trigger catalog (9) are drafted content, not a confirmed clinical taxonomy — same treatment as onboarding Goals/Baseline. | `src/features/mood/models/moodContent.ts` | Clinical/content review before ship. |
| Mock mood-entry persistence (MMKV), same pattern as auth — swap for real `apiClient` calls once a backend exists. | `src/features/mood/services/moodService.ts` | Real backend (Open Question #4). |
| `MoodChart` is a hand-rolled `react-native-svg` bar chart (spec §15 allows either `victory-native` or `react-native-svg`) rather than victory-native, to avoid pulling its full Skia-based Cartesian-chart API for a simple 7/30-point trend. | `src/features/mood/components/MoodChart.tsx` | Revisit if richer chart interactions (zoom/tooltips) are needed later. |

## Added in Phase 6 (AI Companion feature)

| Stub | Location | Waiting on |
|---|---|---|
| No LLM provider is chosen. Replies are canned/keyword-matched text, "streamed" word-by-word client-side to exercise the real streaming UI contract (`onToken` callback). | `src/features/ai-companion/services/companionService.ts` | Real LLM provider decision (Open Question #4). |
| **Risk-detection is a minimal keyword heuristic**, not a clinical policy — it exists so the business rule ("must escalate when risk language appears") has *some* real enforcement rather than none, triggering a pinned `SafetyBanner` linking to the Safety screen. This is explicitly NOT adequate for production. | `src/features/ai-companion/models/riskDetection.ts` | A real (ideally server-side, ideally clinician-reviewed) risk-detection and escalation policy — product-definition.md Open Question #3, the single most safety-critical open question in the whole spec. |
| Single default conversation only (no multi-conversation list/switching) — spec doesn't require multiple conversations for MVP. | `src/features/ai-companion/services/companionService.ts` | None — a scope choice, not a blocked decision. |
| FlashList v2 replaced FlatList's `inverted` prop with `maintainVisibleContentPosition`/`startRenderingFromBottom` — caught via a real type error, not guessed. | `src/features/ai-companion/screens/ConversationScreen.tsx` | None — resolved. |

## Added in Phase 7 (Journaling feature)

| Stub | Location | Waiting on |
|---|---|---|
| 5 guided journal prompts are drafted content, not a confirmed content decision — same treatment as Onboarding/Mood catalogs. | `src/features/journal/models/journalContent.ts` | Content review before ship. |
| Mock CRUD persistence (MMKV), same pattern as auth/mood/companion. | `src/features/journal/services/journalService.ts` | Real backend (Open Question #4). |
| AI reflection is built as a real, gated UI slot (`AIReflectionCard`) behind `config.featureFlags.aiJournalReflection` (currently `false`) rather than omitted — shows a clearly-labeled "coming soon" state. Matches spec §17's explicit "AI Reflection optional/stubbed." | `src/features/journal/components/AIReflectionCard.tsx` | AI Companion's LLM provider decision, since reflection would reuse it. |
| Delete confirmation uses `Alert.alert` (spec §17 allows "Alert or BottomSheet") rather than a custom BottomSheet, to keep it a true OS-native confirmation for a destructive action. | `src/features/journal/screens/JournalEntryScreen.tsx` | None — a deliberate choice, not a blocked decision. |

## Added in Phase 8 (Wellness feature)

| Stub | Location | Waiting on |
|---|---|---|
| 3 exercises across breathing/grounding/relaxation are drafted content (satisfies MVP scope's "breathing + 1-2 other categories"), not confirmed clinical content. Meditation/stressRelief/sleep categories exist in the taxonomy but have no exercises yet — the UI shows "coming soon" rather than being empty/broken. | `src/features/wellness/models/wellnessContent.ts` | Content/clinical review before ship. |
| "Preparation" and "Completion" are phases inside one `ActiveExerciseScreen` rather than separate routes — a deliberate flow consolidation (the spec lists them as flow steps, not confirmed as distinct screens) so state (timer, keep-awake) doesn't have to cross a navigation boundary mid-exercise. | `src/features/wellness/screens/ActiveExerciseScreen.tsx` | None — a deliberate choice, not a blocked decision. |
| The breathing circle's pulse animation runs entirely on the UI thread via Reanimated (`withRepeat`/`withSequence`/`withTiming`), per spec §18's explicit "not JS setInterval" requirement. A separate 1Hz JS interval exists only to update the phase *text label* and the numeric countdown — it drives no animated value, so it doesn't violate that requirement. | `src/features/wellness/components/BreathingVisualizer.tsx`, `ExerciseTimer.tsx` | None — documented reasoning, not a gap. |

## Added in Phase 9 (Profile & Settings feature)

| Stub | Location | Waiting on |
|---|---|---|
| "Clear my data" is a real local-only delete (wipes MMKV mock stores for mood/journal/chat/onboarding answers) — genuinely deletes what this build persists, not a decorative button. product-definition.md flags data export/delete as an open item (§11, Open Question #5) because no backend exists yet to also delete server-side. | `src/core/storage/mmkv.ts` (`clearAllLocalContentData`), `src/features/profile/screens/PrivacyScreen.tsx` | A real backend delete endpoint, once one exists — this local wipe should then also call it. |
| Editing the profile name updates `authStore`'s cached user (and the UI everywhere it's read) but does **not** update the separate mock user table in `authService.ts` — two independent local mocks, not meant to be a permanent design. | `src/core/auth/authStore.ts` (`updateProfile`) | Real backend (Open Question #4) — a single source of truth removes this seam entirely. |
| Notifications toggle in Settings is shown disabled with a "coming soon" label rather than omitted — consistent with Journal's AI-reflection stub pattern, since Notifications is deferred from MVP (product-definition.md §13). | `src/features/profile/screens/SettingsScreen.tsx` | Notifications module build (deferred). |
| Privacy screen's "consent status" is display-only (states the user agreed during onboarding) — there's no revoke-consent flow, since the source specs don't define what revoking consent mid-use should do to already-stored data. | `src/features/profile/screens/PrivacyScreen.tsx` | Product decision on consent-revocation behavior. |

## Added in Phase 10 (Stress Management — complete: Overview/List, Detail, Active Session, Completion/Reflection)

Neither spec doc has a standalone "Stress Management" section — "Stress
Relief" is one of six generic Wellness categories (mobile-engineering-spec.md
§18, product-definition.md §8). This phase promotes it into its own guided
flow per an explicit feature prompt, reusing Wellness's exercise components
(`ExerciseCard`, `ExerciseTimer`, `BreathingVisualizer`,
`ExerciseInstructions`, `ProgressIndicator`) rather than introducing a
parallel design — `StressCompletionScreen` is its own screen instead of
reusing the generic `CompletionState` component directly, since it needed a
mood check-in slot that component doesn't have; it reuses the same copy
keys (`wellness.completionTitle`/`Body`) for consistency. Built across two
checkpoints (Overview/Detail, then Active Session/Completion), with a
Figma-vs-app audit in between that caught one content gap (fixed: a
cognitive-reframing technique) and resolved two open design questions (see
below) before checkpoint 2 started.

| Stub | Location | Waiting on |
|---|---|---|
| `stressTechniques` (5 techniques, incl. a cognitive-reframing one added after a Figma-vs-app audit caught it missing against the original feature prompt's example list) is drafted content, not clinically confirmed — same posture as `wellnessContent.ts`/`onboardingContent.ts`. | `src/features/wellness/stress-management/models/stressContent.ts` | Content/clinical review before ship. |
| `StressSession` is a new model not present in either spec doc — stubbed per an explicit feature-prompt instruction ("not in specs; stub the model + service"). Structural session metadata only (technique/timing), no freeform note field, per the business rule against logging private session content. | `src/features/wellness/stress-management/models/stressContent.ts`, `services/stressService.ts` | No open product question directly maps to this — it's new scope, not a gap in an existing decision. Revisit if/when session history or Insights consumes it. |
| Wellness now has its first service/state layer (`stressService` + `useStressQueries`), following the mock-MMKV-plus-`useMockServices`-guard pattern already used by mood/journal/companion. The generic Wellness exercises (`wellnessContent.ts`) still have no service layer — deliberately left alone, out of this feature's scope. | `src/features/wellness/stress-management/services/`, `state/` | Real backend (Open Question #4) — same as every other mock service. |
| AI Companion's `sendMessage` now returns an optional `suggestion: 'stressManagement'` field — a lightweight, non-clinical topic hint derived from the same keyword match already used for the "stress" conversational reply. This is explicitly **not** a substitute for a real risk-detection/escalation policy; it never fires when `riskDetected` is true, and carries no clinical weight. | `src/features/ai-companion/services/companionService.ts`, `state/useCompanionChat.ts`, `screens/ConversationScreen.tsx` | Open Question #3 (real risk-detection & escalation policy) — this stays a separate, lower-stakes mechanism even after that's resolved. |

**Decisions made during the Figma-vs-app audit (implemented in checkpoint 2):**
- **Quick relief skips Technique Detail and jumps straight into Active Session** — `StressOverviewScreen`'s quick-relief `Card` now navigates directly to `StressActiveSession`, matching the "quick" intent.
- **Active Session carries its own direct Safety button** (top-end, always visible during preparation/active phases) — mid-exercise is a plausible moment for distress, and the ≤2-tap safety rule now holds from every screen in this feature, not just Overview.

| Stub | Location | Waiting on |
|---|---|---|
| `StressCompletionScreen`'s post-session mood check-in writes through the existing `useCreateMoodEntryMutation` (Mood module) with empty `emotionIds`/`triggerIds` — a deliberately minimal quick check-in, not the full Mood check-in flow (mood level only, no emotion/trigger picker), to keep it optional and low-friction right after an exercise. | `src/features/wellness/stress-management/screens/StressCompletionScreen.tsx` | No open question — a deliberate scope choice for this entry point specifically; the full Mood tab flow is unchanged. |
| A `veryLow` post-session mood shows an extra Safety-nudge `Card` (business rule: surface escalation, never "treat" severe stress ourselves) — this is a **content-level heuristic** (one mood tap), much lighter-weight than the AI Companion's keyword-based `containsRiskLanguage`, and not meant to replace it. | `src/features/wellness/stress-management/screens/StressCompletionScreen.tsx` | Open Question #3 (real risk-detection & escalation policy) — same caveat as the Companion's `suggestion` field. |
| `stressService.createSession()` is now actually called (session recorded on reaching Active Session's completion, best-effort — a failed mock write never blocks navigation to Completion). ~~Nothing yet reads `StressSession` records back (no history UI)~~ **Update (Phase 11):** `stressService.listSessions()` now reads them back for Home's "wellness minutes" tracker — see below. | `src/features/wellness/stress-management/screens/StressActiveSessionScreen.tsx`, `services/stressService.ts` | Still no dedicated session-history UI — only aggregate consumption so far. |

## Added in Phase 11 (Home enrich — checkpoint 1 of 4: greeting/search/summary-cards/trackers)

Enriches Home toward the SH Freud "Home & Mental Health Metrics" reference's
*layout richness* — structure only, our own tokens/primitives, and
critically reframed away from the reference's clinical/biometric framing
(`product-definition.md` §11: the AI is a supportive companion, never
diagnostic; §32: health data is sensitive). This is checkpoint 1 of a
4-part build (Home enrich → Reflection detail/explainer/trends → Journal
enrich → entry chooser/capture) — the prompt explicitly asked not to build
it in one pass; parts 2–4 aren't designed yet.

**Clinical → supportive reframes applied (all `[ASSUMPTION — confirm]`):**

| Reframe | Location | Waiting on |
|---|---|---|
| Reference's single AI "Freud Score" (e.g. "80 / Mild Anxiety") → a **non-diagnostic "Wellbeing Reflection"**: a qualitative supportive summary picked from a small set of drafted template sentences by simple mood-trend thresholds (rising/steady/harder/not-enough-data) over the user's own last-14-days mood data — never a score, never a diagnosis label, never "your mood is bad." Same canned-template posture as `companionService`'s replies (no LLM provider chosen yet). | `src/features/home/models/homeContent.ts` (`reflectionTemplates`), `services/homeService.ts` (`getWellbeingReflection`) | Content/clinical review of the template wording before ship; confirm the reframe direction itself is acceptable (flagged "confirm" per the feature prompt). |
| Reference's biometric tracker rows (heart rate, blood pressure, sleep) → **our real signals only**: mood check-in streak, check-ins this week, wellness minutes (from `StressSession` records), journaling days this week. No invented health readings, nothing presented as clinical assessment. Generic (non-stress) Wellness exercises still aren't tracked in "wellness minutes" — they have no persistence layer at all (pre-existing gap, not new). | `src/features/home/models/homeContent.ts` (`TrackerSignal`), `services/homeService.ts` (`getTrackerSignals`), `components/TrackerRow.tsx` | Real backend (Open Question #4) once one exists; revisit if generic Wellness exercises ever get their own persistence. |

**Other stubs/assumptions this checkpoint:**

| Stub | Location | Waiting on |
|---|---|---|
| Home's new search entry has no defined scope/backend in either spec — implemented as a tappable (non-typing) entry into Journal's existing real search (`JournalListScreen`), not a new global-search feature. | `src/features/home/screens/HomeScreen.tsx` | Product decision if a real cross-module search is ever wanted. |
| `homeService.ts` composes `moodService`/`journalService`/`stressService` directly rather than adding its own `config.useMockServices` guard — each underlying service already guards itself, so this pure-derivation layer doesn't repeat it. Not a gap, a deliberate layering choice. | `src/features/home/services/homeService.ts` | None. |
| No new chart library adopted — a second hand-rolled `react-native-svg` component (`Sparkline`) joins `MoodChart`, continuing Mood's own earlier deferral of `victory-native` (installed, still unused everywhere). | `src/features/home/components/Sparkline.tsx` | Revisit both together if richer chart interactions are ever needed (same note as Mood's Phase 5 entry). |

## Added in Phase 12 (Home — accent tokens + animated ring, checkpoint 1 of 3: top bar/carousel)

A follow-up request to the same Home enrich screen (Phase 11), asking for
(a) an extended per-category accent-color system and (b) Lottie animation
infrastructure, while explicitly re-confirming the non-diagnostic reframes
already applied. Sequenced by the request itself: top bar/carousel + color
direction first (this checkpoint), then tracker-list rework, then real
Lottie playback.

**Accent palette — resolved via `AskUserQuestion`, not silently decided.**
The request flagged the palette `[NEEDS INPUT]` and asked to confirm the
direction before applying it everywhere. Presented three candidate
directions (Botanical & warm / Cooler & muted / Warm & earthy); the product
owner picked **"Botanical & warm"**:
```
accent.reflection (gold)      #D9BE8C   — new
accent.mood (sky)             #AEBFC0   — alias of brand.accentSoft
accent.mindful (clay)         #C9A58D   — alias of brand.accent
accent.journaling (moss)      #9CAA85   — new
accent.stress (mauve)         #C6A7B3   — new
```
`src/ui/tokens/colors.ts` (`accentPalette`/`darkAccentPalette`,
`buildSemanticColors()`'s `accent` key). `stress`'s accent token exists
already even though the Stress Level tracker itself isn't built yet
(that's tracker-list-checkpoint scope) — reserved now so the palette is
complete and doesn't need revisiting per-checkpoint.

**Explicit confirmation — automated diagnosis/risk prediction was never
built.** The request's rule 2 ("DO NOT BUILD" automated risk/disorder
screens — no score, no percentage, no diagnosis label) required no code
change: Phase 11's `homeService.ts`/`homeContent.ts` never contained
anything resembling a score or disorder prediction. Stated explicitly here
per the request's own instruction to note this, not just rely on omission.
The new `ConsistencyRing` in `WellbeingReflectionCard.tsx` visualizes
check-in *consistency* (`checkInsLast7 / 7`) as a plain ring — no number,
percentage, or label is rendered on or near it.

| Stub | Location | Waiting on |
|---|---|---|
| **Lottie assets needed** (not yet dropped in — infrastructure/wrapper deferred to the animations checkpoint, after tracker-list rework, per the request's own sequencing): (1) `reflectionRing` — subtle looping ring/breathing loop, replaces the Reanimated `ConsistencyRing` built this checkpoint (which becomes its reduced-motion fallback); (2) `moodConfirm` — short one-shot on saving a mood check-in; (3) `emptyCalm` — friendly looping animation for empty states. | Will live under `assets/lottie/` once added; wrapper will live under `src/ui/` | Real Lottie JSON files from the product owner/design; `lottie-react-native` isn't installed yet (deliberately — a `require()` to a non-existent asset fails at Metro bundle time, not gracefully at runtime, so the dependency and wrapper land together with the first real asset). |
| Tracker-list rework (Mindful Hours relabel, Journaling Streak, and a genuinely new **self-reported Stress Level** — user-set, not measured, per rule 3) is next-checkpoint scope, not started. **Sleep Quality is dropped, not deferred** — we have no real sleep data and the request explicitly forbids inventing clinical readings; the reference row simply has no honest equivalent in our product. | `src/features/home/components/TrackerRow.tsx` (existing 4 rows unchanged this checkpoint) | Self-reported Stress Level needs its own small model + service + input UI (e.g. a segmented control), designed in the next checkpoint. |
| `Badge.tsx` gained an optional `color?: string` override (falls back to its existing `tone` enum) so `accent.*` tokens can be used on status chips without a parallel component. Purely additive — the primitive's other call sites are unaffected. | `src/ui/primitives/Badge.tsx` | None. |

**Tracker-list rework (same checkpoint, done alongside the ring):**

| Change | Location | Waiting on |
|---|---|---|
| "Journaling days" (count in the last 7 days) → **"Journaling streak"** (consecutive days ending today), matching the reference's "Journaling Streak" naming and the same consecutive-day logic already used for mood streak — both now share one `consecutiveStreak()` helper. | `src/features/home/services/homeService.ts` | None — a genuine improvement, not a gap. |
| New **Stress Level** tracker — the reference's "Stress Level (segmented meter)," reframed per this feature's rule 3: **self-reported only, never measured or inferred**. The user taps the row, gets a plain 3-option picker (`low`/`medium`/`high`, `SegmentedControl` in a `BottomSheet`), and sets it themselves — same one-entry-per-day shape as Mood check-ins. This is genuinely new persisted data (first thing `homeService.ts` stores itself, rather than composing other services' data), so it now carries its own `config.useMockServices` guard, matching journal/mood/companion/stress. Sparkline maps low/medium/high to 1/2/3, 0 for days with no entry. | `src/features/home/services/homeService.ts` (`setStressLevel`), `models/homeContent.ts` (`StressLevel`, `stressLevelOptions`), `components/StressLevelRow.tsx` | Content/clinical review of the 3-level framing before ship — same posture as `moodContent.ts`. **Never** to be replaced by an automatic/AI-inferred version — that would re-introduce exactly the "risk score" pattern rule 2 prohibits. |
| **Sleep Quality stays dropped** (not added this checkpoint either) — confirmed again: no real sleep data exists anywhere in the app, and inventing a reading would violate rule 3. | — | Real, opt-in sleep integration would be a distinct future product decision, not a Home-screen styling task. |
| Tracker-row icons now use the `accent.*` palette per category (mood rows → `accent.mood`, mindful minutes → `accent.mindful`, journaling streak → `accent.journaling`, stress level → `accent.stress`) instead of a flat `brand.primary`, tying the confirmed "Botanical & warm" direction through the whole tracker list, not just the carousel cards. | `src/features/home/components/TrackerRow.tsx`, `StressLevelRow.tsx` | None. |
| **Known risk, verified live, not silently hidden:** `@gorhom/bottom-sheet`'s imperative `.expand()`/`.close()` ref API is unreliable on the web target — `StressLevelRow`'s sheet is the app's *first* real usage of the `BottomSheet` primitive (it existed unused before this checkpoint). On web, opening/closing sometimes needed an extra interaction or got stuck mid-transition. The underlying read/write is unaffected — verified end-to-end with a full page reload (`setStressLevel` persisted correctly and survived reload) — this is purely a web animation quirk in a third-party dependency, not a defect in this feature's logic. Native (iOS/Android) is where this library is primarily supported and is untested here (no simulator in this environment). | `src/ui/primitives/BottomSheet.tsx` (pre-existing, unmodified), `src/features/home/components/StressLevelRow.tsx` | Verify on a real iOS/Android build; if the web quirk matters for the web target specifically, consider a simpler inline (non-sheet) picker for `StressLevelRow` as a web-friendly alternative. |

## Added in Phase 12, continued (Lottie — checkpoint 3 of 3: real animations)

Closes the last deferred piece of the "Rich Animated Home" request. Added
`lottie-react-native` (`^7.5.0`) and its web peer dependency
`@lottiefiles/dotlottie-react` — this version of `lottie-react-native`
ships its **own** web implementation (`LottieView/index.web.tsx`, resolved
automatically by Metro per platform), so no separate `lottie-react`/custom
web shim was needed; that avenue was tried and removed once this was
confirmed by inspecting the installed package.

**`src/ui/lottie/AnimatedLottie.tsx`** — the wrapper this request asked
for. Always renders `fallback` instead of the animation when
`AccessibilityInfo.isReduceMotionEnabled()` is true, or if the asset fails
to load (`onAnimationFailure`) — the reduced-motion rule and the "never
leave a broken card" rule share one code path.

**`[ASSUMPTION-stub]` Lottie assets — real placeholder JSON, not TODOs.**
Rather than leave `require()` calls pointing at files that don't exist
(which fails at Metro's bundle step, not gracefully at runtime — the
reason this was deferred across the earlier two checkpoints), I hand-
authored three minimal, valid Bodymovin/Lottie JSON files directly and
verified each renders correctly in the browser before wiring it in:

| Asset | Used in | What it is |
|---|---|---|
| `assets/lottie/reflectionRing.json` | `WellbeingReflectionCard` | A looping soft "breathing" ring glow, layered *behind* the existing data-driven Reanimated `ConsistencyRing` (which stays the actual progress indicator — Lottie can't encode the real check-in-consistency value, so it's ambient motion only, not a replacement). |
| `assets/lottie/moodConfirm.json` | `MoodCheckInScreen`'s success view | A one-shot (`loop={false}`) gentle circle "pop" on saving a mood check-in. Fallback: the saved mood's own emoji, so confirmation is never blank. |
| `assets/lottie/emptyCalm.json` | `WellnessHomeScreen`'s "coming soon" category `EmptyState` | A slow looping soft circle, passed through `EmptyState`'s existing `icon` slot — no change needed to that primitive. |

These are colored with fixed RGB values baked into the JSON (gold/green/
soft-blue, matching the confirmed "Botanical & warm" direction) — a real
limitation versus true theme tokens: they can't react to light/dark mode
the way `theme.colors.*` does. Acceptable for placeholder assets; **when
real designer-authored Lottie files replace these, prefer ones authored
(or re-colorable) per current theme, or keep using `colorFilters` (already
in `LottieViewProps`, unused so far) to remap colors at runtime instead of
re-authoring JSON by hand.**

**Real bug found and fixed during live verification, not left in:**
`lottie-react-native`'s `style` prop is native-only (`@platform ios,
android, windows` per its own type doc) — its web implementation reads a
separate `webStyle` prop instead, which `AnimatedLottie` wasn't forwarding
at first. Result: on web, the ring/empty-state animations rendered at
their raw 200×200 asset size instead of the intended small icon size (a
huge gray circle overrunning the empty state, confirmed via screenshot).
Fixed by passing the same plain style object as both `style` and `webStyle`
(cast, since `ViewStyle`/`CSSProperties` aren't structurally identical
types) — verified fixed with a fresh reload afterward. `src/ui/lottie/
AnimatedLottie.tsx`.

| Stub | Location | Waiting on |
|---|---|---|
| All three Lottie assets are hand-authored engineering placeholders (single shape layer, simple keyframe animation) — not real designer output. Functionally real (valid, tested, wired in), but not the final visual polish. | `assets/lottie/*.json` | Real assets from design/the product owner — swap the file, keep the same `require()` call sites. |

## Added in Phase 13 (Wellness Trackers + Stress Management — checkpoint 1 of 6: Hydration)

A large 4-part request (Hydration/Steps/Mindfulness trackers + an expanded
Stress Management reflection flow), sequenced by the request itself:
Hydration → Steps → Mindfulness → Stress overview → reflection flow →
suggestions/session. This entry covers Hydration in full; the rest aren't
built yet.

**Accent palette — resolved via `AskUserQuestion` again**, extending the
confirmed "Botanical & warm" family: `accent.hydration` (teal, `#9DBFBB`)
and `accent.steps` (terracotta, `#CFA07C`) added to `src/ui/tokens/
colors.ts`. `steps` isn't consumed until the Steps checkpoint but is added
now so the palette is complete.

**Architecture decision (no code yet, recorded for the later Stress
checkpoints):** Part B's guided reflection flow (stressors → sentence-
completion → impact slider → pick-3-coping-actions) is **not** a parallel
system — per this request's own instruction, it will be a new entry path
that *recommends* an existing technique and hands off into the
already-built `StressActiveSession`/`StressCompletion`, not a duplicate
session/timer. Similarly, "Stress overview"'s 1–5 self-reported stress
dial and Home's existing 3-level `StressLevelRow` (Phase 12) are the same
underlying self-report — widening it to 5 levels, read from both places,
avoids two parallel "stress level" concepts. Both decisions are scoped to
the Stress-overview checkpoint, not done now.

**Mandatory reframes — recorded now as forward commitments, even though
the parts they govern (Steps/Mindfulness/Stress-reflection) aren't built
yet, per this request's explicit "note explicitly" instruction:**

| Reframe | Confirmed status |
|---|---|
| **"Freud Score" economy removed.** No score deltas, no point-valued suggestions, no "+N score" anywhere. | True today — grepped the codebase; nothing scored exists. Completion celebrations (already shipped in `StressCompletionScreen`) use supportive copy + "you did this" acknowledgement only, the pattern to keep for Steps/Mindfulness too. |
| **Face-expression capture omitted entirely.** No camera-based emotion inference — explicitly out per `product-definition.md` §32 and this request's rule 3. | Committed — no screen, route, or model for it exists or will be added. |
| **No food-ranking table.** Mindful eating will be one activity/practice card among others, never a ranked "eat X for stress" list. | Committed — applies when the Mindfulness hub is built. |
| **Steps: no diagnostic line.** Step counts get neutral progress-to-goal copy only, never a mental-health verdict on an activity number. | Committed — applies when Steps is built. |

**Hydration stubs:**

| Stub | Location | Waiting on |
|---|---|---|
| `[ASSUMPTION]` Drink sizes (150/250/500ml) and the 2000ml default daily goal are reasonable draft content, not a confirmed nutritional recommendation. | `src/features/wellness/hydration/models/hydrationContent.ts` | Content review before ship — same posture as `wellnessContent.ts`. |
| `[ASSUMPTION-stub] HydrationLog` — new model, not in either spec doc, stubbed per this request. Mock MMKV persistence (`storageKeys.mockHydrationLogs`), same `config.useMockServices`-guarded pattern as journal/mood/stress/home. The daily goal (`storageKeys.hydrationGoalMl`) is a real local preference, not mock content — deliberately excluded from `clearAllLocalContentData()`. | `src/features/wellness/hydration/services/hydrationService.ts`, `core/storage/mmkv.ts` | Real backend (Open Question #4) — same as every other mock service. |
| New Lottie asset `assets/lottie/waterShimmer.json` — same hand-authored, tested-before-wiring-in placeholder standard as the previous three. Used as ambient motion behind `WaterFillGauge`'s real, data-bound Reanimated fill — not bound to `progress` on the Lottie itself, since that prop is native-only (`dotlottie-react`'s own web implementation warns it's unsupported on web). | `assets/lottie/waterShimmer.json`, `src/features/wellness/hydration/components/WaterFillGauge.tsx` | Real asset from design. |
| Home-recommendation and Companion-escalation entry points for Hydration are **not** wired yet — only the `WellnessHomeScreen` card. Adding one new Home card per tracker before Steps/Mindfulness exist would clutter Home prematurely. | — | Revisit once more trackers exist to recommend among (per this request's own "wire into Home recommendation" line, better satisfied with more than one tracker). |

## Sleep Quality sub-feature (`features/wellness/sleep`)

Built on request from the SH Freud UI Kit v1.7 "Sleep Quality" flow, "with
RTL, our font system and colors, and the same flow." Same Figma-access
situation as every earlier pass (community file, no editor permission — the
Figma MCP needs editor, not view), so the flow is reproduced with **100%
Sakina tokens/primitives** and bilingual (ar/en) content; **no visual value
is taken from Figma**. The whole flow is registered on `WellnessStack` and
entered from a new `WellnessHomeScreen` card.

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow reproduced: dashboard → fan chart → new schedule (manual / AI autosuggest) → set goal → set schedule + alarm → confirm → created → my schedule → sleep session → summary → history → detail → AI-suggestion detail (14 screens). | `src/features/wellness/sleep/screens/*` | — |
| `[ASSUMPTION]` All sleep copy (statuses, AI suggestions, benefits, steps, questionnaire) is reasonable draft content, **not** a confirmed clinical decision — same posture as `wellnessContent.ts`/`stressContent.ts`. Content-catalog fields use the `isArabic ? …Ar : …En` pattern; all UI chrome is i18n keys (`sleep.*`). | `src/features/wellness/sleep/models/sleepContent.ts`, `i18n/locales/{ar,en}.json` | Content/clinical review before ship. |
| `[ASSUMPTION-stub]` No backend — records are mock + seeded (5 sample nights) via MMKV (`storageKeys.mockSleepRecords`), same `config.useMockServices`-guarded pattern as journal/mood/stress/hydration; cleared by `clearAllLocalContentData()`. Schedules (`storageKeys.sleepSchedules`) are a **real local preference** (bed/wake/alarm), deliberately excluded from the content wipe. | `src/features/wellness/sleep/services/sleepService.ts`, `core/storage/mmkv.ts` | Real backend (Open Question #4). |
| Stage split, per-night rating, score impact, and the AI recommendation are derived with a light deterministic model (no sleep sensors exist); the sleep session measures **real elapsed time**, not a simulated full night. | `sleepService.ts` (`createRecord`, `recommend`), `SleepSessionScreen.tsx` | Real tracking source, if ever added. |
| New desaturated `accent.sleep` lavender token (light + dark), added the same way `accent.hydration` was. Stage/rating colors map onto existing brand/accent/status tokens via `sleepColors.ts` — no raw hexes in screens. | `src/ui/tokens/colors.ts`, `sleep/components/sleepColors.ts` | — |
| Charts use raw `react-native-svg` (no chart library — spec §15, same as MoodChart/Sparkline). The fan `SleepStageChart` mirrors its segment order under `I18nManager.isRTL`; `SleepRing` is a proportion so needs no flip; `SleepStageBar` relies on RN's automatic row flip. | `sleep/components/{SleepStageChart,SleepRing,SleepStageBar}.tsx` | — |
| Time is chosen via accessible ±-steppers/chips rather than a scroll wheel or clock dial (the design's dial is a visual affordance; steppers keep the 44pt touch-target / a11y rule and avoid a new gesture dependency). | `SleepGoalScreen.tsx`, `SleepScheduleSetupScreen.tsx` | Revisit if a real time-picker component is adopted. |

## Mood Tracker — richer flow (`features/mood`)

Built on request from the SH Freud UI Kit v1.7 "Mood" flow, "with RTL, our
font system and colors, and the same flow." A Mood feature already existed
(a 3-screen check-in/history), so this **extends it in place** rather than
duplicating — the tab, the model/service contract, and every existing
consumer (Home, GreetingHeader, StressCompletion cross-module write) keep
working. Same Figma-access situation as the Sleep pass (community file, no
editor permission), so the flow is reproduced with **100% Sakina tokens/
primitives** and bilingual (ar/en) content; **no visual value is taken from
Figma**.

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow reproduced: dashboard → mood selector → why (self-report scales + note) → who → where → completed → history (list + calendar) → detail → filter → overview → insights → AI-suggestion detail → share (13 screens). | `src/features/mood/screens/*` | — |
| The check-in was **rebuilt** from Mood→Emotion→Trigger→Note (spec §14) to the Figma flow (mood → why → who → where). `emotionCatalog`/`triggerCatalog` and `buildCheckInSchema` are retained (still used by history cards / old entries) but no longer part of the new wizard. | `MoodCheckInScreen.tsx`, `models/moodContent.ts`, `validation/schemas.ts` | Reconcile spec §14 vs this design with product. |
| `MoodEntry` gained **optional** `companionIds`, `locationLabel`, and `metrics` (active/eat/stress 1-10, sleepQuality bad/ok/good) — backward-compatible; old entries are read-guarded (`companionIds ?? []`). Location is a **typed place label only, never GPS** (per the design's "we don't track your location"). | `types/models.ts`, `moodService.ts`, `MoodDetailScreen.tsx` | Real backend (Open Question #4). |
| Mood scale labels changed from "Very low→Very good" to the design's emotional naming (Depressed→Overjoyed). The five `MoodLevel` values are unchanged, so charts/weights and all consumers are unaffected. | `models/moodContent.ts` | Content/clinical review before ship. |
| `[ASSUMPTION]` `companionCatalog`, `metricScales`, and `moodSuggestions` (Better Mood Management) are draft content, not a confirmed clinical protocol — same posture as sleep/stress content. AI-suggestion copy uses the `isArabic ? …Ar : …En` catalog pattern. | `models/moodContent.ts` | Content/clinical review. |
| The Figma sliders are implemented as an accessible tappable `ScaleSelector` (keeps the 44pt target, RTL via row flip) rather than a thumb-slider needing a new gesture/dep. Sleep quality uses the existing `SegmentedControl`. | `components/ScaleSelector.tsx`, `MoodCheckInScreen.tsx` | Revisit if a slider component is adopted. |
| Charts use raw `react-native-svg` (no chart library): `MoodCurve` reverses node order under RTL, `MoodCalendar` reverses columns/headers under RTL, `MoodBubbles`/distribution are token-driven Views. Mood→color via `moodColors.ts` (accent/status tokens, no raw hexes). | `components/{MoodCurve,MoodCalendar,MoodBubbles,moodColors}.tsx` | — |
| Filter is **self-contained** (criteria + live matching count + inline results); no global filter store threaded through nav. Overview/Insights stats are derived from real local history. | `MoodFilterScreen.tsx`, `MoodOverviewScreen.tsx`, `MoodInsightsScreen.tsx` | — |
| `[ASSUMPTION]` "Share Mood" uses illustrative **mock** friends and both React/Invite are **local-only** (a toast) — nothing leaves the device (no social graph/backend, and no external send without explicit user action). | `MoodShareScreen.tsx` | Real social backend + an explicit share/consent step, if this ships. |

## AI Mental Illness Symptom Checker (`features/symptom-checker`)

Built on request from the SH Freud UI Kit v1.7 "AI Symptom Checker" flow,
"with RTL, our font system and colors, and the same flow." Lives under the
Companion (AI) area — the Companion stack was expanded and `CompanionTab`
made deep-linkable; entry points are a Home card and a header CTA on the
Conversation screen. Same Figma-access situation as the earlier passes
(community file, no editor), so the flow is reproduced with **100% Sakina
tokens/primitives** and bilingual (ar/en) content; **no visual value is
taken from Figma**.

**⚠️ Safety is the defining constraint of this feature:**
- **Not a diagnosis.** Every results/detail surface renders `NonDiagnosticNote`, and the intro leads with the disclaimer. Copy avoids clinical-verdict language ("insight/relevance factor", not "diagnosis").
- **Risk → real support.** Free text (mood description, reason, self-harm answer) is scanned with the app's existing `containsRiskLanguage`; the guided self-harm step **always** shows `RiskSupportCard` routing to the existing `SafetyScreen` (`ProfileTab → Safety`), and escalates the note further if risk language is detected. This reuses — does not fork — the app's safety infra.
- **No biometric capture.** The Figma "scan your face" step is implemented as an **intentionally illustrative, privacy-preserving** card that captures/analyzes nothing (no camera, no upload). Documented in-screen.

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow reproduced: intro → method (manual / chatbot) → symptoms + finding score → extra info → analyzing → possible conditions → condition detail (Details/Treatment); guided Dr. Freud chatbot → analyzing → results → session complete → session history (11 screens). | `src/features/symptom-checker/screens/*` | — |
| `[ASSUMPTION]` The symptom/condition/therapist catalogs, "risk factor", "severity", "likelihood", and "how common" are **illustrative, non-clinical DRAFT** content, and the matching is a deterministic `rankConditions` overlap heuristic — NOT a medical model (product-definition.md Open Questions #2/#3/#4). | `models/checkerContent.ts` | Clinician-reviewed taxonomy + model before ship. |
| `[ASSUMPTION-stub]` No backend — sessions are mock (MMKV `mockCheckerSessions`), same `config.useMockServices`-guarded pattern as the other services; cleared by `clearAllLocalContentData()`. In-progress inputs use a transient zustand store (`useCheckerStore`), same pattern as onboardingAnswersStore. | `services/checkerService.ts`, `state/useCheckerStore.ts`, `core/storage/mmkv.ts` | Real backend (#4). |
| Risk detection reuses the AI Companion's keyword heuristic (`containsRiskLanguage`) — itself a flagged placeholder (Open Question #3), never a clinical risk tool. The UI compensates by *always* offering support on the self-harm step regardless of detection. | `services/checkerService.ts` (`flagsRisk`), `CheckerChatbotScreen.tsx` | Real, ideally server-side clinician-reviewed risk policy. |
| Therapist suggestions are a **read-only** illustrative directory — Professional Help booking stays deferred (`config.featureFlags.professionalBooking=false`), so no booking action is wired. | `models/checkerContent.ts`, `ConditionDetailScreen.tsx` | Professional Help phase. |
| The standalone 3D "Browse Symptom" body-map frame is intentionally **omitted** (no body-model asset; symptom search + chips covers selection). Time pickers/sliders use accessible steppers/`SegmentedControl`, not thumb-sliders (no new gesture dep). | — | Revisit if a body-map/slider component is adopted. |
| Charts/bars use token-driven Views + `@expo/vector-icons` only (no chart lib); progress bars/"N-in-10" flip under RTL via RN's automatic row flip. Severity/match → color via `checkerColors.ts` (status/accent tokens, no raw hexes). | `components/CheckerBits.tsx`, `components/checkerColors.ts` | — |

## Real AI integration — AI Companion (Claude via a proxy)

Wired the AI Companion to optionally use **real Claude** instead of the mock,
via a **backend proxy** — because the Anthropic API key must never live in the
mobile bundle (it would be extractable from every install). The app calls the
proxy through the existing `apiClient`; the proxy holds the key.

| Decision | Where | Notes |
| --- | --- | --- |
| Per-feature flag `featureFlags.aiCompanionLive` (default **false**, `EXPO_PUBLIC_AI_COMPANION_LIVE`) selects live vs mock — **not** the global `useMockServices`, so real AI can be enabled for the Companion alone while every other service stays mock. | `src/config/index.ts`, `companionService.ts` | Other features stay mock until their own provider/policy is resolved (Open Questions #2/#3/#4). |
| `companionService` keeps one contract (`getMessages`/`sendMessage`) with mock + live branches; live POSTs history to `apiBaseUrl + companionApiPath` and returns `{ reply }`. History still cached in MMKV (no history backend). | `companionService.ts` | — |
| Streaming is **simulated client-side** (`streamOut`) rather than SSE — RN fetch streaming is unreliable across platforms; the proxy returns the full reply and the app reveals it word-by-word, preserving the existing streaming UI contract. | `companionService.ts` | Swap for real SSE if/when a robust RN transport is chosen. |
| **Safety kept in both branches:** `containsRiskLanguage` runs client-side and short-circuits to the supportive crisis reply **without** calling the model; the proxy repeats the check server-side (defense-in-depth). Still the placeholder keyword detector — Open Question #3 (real clinician-reviewed policy) is unresolved. | `companionService.ts`, `server/companion-proxy/index.js` | Must be replaced before real users. |
| Reference proxy scaffold (Express + `@anthropic-ai/sdk`, `claude-opus-5`, non-clinical Arabic-first system prompt) lives outside the app build. **Not deployed** — it's a runnable starting point. | `server/companion-proxy/` | Deploy + set env vars per its README; add auth + rate-limiting before ship. |
| The other "AI" features (symptom checker `analyze`, sleep `recommend`, mood/sleep suggestions) intentionally **stay mock** — the checker especially needs a clinician-reviewed model first. Each is a single service function ready to be pointed at a proxy the same way. | `checkerService.ts`, `sleepService.ts` | Clinical review + provider decision. |

## Lottie animations in the new features

Wired `AnimatedLottie` into the animated moments of the Sleep, Mood, and
Checker flows, following the existing placeholder standard (hand-authored,
brand-colored, always with a static fallback for reduced-motion / load
failure — the previous emoji/spinner becomes the fallback):

- New placeholder assets `assets/lottie/{sleepMoon,aiThinking,celebrate}.json` — same "hand-authored, swap for a real design asset before ship" posture as `emptyCalm`/`waterShimmer`/`moodConfirm`/`reflectionRing`.
- `sleepMoon` → Sleep session "good night"; `aiThinking` → Sleep AI-autosuggest "compiling" + Checker "analyzing"; `celebrate` → Sleep schedule created + Checker session complete; existing `emptyCalm` → the new Sleep/Mood/Checker history empty states; existing `moodConfirm` → Mood check-in completion (already wired).
- All reduced-motion-safe via `AnimatedLottie`'s built-in `AccessibilityInfo` check + `fallback`.

## AI Therapy Chatbot — "Doctor Freud AI" (`features/ai-therapy`)

Built on request from the SH Freud UI Kit v1.7 "AI Chatbot" flow. A
**multi-conversation** manager (distinct from the single-conversation AI
Companion), placed under the Companion (AI) stack; entry via a Home card. Same
Figma-access situation as the earlier passes; reproduced with **100% Sakina
tokens/primitives** and bilingual (ar/en) content — no Figma visual values.
**Reuses** the Companion's chat primitives (`MessageBubble`, `TypingIndicator`,
`ChatInput`), the shared `containsRiskLanguage` detector, the Claude proxy
wiring (`aiCompanionLive`), and the Lottie system.

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow reproduced: intro → dashboard → chats list (Recent/Trash) → new-conversation config → per-conversation chat (emotion tags + crisis banner + limited-knowledge disclaimer) → custom instructions → delete/restore (7 screens). | `src/features/ai-therapy/screens/*` | — |
| **Third-party model names replaced.** The Figma "LLM checkpoints" (GPT-5/6, Llama4, PaLM3, PrivateGPT, BabyAGI) are **not** reproduced — the app must not imply it calls other providers. Replaced with Sakina-branded, illustrative checkpoint labels that don't change the backend; live replies always go through Sakina's own Claude proxy. | `models/therapyContent.ts` (`aiCheckpoints`) | Product decision on real model routing. |
| `[ASSUMPTION-stub]` No backend — conversations + per-conversation messages are MMKV mock (`mockTherapyConversations`, `therapyMessagesPrefix`), cleared by `clearAllLocalContentData()`. Replies: mock generator, or the live Claude proxy when `aiCompanionLive` is on (same seam as the Companion). | `services/therapyService.ts`, `core/storage/mmkv.ts` | Real backend (#4). |
| **Emotion "detection"** is a deterministic keyword heuristic (illustrative, per-turn tag), NOT a clinical assessment. Crisis is centralized: `containsRiskLanguage` upgrades the tag to `crisis`, short-circuits the reply to a supportive message **without** calling the model, and raises the in-chat Crisis-Support banner → real Safety page. | `models/therapyContent.ts` (`detectEmotion`), `services/therapyService.ts`, `state/useTherapyChat.ts` | Real clinician-reviewed emotion/risk model (#3). |
| **Omitted from the Figma flow** (deliberate): the "Upgrade to Pro" upsell (monetization is Open Question #7, deferred); voice-recording and face-scan turns (need mic/camera libs + are biometric-sensitive — the checker already establishes the privacy-preserving stance); daily-quote / health-report-file / progress-chart chat cards (nice-to-have chat embellishments). Documented so they aren't mistaken for misses. | — | Their own phases. |
| Custom AI Instructions (model/adaptive-memory/custom-response) are **illustrative local settings** — confirmed via toast, not persisted (no backend). | `TherapyCustomInstructionsScreen.tsx` | Real per-conversation settings backend. |
| "Make chat public" is a stored flag only — there is **no** real sharing/social backend (same posture as Mood "Share"). | `models/therapyContent.ts`, `NewTherapyConversationScreen.tsx` | Real backend + explicit consent. |

## Carried forward from `product-definition.md` (not yet stubbed in code — relevant once their feature is built)

1. Do professionals/admins log in, or is the directory operator-managed only? → Professional Help module (deferred from MVP).
2. Who vets professionals; what disclaimers/liability apply? → Professional Help.
3. AI risk-detection & escalation policy — concretely, what triggers escalation and what the app shows. → AI Companion (`companionService`, built with a mocked/undefined policy — flag loudly when implemented).
4. Which LLM provider, and its data-handling guarantees. → AI Companion (`companionService` interface, mock streaming impl only).
5. Data retention / export / deletion policy. → Profile & Settings.
6. Minimum age & minor-handling policy. → Onboarding & Consent.
7. Monetization — paid sessions/features? → Professional Help & Booking (deferred).
8. Analytics/crash tooling compatible with the no-private-logging rule. → App shell (Phase 2), not yet wired.
9. Notification strategy & tone. → Notifications module (deferred from MVP).
10. Markets/dialects beyond Jordanian Arabic. → Future scope, not MVP.

## Deferred from MVP entirely (per product-definition.md §13)

- Rich Insights beyond simple trends.
- Full Professional Help booking (live availability/booking) — directory may ship read-only.
- Notifications/reminders.

Each of these gets a typed service stub + route placeholder when its phase is reached, per the build order — not implemented yet.

---

# Figma-parity pass: the eight remaining SH Freud sections

An audit against the reference file (`🧠 SH freud UI Kit [v1.7] (Demo)`,
node `504:5922`) found eight sections with no counterpart in the app. This
pass implemented all of them. Two notes apply to the whole pass:

- **The reference file is rasterized.** Every section in that Figma file is
  a single flattened PNG (`Home & Mental Health Metrics.png`, 12045×3146,
  one image child per section) with no layers and no prototype links, so
  `get_design_context`/`get_metadata` return nothing usable and there are no
  wired flows to copy. Structure was read visually; all styling is Sakina
  tokens/primitives as before.
- **Two feature flags were switched on.** `professionalBooking` and
  `notifications` in `src/config/index.ts` were `false` (deferred from MVP
  per `product-definition.md` §13). They are now `true` because the features
  exist; flipping either back hides its entry points cleanly (the Home
  sections are flag-guarded).

## Therapist Booking & Appointment — `src/features/professional-help/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow: directory (search + specialty/mode/verified filters) → profile → book (day · session type · slot · optional reason) → request sent → appointments (upcoming/past) → detail (reschedule / cancel). 6 screens. | `screens/*` | — |
| **No payment is modelled anywhere.** Open Question #7 (who takes payment, who carries liability) is unresolved, so booking records an *intent to meet*. `book()` always returns `pending`; the UI says "request sent", never "confirmed". | `services/professionalService.ts`, `AppointmentSchema` | #7. |
| **`verified` is per-professional and never defaults to true.** An unverified listing says so explicitly rather than omitting the badge, and the profile spells out what verification does and does not cover. One seed entry is deliberately unverified so that path is real. | `models/professionalContent.ts`, `TherapistCard.tsx` | #2 (who vets, against which register). |
| `[ASSUMPTION-stub]` The six professionals are illustrative seed data with placeholder licence numbers (`PLACEHOLDER-000n`). Replace wholesale with a vetted API feed before launch. | `models/professionalContent.ts` | #2. |
| Availability is deterministic pseudo-data derived from `professionalId + date` (stable across reloads, past slots never offered), with locally-booked slots removed. `AvailabilitySlot[]` is the contract a real backend replaces. | `buildDaySlots()` | Real backend (#4). |
| The "not an emergency line" card sits **above** the directory list, not below it — someone opening this screen in crisis must meet the safety route before the profiles. | `TherapistDirectoryScreen.tsx` | — |

## Notifications & Reminders — `src/features/notifications/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| **Inbox entries are derived, not pushed.** `refresh()` generates at most one entry per rule per day from the user's real data (no mood logged today, no journal entry today, an appointment inside 24h), de-duplicated by deterministic id. There is no push channel, so nothing can arrive from outside. | `services/notificationService.ts` | — |
| `[ASSUMPTION-stub]` **OS delivery is not wired.** `expo-notifications` is not a dependency (adding it needs a native rebuild plus permission work), so reminders are real persisted preferences that only the in-app inbox honours. `notificationScheduler.ts` is the single seam — already called on every preference write — where scheduling plugs in. The Reminders screen states this limitation to the user rather than implying background delivery. | `services/notificationScheduler.ts`, `ReminderSettingsScreen.tsx` | Notification strategy (#9) plus the dependency. |
| Defaults are one gentle evening check-in on, everything else off, quiet hours 23:00–07:00 on. An app about calm should not arrive with five daily alarms enabled. | `defaultReminderPreferences` | Tone decision (#9). |
| A reminder the user enabled that falls inside quiet hours is **surfaced as suppressed**, not silently swallowed. | `suppressedByQuietHours()` | — |
| Notification tap targets are a closed tagged union (`NotificationTarget`), not stored route names — stored inbox data can never navigate somewhere the app did not intend. | `models/notificationContent.ts` | — |

## Search — `src/features/search/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Home's search bar was a decorative `Pressable` that jumped to Journal. It now opens a real global Search screen. | `HomeScreen.tsx`, `SearchScreen.tsx` | — |
| Searches the user's private content (journal, mood notes) **and** the app's catalogues (articles, workshops, exercises, professionals, help, community threads), kept as distinct `kind`s and scopeable, so a private journal line is never mistaken for public content. | `services/searchService.ts` | — |
| Runs entirely on-device — no index, no query leaves the phone. Recent searches are local and are wiped by `clearAllLocalContentData()`, because a list of what someone searched is as revealing as what it found. | `searchService.ts`, `core/storage/mmkv.ts` | — |

## Wellness Resources & Workshops — `src/features/wellness/resources/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow: resources (Articles / Workshops / Saved tabs, topic filter, search) → article reader → workshop detail. Mounted under Wellness; also feeds the Home "worth reading" carousel the reference calls "Mindful Resources". | `screens/*`, `HomeScreen.tsx` | — |
| `[ASSUMPTION]` Editorial copy is drafted, not clinically reviewed — same posture as `moodContent.ts`/`onboardingContent.ts`. Nothing diagnoses or promises an outcome, and every article ends with the "not medical advice" line. | `models/resourceContent.ts` | Clinical review before launch. |
| Workshops are illustrative, dated relative to today so the list never goes stale, with fictional facilitators. **Registration is local-only and says so** — it does not hold a seat and takes no payment. | `resourceService.toggleRegistration`, `WorkshopDetailScreen.tsx` | #2/#7 plus a real registration backend. |

## Community Support — `src/features/community/`

Peer support is the highest-risk surface in the product, so three rules are
enforced in the **service**, not the screens, where no future caller can skip them:

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| **Pseudonymous by default.** Posts carry a user-chosen alias stored locally; the auth display name and email are never used or linked. | `communityProfile`, `CommunityScreen.tsx` | — |
| **Guidelines gate posting, never reading.** Anyone can read; posting requires an alias plus explicit acceptance. | `assertPostable()` | — |
| **Risk language never becomes a post.** `createThread`/`reply` refuse it outright (a `validation` error with status 422) and the composer swaps in the shared `SafetyBanner` and routes to Safety — the same escalation the AI Companion uses. Peers are not a crisis service. | `communityService.ts`, `NewCommunityThreadScreen.tsx`, `CommunityThreadScreen.tsx` | Real escalation policy (#3). |
| `[ASSUMPTION-stub]` **There is no moderation backend and no real community.** Seed threads are illustrative, what the user writes is stored on this device only, and `report()` hides a post locally. The Community screen states this plainly. **A real launch needs human moderation before this feature is switched on.** | `models/communityContent.ts`, `communityService.report` | Moderation staffing — not covered by any existing open question; raise it. |

## Badges & Achievements — `src/features/badges/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| **No badge rewards a mood.** Nothing exists for "feeling good", a streak of positive moods, or low stress — that would push people to log dishonestly and destroy the value of their own history. Every badge counts an action the user chose: logged, wrote, practised, read, reached out. The rule is stated in the UI, not just the code. | `models/badgeContent.ts`, `badges.noMoodRewardNote` | — |
| Badges are **derived on every read**, never stored as awards, so they cannot drift from reality. The only persisted state is which badges have already been celebrated, so a notification fires once. | `services/badgeService.ts`, `badgesSeen` | — |
| Locked badges show progress, not a padlock; a broken streak is never called a failure and nothing is ever revoked. | `BadgeTile.tsx` | — |
| `[ASSUMPTION]` Thresholds are drafted product judgement, not research — deliberately low so early wins are reachable. | `badgeCatalog` | Product/clinical review. |

## Profile Settings & Help Center — `src/features/profile/help/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| Flow: help centre (search over questions *and* answers, category filter, safety card above the FAQ) → article → contact support. Linked from both Profile and Settings. | `screens/*` | — |
| Articles answer the questions this app actually raises (where data lives, is the AI a therapist, why no diagnosis, how the community is moderated) rather than generic FAQ filler. Where an answer depends on an unresolved decision, it says so. | `models/helpContent.ts` | — |
| `[ASSUMPTION-stub]` **Contact support does not send anything** — there is no support backend, so the form composes the message and says plainly that delivery is not wired up. Faking a "message sent" confirmation would be worse than saying nothing. | `ContactSupportScreen.tsx` | Support channel decision. |
| Settings' notifications row was a disabled "coming soon" switch; it now opens the real Reminders screen. | `SettingsScreen.tsx` | — |

## Error & Other Utilities — `src/features/errors/`

| Assumption / decision | Where | Resolve by |
| --- | --- | --- |
| One shared `UtilityScreenLayout` frame so every full-screen utility state stays calm and consistent, and so the crash fallback can reuse it without a navigator. | `components/UtilityScreenLayout.tsx` | — |
| `NotFoundScreen` is a registered Home route for content that no longer resolves; it names the missing thing when the caller knows it. | `HomeStack.tsx` | — |
| `MaintenanceScreen` short-circuits `RootNavigator` when `config.maintenanceMode` is on, with no way past it. Its copy points at emergency services directly — a maintenance window must never be the reason someone cannot get help. | `RootNavigator.tsx`, `config.maintenanceMode` | Remote config, once a backend exists. |
| **Bug fixed in passing:** `ErrorBoundary` sits *above* the app's `ThemeProvider` in `App.tsx`, but its old inline fallback used `AppText`/`Button`, both of which call `useTheme()` — which throws outside a provider. The fallback would have thrown a second error while rendering the first one. The new `AppCrashScreen` carries its own `ThemeProvider`. | `core/errors/ErrorBoundary.tsx`, `AppCrashScreen.tsx` | — |
| **Offline was deliberately not given a full-screen state.** The app is local-first (all services are on-device), so blocking the whole UI when offline would be a regression; the existing app-wide `OfflineBanner` stays the treatment. | `core/network/OfflineBanner.tsx` | Revisit when a backend exists. |

## Home screen: reference parity, with three deliberate departures

`HomeScreen` now follows the reference top-to-bottom (greeting plus
notification bell, search, metrics carousel, tracker rows, inline mood
check-in, appointments, checker, therapy, community, resources carousel,
badges). The departures:

1. **No "Freud Score."** The hero card remains the non-diagnostic Wellbeing
   Reflection. Nothing on Home renders a mental-health score — this was
   already settled earlier in this file and the parity pass did not reopen it.
2. **Safety stays high in the actionable cards**, not buried under editorial
   content (spec §21) — higher than the reference places anything similar.
3. **The inline emoji row does not silently log a mood.** Tapping opens the
   full check-in with that mood pre-selected (new `MoodCheckIn.initialMood`
   param), so the user still confirms. A one-tap silent log makes accidental
   entries far too easy, and the history is only useful if the user trusts it.

## Still not implemented (unchanged by this pass)

The reference's bottom navigation is 5 icons plus a central create-FAB; Sakina
keeps its 6 labelled tabs. Changing the tab bar is a product decision, not a
parity fix, and the reference's "Stats" tab maps to Insights, which is still
deferred from MVP.
