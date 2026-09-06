# Product Definition — Arabic-First Mental-Health & Wellbeing App

> **Scope note.** This definition is derived from the Mobile Engineering & UI Architecture Specification (React Native). That source is a *frontend* spec: it defines screens, flows, and interaction patterns in detail but is largely silent on backend business concerns (monetization, professional vetting, data residency, the AI provider, clinical governance). Wherever a decision was needed that the source does not state, it is flagged as **[ASSUMPTION]** rather than presented as fact. These assumptions must be confirmed before they harden into requirements.

---

## 1. Product Overview

A private, Arabic-first mobile application (iOS & Android, React Native) that gives young Arabic-speaking users in Jordan a calm personal space to understand their emotions, build healthier habits, and reach appropriate mental-health support. It combines an AI emotional-support companion, daily mood tracking, journaling, guided wellness exercises, personalized insights, and a bridge to professional and emergency help.

The product deliberately positions itself as a *supportive companion*, not a clinical or medical system. The AI is never presented as a doctor, therapist, or emergency service; instead it escalates to human professionals and crisis resources when a situation exceeds its role. The emotional promise of the product is: *"You have a safe place to pause, understand what you're feeling, and take the next small step."*

**How the pieces relate.** Mood check-ins and journaling generate the raw emotional data. That data feeds two consumers: the *Insights* module (which turns it into supportive patterns over time) and the *AI Companion* (which uses recent emotional context to respond more relevantly). *Wellness* is the "what can I do right now" outlet that Home and the Companion both route users toward. *Professional Help* and *Safety* sit above all of them as the escalation layer — the path out of the app and toward a human when self-guided tools are not enough.

---

## 2. Problem Statement

Young adults, students, and early-career people in Jordan experience stress, anxiety, loneliness, and burnout, but face several compounding barriers to support:

- **Language and cultural fit.** Most polished mental-health apps are English-first and Western in tone; they don't feel native, and RTL Arabic is usually an afterthought rather than the source layout. The lived vocabulary of emotion (including Jordanian colloquial phrasing like *"كيف حاسس اليوم؟"*) is missing.
- **Stigma and privacy.** Seeking help carries social cost, so users need a space that feels genuinely private and non-judgmental before they'll engage — and certainly before they'll approach a professional.
- **Access gap.** The distance between "I feel bad" and "I'm sitting with a licensed professional" is large. There's no low-stakes intermediate step to help someone understand what they're feeling and decide whether professional help is warranted.
- **Fragmentation.** Reflection, tracking, coping exercises, and professional booking live in separate tools (or nowhere), so patterns are never connected and momentum is lost.

The product addresses these by being Arabic-and-RTL-first, private by design, emotionally warm rather than clinical, and by chaining understanding → coping → escalation inside one trusted space.

---

## 3. Goals and Objectives

**Product goals**

- Give users a daily, low-friction way to notice and record how they feel.
- Help users *understand* emotional patterns, not just log them.
- Provide immediate, safe, self-guided relief (wellness + AI companion) at the moment of need.
- Reduce the distance to professional help and make crisis resources reachable in one or two taps.
- Feel calm, private, and culturally natural — earning enough trust that users return and, when needed, escalate.

**Measurable objectives** *(targets are **[ASSUMPTION]** — the source sets no numbers)*

- A daily check-in that can be completed in under ~30 seconds.
- Safety/crisis resources reachable from anywhere in the app within ≤2 taps.
- Meaningful proportion of active users completing a check-in on a recurring basis (e.g. weekly retention target TBD).
- AI companion responses that reliably decline a clinical role and escalate appropriately when risk language appears.

---

## 4. Target Users

Primary:

- Young adults in Jordan, Arabic-speaking.
- University students and early-career users.
- People experiencing stress, anxiety, loneliness, emotional difficulty, or burnout.
- Users with no prior experience of mental-health apps (the product must remain accessible to first-timers).

Secondary / adjacent *(**[ASSUMPTION]** — implied by the Professional Help module but not confirmed as an in-app persona)*:

- **Licensed mental-health professionals** listed in the directory. Whether they log into this app, or are managed entirely by the operator, is undefined (see §5).

---

## 5. User Roles and Permissions

The source describes only an end-user experience plus a professional *directory*. It does not confirm whether professionals or administrators are actual system users. Roles below are therefore partly inferred and flagged.

**End User (confirmed)**
- Create/manage own account; complete onboarding and consent.
- Full read/write on *their own* mood entries, journal entries, AI conversations, wellness activity.
- Read insights derived from their own data.
- Browse professionals, book/cancel appointments.
- Access safety and emergency resources.
- Cannot see any other user's data.

**Professional** *(**[ASSUMPTION]** — the app may only *display* professionals, with no professional login)*
- Manage own profile, availability, and appointment requests.
- View only the appointments booked with them; **no access** to a user's mood/journal/AI data unless the user explicitly shares it. *(Data-sharing to professionals is not described in the source — treat as out of scope unless specified.)*

**Administrator / Operator** *(**[ASSUMPTION]** — no admin surface is described, but a directory, crisis content, and safety resources must be maintained by someone)*
- Curate and vet the professional directory.
- Maintain crisis/emergency resources and safety content.
- Manage wellness/exercise and educational content.
- No access to private user emotional content *(privacy-by-design intent from §32 of the source; the specific policy is an assumption)*.

**Permission principle (from the source's security section).** Mental-health content is sensitive; the frontend minimizes exposure and backend authorization is authoritative. Cross-user data access is prohibited by default.

---

## 6. Main Workflows

Each workflow notes its purpose and how it connects to the rest of the system.

1. **First launch & onboarding** — Splash → Welcome → Language → Introduction → Goals → Emotional baseline → Privacy & Consent → Create account/Login → Home.
   *Purpose:* establish language/RTL, capture consent for sensitive data, and set an emotional baseline that seeds early insights. *Connection:* language choice drives the entire RTL layout; consent gates all data collection; the baseline is the first data point Insights can use.

2. **Daily mood check-in** — Mood → Emotion → Trigger → optional Note → Save → Confirmation.
   *Purpose:* fast capture of current emotional state. *Connection:* primary data source feeding Mood Tracking, Insights, and the Companion's context.

3. **Mood review** — view current mood, history, and weekly/monthly trends.
   *Purpose:* let users see patterns. *Connection:* consumes check-in data; surfaces InsightCards that link back into Wellness suggestions.

4. **AI companion conversation** — open chat → (suggested prompt or free text) → AI responds/streams → optional escalation.
   *Purpose:* in-the-moment emotional support and reflection. *Connection:* reads recent mood/journal context; routes users to Wellness exercises or, on risk, to Safety/Professional Help.

5. **Journaling** — create/edit/view/delete entries, optionally from a guided prompt, optionally receiving an AI reflection.
   *Purpose:* private reflection. *Connection:* second major emotional data source; AI reflection ties journaling to the Companion capability.

6. **Wellness exercise** — Details → Preparation → Exercise (e.g. breathing) → Progress → Completion.
   *Purpose:* immediate self-regulation. *Connection:* the "act now" destination recommended by Home, Insights, and the Companion.

7. **Seek professional help** — browse directory → view profile → check availability → book → manage/cancel appointment.
   *Purpose:* bridge to human care. *Connection:* the escalation layer above self-guided tools.

8. **Safety / crisis access** — reach crisis support and emergency resources from anywhere; AI-triggered escalation when risk is detected.
   *Purpose:* protect users in crisis. *Connection:* cross-cutting; must be reachable from Home, Companion, and globally.

---

## 7. Functional Modules

1. Authentication & Session
2. Onboarding & Consent
3. Home
4. Mood (Daily Check-In + Tracking)
5. AI Companion (Chat)
6. Journaling
7. Wellness / Exercises
8. Insights
9. Professional Help & Booking
10. Safety & Emergency Support
11. Profile & Settings (incl. Privacy & Language)
12. Notifications *(**[ASSUMPTION]** — implied by booking reminders/keep-awake, not enumerated as a module)*

---

## 8. Core Features per Module (with purpose & relationships)

**1. Authentication & Session**
- Register, login, logout, password recovery, session restore on cold start, protected navigation, secure token storage (Keychain/SecureStore).
  *Purpose:* establish identity so private emotional data can be tied to and protected for one user. *Relationship:* gates every other module; auth state decides which navigator (Auth vs App) the user sees.

**2. Onboarding & Consent**
- Language selection (sets RTL/LTR), introduction, goal capture, emotional baseline, explicit privacy & consent step, persistence of onboarding completion.
  *Purpose:* configure the app, obtain lawful consent for sensitive data, and gather the first signal for personalization. *Relationship:* language propagates everywhere; consent is a precondition for Mood/Journal/AI storage; baseline seeds Insights.

**3. Home**
- Greeting, daily check-in entry, mood summary, AI companion card, journal shortcut, wellness recommendation, recent insight, safety/support entry; pull-to-refresh.
  *Purpose:* answer "how am I doing today, and what can I do right now?" *Relationship:* the hub that links outward to every other module and surfaces the safety path prominently.

**4. Mood (Check-In + Tracking)**
- MoodSelector, EmotionSelector, TriggerSelector, NoteInput, save/confirmation with haptics; history, weekly/monthly trends, RTL-aware charts, InsightCards.
  *Purpose:* capture and visualize emotional state over time. *Relationship:* core data producer for Insights and Companion context; its InsightCards recommend Wellness.

**5. AI Companion**
- Conversation list (inverted, streaming), suggested prompts, typing indicator, retry, empty state; explicit non-clinical framing; escalation path to Safety/Professional Help.
  *Purpose:* conversational support and reflection at the moment of need. *Relationship:* consumes recent emotional data; routes users into Wellness or escalation; bounded by the safety rules in §11.

**6. Journaling**
- Create/read/update/delete entries, guided prompts, AI reflection, search/filter, local draft autosave.
  *Purpose:* private long-form reflection. *Relationship:* secondary emotional data source; AI reflection connects it to the Companion capability; feeds Insights.

**7. Wellness / Exercises**
- Categories (breathing, grounding, relaxation, meditation, stress relief, sleep); exercise flow with timer, Reanimated breathing visualizer, keep-awake, completion state.
  *Purpose:* immediate, structured self-regulation. *Relationship:* the "act now" endpoint recommended by Home, Insights, and Companion.

**8. Insights**
- Mood trends, frequent emotions, common triggers, weekly changes, positive patterns, personalized suggestions — always in supportive language (never "your mood is bad").
  *Purpose:* turn raw data into understandable, non-judgmental patterns. *Relationship:* consumes Mood/Journal data; outputs guidance that loops users back into Wellness and check-ins.

**9. Professional Help & Booking**
- Directory, professional profiles, availability, booking form, appointment list/details, cancellation; optional device-calendar add and reminders.
  *Purpose:* bridge from self-guided support to human care. *Relationship:* the escalation layer; reachable from Companion and Safety.

**10. Safety & Emergency Support**
- Safety notices, crisis support card, emergency resources (tel: links), professional-help card, safety check; reachable in ≤2 taps.
  *Purpose:* protect users in crisis. *Relationship:* cross-cutting; triggered by Companion risk detection and always globally accessible.

**11. Profile & Settings**
- Profile view/edit, language switch (triggers RTL reload), privacy controls, settings.
  *Purpose:* user control over identity, language, and privacy. *Relationship:* language and privacy settings affect the whole app; **[ASSUMPTION]** data export/delete controls belong here (not specified in source).

**12. Notifications** *(**[ASSUMPTION]**)*
- Appointment reminders; possibly gentle check-in nudges.
  *Purpose:* re-engagement and reliability of bookings. *Relationship:* supports Mood habit-building and Professional Help; nudge frequency/tone must respect the calm, non-nagging product character.

---

## 9. Inputs and Outputs

**Inputs**
- Credentials; onboarding selections (language, goals, baseline); explicit consent.
- Mood, emotions, triggers, optional notes.
- Journal text (and prompt selections).
- Chat messages / prompt taps.
- Exercise selections and completion signals.
- Booking details (professional, slot).
- Profile/settings changes.

**Outputs**
- Confirmation states and haptic feedback.
- Mood history, trend charts, InsightCards.
- AI companion responses (streamed), AI journal reflections.
- Wellness guidance and completion summaries.
- Appointment confirmations, details, reminders.
- Safety/crisis resources and escalation prompts.
- Human-readable Arabic error/empty/loading states everywhere.

---

## 10. External Integrations

Confirmed or strongly implied by the source:
- **AI / LLM provider** for the Companion and journal reflections — *provider unspecified* **[ASSUMPTION on choice]**; streaming responses are required.
- **Device services:** SecureStore/Keychain (tokens), local notifications, calendar (`expo-calendar`) for appointments, haptics, biometrics (optional app lock), `Linking` for emergency `tel:` calls.
- **Backend API** (auth, mood, journal, chat, wellness, insights, professionals, appointments, safety content).

Not stated, likely needed, flagged **[ASSUMPTION]**:
- Crash/analytics (privacy-respecting, must not log private content).
- Auth/identity provider or email/SMS for verification and password reset.
- Payment/booking-fee processing *(only if professional sessions are paid — monetization is undefined)*.
- Push-notification service (FCM/APNs).

---

## 11. Business Rules

Confirmed from the source:
- **The AI must never present itself as a doctor, psychiatrist, therapist, or emergency service.** When a conversation needs professional or emergency support, the UI must surface an escalation path.
- **Safety/crisis information must be easy to reach** and must not be buried behind multiple navigation layers.
- **Insights must use supportive, non-judgmental language** (e.g. avoid "your mood is bad").
- **A user can only access their own emotional data**; backend authorization is authoritative.
- **Sensitive content is not logged** in production (no full AI conversations, no private user content).
- **Arabic/RTL is the source layout**, not a mirror of an English build.

Rules the product likely needs but the source does not state — **[ASSUMPTION]**:
- Criteria and vetting for listing a professional; liability/disclaimer language.
- Risk-detection policy: what language triggers escalation, and what the app shows/does when it fires.
- Data retention and user-initiated deletion/export of emotional data.
- Age eligibility / minor handling (a mental-health app for "young adults" needs a defined minimum age and minor policy).
- Whether professional sessions are free or paid, and cancellation/no-show rules.

---

## 12. Non-Functional Expectations

- **Privacy & security:** no secrets in the binary; tokens in Keychain/SecureStore only; optional biometric app lock; app-switcher content privacy; clear sensitive temporary state; no logging of private content.
- **Accessibility:** VoiceOver/TalkBack, sufficient contrast, ≥44×44pt targets, reduced-motion support, meaning never conveyed by color alone, respect OS font scaling.
- **Localization/RTL:** full RTL correctness in Arabic and LTR in English; graceful reload on language switch.
- **Performance:** Hermes engine; FlashList for long lists and inverted chat; `expo-image` caching; preload fonts before hiding splash; lazy-load heavy features; minimize re-renders.
- **Reliability/offline:** explicit offline handling (NetInfo), error boundaries, retry paths, no blank screens (skeletons everywhere).
- **Calm UX quality bar:** subtle motion + haptics; a feature is "done" only when loading/empty/error/success/RTL/iOS+Android/accessibility are all handled (per the source's Definition of Done).

---

## 13. MVP Scope

Rationale: ship the *understand → cope → escalate* core loop with safety intact; defer anything requiring external partners (paid booking, live professional accounts) or advanced ML.

**In MVP**
- Auth (register/login/recovery, secure sessions).
- Onboarding + consent + language/RTL.
- Home hub.
- Daily mood check-in + basic history and simple trends.
- AI Companion (support conversation, suggested prompts, non-clinical framing, streaming, escalation entry point).
- Journaling (CRUD + guided prompts; **AI reflection optional**).
- Wellness (breathing + at least one or two other categories, timer, breathing visualizer).
- Safety & Emergency resources (static, always reachable, `tel:` links).
- Profile/Settings with language + basic privacy controls.

**Deferred from MVP** (still important, not day-one):
- Rich Insights beyond simple trends.
- Full Professional Help *booking* (directory browsing may ship read-only; live availability/booking deferred).
- Notifications/reminders.
- **[ASSUMPTION]** these deferrals reflect complexity/partnership dependencies, not a stated source decision.

---

## 14. Future Scope

- Full professional booking with live availability, reminders, and (if applicable) payments.
- Advanced personalized insights and pattern detection; opt-in sharing of a summary with a chosen professional.
- Richer wellness library, audio/guided content, sleep tools.
- Notifications and gentle habit nudges tuned to the calm tone.
- Tablet/foldable-optimized layouts.
- Localization beyond Jordanian Arabic (other dialects/regions), then broader MENA.
- Optional biometric lock, data export/delete self-service.
- Web companion *(only if justified; the product is intentionally mobile-first)*.

---

## 15. Success Criteria

**Qualitative (from the source's intent)**
- Users describe the app as calm, private, trustworthy, and culturally natural — not clinical or generic.
- The AI reliably stays in its supportive role and escalates correctly.
- Safety resources are consistently reachable within ≤2 taps.

**Quantitative — targets **[ASSUMPTION]** (source sets none):**
- Onboarding completion rate.
- Recurring check-in rate / weekly retention.
- Journaling and wellness engagement among active users.
- Escalation funnel: rate at which at-risk sessions reach safety/professional resources.
- Crash-free sessions and Arabic-RTL defect rate at/below defined thresholds.
- App-store rating and qualitative trust signals.

---

## Open Questions to Resolve Before SRS

These are the assumptions above, restated as decisions the team must make:

1. Do professionals and administrators log into the system, or is the directory operator-managed only?
2. Who vets professionals, and what disclaimers/liability apply?
3. What is the AI risk-detection and escalation policy, concretely?
4. Which LLM provider, and what are its data-handling guarantees for sensitive content?
5. Data retention, export, and deletion policy for emotional data.
6. Minimum age and minor-handling policy.
7. Monetization: are sessions/features paid? If so, payment and cancellation rules.
8. Analytics/crash tooling that is compatible with the no-private-logging rule.
9. Notification strategy and tone.
10. Which markets/dialects beyond Jordanian Arabic, and when.
