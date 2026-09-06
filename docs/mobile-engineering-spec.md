# Mobile Engineering & UI Architecture Specification (React Native)

# 1. Project Overview

## Project Name

**[FINAL APP NAME]**

## Product Type

Arabic-first mental-health and emotional-wellbeing **mobile application** (React Native) designed specifically for users in Jordan.

## Product Vision

Build a calm, private, supportive digital space where users can understand their emotions, reflect on their experiences, build healthy habits, and access appropriate mental-health support.

The application should feel like a **safe personal space**, not a medical dashboard.

The experience should combine:

* AI-powered emotional support
* Mood tracking
* Journaling
* Wellness exercises
* Personalized insights
* Mental-health education
* Professional support
* Safety and escalation resources

The AI should be positioned as a **supportive companion**, not a doctor, psychiatrist, or replacement for professional care.

---

# 2. Target Audience

Primary users:

* Young adults in Jordan
* Arabic-speaking users
* University students
* Early-career users
* People experiencing stress, anxiety, loneliness, emotional difficulties, or burnout
* Users who want to understand their emotions and build healthier habits

The product should remain accessible to users who have no previous experience with mental-health applications.

---

# 3. Product Experience

The application should feel:

* Calm
* Warm
* Human
* Private
* Trustworthy
* Non-judgmental
* Modern
* Arabic-first
* Culturally appropriate
* Native to the platform (iOS & Android)

Avoid making the application feel like:

* A hospital system
* A clinical dashboard
* A generic chatbot
* A productivity application
* A social network
* A web page wrapped in a WebView

The primary emotional message is:

> **"You have a safe place to pause, understand what you're feeling, and take the next small step."**

---

# 4. Platform & Tech Baseline

## Framework

**React Native** with **TypeScript**.

## Recommended Toolchain

```text
Expo (managed or dev-client) — recommended for velocity
React Native CLI — fallback if native modules require it
```

Prefer **Expo + dev client** so native modules (secure storage, notifications, haptics) work while keeping OTA and fast iteration.

## Target Platforms

```text
iOS
Android
```

## Core Libraries (suggested)

```text
Navigation        → React Navigation (native-stack + bottom-tabs)
State             → Zustand or Redux Toolkit (feature slices)
Server state      → TanStack Query (React Query)
Forms             → React Hook Form + Zod
Styling           → Unistyles / StyleSheet + theme, or Tamagui
i18n / RTL        → i18next + react-i18next + I18nManager
Storage (secure)  → expo-secure-store / react-native-keychain
Storage (cache)   → MMKV
Charts            → victory-native / react-native-svg
Animation         → Reanimated 3 + Moti
Gestures          → react-native-gesture-handler
Lists             → FlashList (Shopify)
Fonts             → expo-font
```

Do not introduce web-only libraries (DOM, CSS files, HTML elements). Everything must be native React Native primitives (`View`, `Text`, `Pressable`, `FlatList`/`FlashList`, etc.).

---

# 5. UI / Design Reference

## Primary Design Reference

**SH Freud UI Kit — v1.7 Demo**

The provided Figma design is the primary visual reference for:

* Layout principles
* Component style
* Cards
* Forms
* Navigation
* Spacing
* Visual hierarchy
* Interaction patterns
* Illustration direction
* Emotional tone

The UI should **not be copied blindly**. Adapt the design language into an Arabic-first Jordanian mental-health **mobile** product.

### Design Adaptation Principles

Use the Figma reference for:

```text
Visual language
Component philosophy
Layout rhythm
Hierarchy
Interaction patterns
Visual softness
```

Adapt it for:

```text
Arabic
RTL
Jordanian cultural context
Mental-health workflows
AI interaction
Mood tracking
Journaling
Wellness
Safety
Native mobile gestures & navigation
```

---

# 6. Typography System

## Primary Arabic Typeface

Use the provided **Thmanyah Typeface Family**, loaded via `expo-font` and applied through the theme.

### Thmanyah Sans — Primary UI font

Use for:

* Navigation / tab labels
* Buttons
* Forms
* Labels
* Body text
* Cards
* Input fields
* Error messages
* Notifications
* Metadata

### Thmanyah Serif Display — Display typography

Use for:

* Hero headings
* Major emotional statements
* Onboarding headings
* Section introductions
* Important empty states

Example:

```text
كيف حاسس اليوم؟
```

### Thmanyah Serif Text — selectively for

* Journal content
* Long-form educational content
* Reflective content
* Quotes
* Editorial-style sections

## Typography Principle

Do not use Serif Display for normal UI text.

```text
Emotional / expressive content  →  Thmanyah Serif Display
Functional / interactive content →  Thmanyah Sans
```

Expose text styles as reusable `<Text>` variants (e.g. `<AppText variant="displayLg">`) so raw `fontFamily` strings never appear in screens.

---

# 7. Color System

Calm natural colors, avoiding aggressive medical colors.

## Core Palette

```text
Background Primary   #F5F1EA
Surface              #FCFAF7
Primary              #6F8376
Primary Dark         #34433D
Warm Accent          #C9A58D
Soft Blue            #AEBFC0
Text Primary         #292D2B
Text Secondary       #737A76
```

## Semantic Colors

```text
Success  → muted natural green
Warning  → soft warm amber
Error    → muted terracotta/red
Info     → soft blue family
```

Avoid extremely saturated red/green/blue unless required for a clear safety/status indication. Support both **light** and **dark** color schemes via `useColorScheme()`.

---

# 8. Design Tokens

Centralized tokens consumed through a theme provider.

```text
colors/
typography/
spacing/
radius/
shadows/       (elevation on Android, shadow* on iOS)
breakpoints/   (phone / tablet width buckets)
motion/
```

Components must consume semantic tokens, never hardcoded values.

```text
background.primary
surface.primary
brand.primary
text.primary
text.secondary
status.error
status.success
```

Provide tokens via a `ThemeProvider` + `useTheme()` hook. Shadows must be defined per-platform (iOS `shadowColor/Opacity/Radius`, Android `elevation`).

---

# 9. RTL Architecture

Arabic is the **primary language and source layout direction**. The app is RTL-first.

Implement:

* RTL navigation & headers
* RTL forms
* RTL cards & lists
* RTL chat
* RTL spacing (use `start`/`end`, not `left`/`right`)
* RTL-aware icons (mirror directional icons)
* RTL animations & screen transitions

## React Native specifics

```text
I18nManager.forceRTL(true)        → force Arabic layout
I18nManager.allowRTL(true)
```

* Changing RTL requires an **app reload** (`expo-updates` reloadAsync or a restart prompt) — handle this gracefully during language switching.
* Use logical style props: `paddingStart`, `marginEnd`, `textAlign: 'right'` via theme, `flexDirection: 'row'` (auto-mirrors under RTL).
* Mirror directional icons (back arrows, chevrons) based on `I18nManager.isRTL`.

English is an optional LTR experience.

```text
Arabic → RTL
English → LTR
```

Do not build LTR first and mirror later.

---

# 10. Application Navigation

Recommended primary navigation (React Navigation **bottom-tabs**):

```text
Home
AI Companion
Mood
Journal
Wellness
Profile
```

## Navigator structure

```text
RootNavigator (native-stack)
├── AuthStack        (Welcome, Login, Register, Forgot, Reset)
├── OnboardingStack  (Language, Intro, Goals, Baseline, Consent)
└── AppTabs (bottom-tabs)
    ├── HomeStack
    ├── CompanionStack
    ├── MoodStack
    ├── JournalStack
    ├── WellnessStack
    └── ProfileStack
```

* The active tab must have a clear visual state (color + icon fill).
* Tab bar must respect safe-area insets and RTL ordering.
* Deep flows (Exercise, Booking, Journal editor) are pushed as native-stack screens, optionally as modals/bottom sheets.

---

# 11. Main Application Flows

## Flow 1 — First Launch

```text
Splash
 ↓
Welcome
 ↓
Language
 ↓
Introduction
 ↓
Goals
 ↓
Emotional Preferences / Baseline
 ↓
Privacy & Consent
 ↓
Create Account / Login
 ↓
Home (Tabs)
```

Persist onboarding completion + language choice in secure/MMKV storage so returning users skip straight to the correct stack.

---

# 12. Authentication

## Screens

```text
Welcome
Login
Register
Forgot Password
Reset Password
```

## Responsibilities

* Account creation
* Login / logout
* Session restoration on cold start
* Password recovery
* Protected navigation (conditional navigator based on auth state)
* Token management

## Token storage

```text
Access token   → in-memory + expo-secure-store
Refresh token  → expo-secure-store / Keychain only
```

Never store tokens in plain AsyncStorage/MMKV.

## States

```text
Initial
Loading
Success
Invalid Credentials
Network Error
Server Error
Unauthorized
Session Expired
```

---

# 13. Home

## Responsibility

The user's emotional starting point. Answers:

> "How am I doing today, and what can I do right now?"

## Main Components

```text
Greeting
Daily Check-In
Mood Summary
AI Companion Card
Journal Shortcut
Wellness Recommendation
Recent Insight
Safety / Support Entry
```

Render inside a `ScrollView` with `RefreshControl` for pull-to-refresh.

## Example Copy

```text
صباح الخير

كيف حاسس اليوم؟

خذ لحظة واحكيلنا عن شعورك.
```

## States

```text
First Visit
Returning User
Loading
Partial Loading
API Error
No Previous Data
```

---

# 14. Daily Mood Check-In

## Flow

```text
Mood → Emotion → Possible Trigger → Optional Note → Save → Confirmation
```

## Components

```text
MoodSelector
EmotionSelector
TriggerSelector
NoteInput
ProgressIndicator
SaveButton
```

Use haptic feedback (`expo-haptics`) on mood selection and successful save. Handle the keyboard with `KeyboardAvoidingView` for the note step.

## State

```text
Selected Mood
Selected Emotions
Selected Triggers
Note
Submitting
Success
Error
```

---

# 15. Mood Tracking

## Features

```text
Current Mood
Mood History
Emotion History
Triggers
Daily Entries
Weekly Trends
Monthly Trends
```

## UI Components

```text
MoodChart        (victory-native / react-native-svg)
MoodHistoryCard
EmotionChip
TriggerChip
MoodEntry
DateSelector
InsightCard
```

Use **FlashList** for long history lists. Charts must be RTL-aware (reverse axis direction for Arabic).

## Edge States

```text
No Mood Data
Loading History
Failed to Load
Incomplete Data
No Data For Selected Period
```

---

# 16. AI Companion

## Main Components

```text
ChatHeader
ConversationList        (inverted FlashList)
AIMessageBubble
UserMessageBubble
TypingIndicator
ChatInput               (KeyboardAvoidingView-aware)
SuggestedPrompt
RetryMessage
ConversationEmptyState
```

Use an **inverted list** so new messages appear at the bottom and scrolling stays natural. Support streaming tokens into the last AI bubble.

## Example Suggested Prompts

```text
حاسس بضغط اليوم
بدي أحكي عن شيء مضايقني
ساعدني أفهم شعوري
خلينا نعمل تمرين تنفس
```

## States

```text
Empty Conversation
Sending
AI Thinking
Streaming
Success
Failed Message
Network Error
Retry
```

## Safety

The AI must not present itself as:

```text
Doctor
Psychiatrist
Therapist
Emergency Service
```

When a conversation requires professional or emergency support, surface an escalation path (e.g. a pinned `SafetyBanner` or bottom sheet with crisis resources).

---

# 17. Journaling

## Features

```text
Create Entry
View Entry
Edit Entry
Delete Entry
Guided Prompt
AI Reflection
Search / Filter
```

## Components

```text
JournalCard
JournalEditor          (multiline TextInput, keyboard-aware)
JournalPrompt
JournalEntry
DateHeader
DeleteConfirmation     (Alert or BottomSheet)
AIReflectionCard
```

## Empty State

```text
لسه ما كتبت شيء اليوم.

اكتب أول شيء يخطر ببالك.
```

Autosave drafts locally (MMKV) so content survives backgrounding the app.

---

# 18. Wellness

## Categories

```text
Breathing
Grounding
Relaxation
Meditation
Stress Relief
Sleep
```

## Exercise Flow

```text
Exercise Details → Preparation → Exercise → Progress → Completion
```

## Components

```text
ExerciseCard
ExerciseTimer
ProgressIndicator
BreathingVisualizer     (Reanimated 3 shared values)
ExerciseInstructions
CompletionState
```

Build the breathing visualizer and timers with **Reanimated 3** on the UI thread (not JS `setInterval`) for smooth animation. Keep the screen awake during an active exercise (`expo-keep-awake`) and respect reduced-motion.

---

# 19. Insights

Potential insights:

```text
Mood Trends
Frequent Emotions
Common Triggers
Weekly Changes
Positive Patterns
Personalized Suggestions
```

Supportive language only.

Avoid:

```text
Your mood is bad.
```

Prefer:

```text
يبدو إن الأيام الماضية كانت أصعب شوي.

خلينا نشوف شو الأشياء اللي ممكن تساعدك.
```

---

# 20. Professional Help

Potential functionality:

```text
Psychologist Directory
Professional Profiles
Availability
Booking
Appointments
Appointment Details
Cancellation
```

## Components

```text
ProfessionalCard
ProfessionalProfile
AvailabilitySelector
AppointmentCard
BookingForm
```

Consider `expo-calendar` for adding confirmed appointments to the device calendar, and local notifications for reminders.

---

# 21. Safety & Emergency Support

Safety is a dedicated product capability.

Components:

```text
SafetyNotice
CrisisSupportCard
EmergencyResources
ProfessionalHelpCard
SafetyCheck
```

* Safety info must be reachable within one or two taps.
* Emergency contact actions should use `Linking` (`tel:` for hotlines).
* Do not hide support behind multiple navigation layers.

---

# 22. API Architecture

```text
UI (Screen / Component)
 ↓
Hook (useQuery / useMutation)
 ↓
Service / Use Case
 ↓
Repository
 ↓
API Client (axios/fetch instance + interceptors)
 ↓
Backend
```

Never call the API directly inside a component. Use TanStack Query hooks that wrap services.

Suggested structure:

```text
core/
    api/          (client, interceptors, token refresh)
    auth/
    errors/
    storage/      (secure store + MMKV wrappers)

features/
    authentication/
    onboarding/
    home/
    mood/
    ai-companion/
    journal/
    wellness/
    insights/
    professional-help/
    profile/
```

---

# 23. Data Models

Typed TypeScript models (validate API payloads with Zod).

```text
User
MoodEntry
Emotion
Trigger
JournalEntry
ChatConversation
ChatMessage
WellnessExercise
Insight
Professional
Appointment
```

Do not pass untyped objects around when typed models are appropriate.

---

# 24. State Management

Feature-level global state (Zustand slice or RTK slice) for server-synced/shared data:

```text
AuthenticationState
MoodState
ChatState
JournalState
WellnessState
InsightsState
AppointmentState
```

Keep transient UI state local (`useState`):

```text
Modal / bottom-sheet visibility
Selected tab
Password visibility
Expanded card
Current onboarding step
```

Prefer **TanStack Query cache** as the source of truth for server data; use global stores mainly for session/auth and cross-screen UI state. Do not put every UI variable into global state.

---

# 25. Loading Architecture

Consistent loading patterns:

```text
SkeletonCard
SkeletonList
LoadingButton
ScreenLoader
ChatTypingIndicator
```

Use skeleton placeholders (e.g. Reanimated shimmer). Never show a blank screen while waiting for API data. Use `RefreshControl` for pull-to-refresh and query `isFetching` for background refresh states.

---

# 26. Empty States

Every list/data screen needs a meaningful empty state.

### Journal

```text
لسه ما عندك مذكرات.

اكتب أول لحظة حابب تحتفظ فيها.
```

### Mood

```text
ما سجلت مزاجك لسه.

خلينا نبدأ من اليوم.
```

### Chat

```text
أنا موجود.

شو حابب تحكي عنه اليوم؟
```

Empty states guide the user toward the next action (with a CTA button).

---

# 27. Error Handling

Transform errors into human-readable Arabic messages via a global error mapper + axios interceptor.

```text
Network Error

تعذر الاتصال بالإنترنت.
تأكد من اتصالك وحاول مرة ثانية.
```

Actions:

```text
Retry
Go Back
Cancel
```

Surface errors through a `Toast`/`Snackbar` or an inline `ErrorState`. Wrap the app in an **Error Boundary** to catch render crashes. Never expose:

```text
HTTP 500
AxiosError
Stack trace
Backend exception
```

Handle offline state explicitly with `@react-native-community/netinfo`.

---

# 28. Form Validation

Validate with React Hook Form + Zod:

```text
Required fields
Email
Password
Password confirmation
Text length
Journal content
Mood selection
Appointment information
```

Clear, Arabic-friendly messages:

```text
يرجى إدخال بريد إلكتروني صحيح.
```

---

# 29. Responsive & Device Architecture

Primary target:

```text
Phone (iOS & Android)
```

Secondary:

```text
Tablet
Foldables / large screens
```

Phone should get the most attention. Do not just scale a tablet layout down.

Adapt for device realities:

```text
Safe-area insets (notch, home indicator)  → react-native-safe-area-context
Keyboard avoidance                          → KeyboardAvoidingView
Navigation (tabs vs sidebar on tablet)
Cards / spacing / typography scale
Dialogs → native Alert / BottomSheet
Charts / chat layout
Dynamic font scaling (respect OS text size)
Orientation (lock to portrait unless a screen needs landscape)
```

---

# 30. Accessibility

Implement:

* `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`
* `accessibilityState` for toggles/selection
* Screen-reader support (VoiceOver / TalkBack)
* Focus management on navigation
* Adequate contrast
* Reduced motion (`AccessibilityInfo.isReduceMotionEnabled`)
* Accessible error messages (announce with `AccessibilityInfo.announceForAccessibility`)
* Large touch targets (min 44×44 pt)
* Respect OS font scaling (avoid fixed pixel-perfect text that breaks at large sizes)

Do not communicate meaning using color alone.

---

# 31. Motion

Motion reinforces calmness. Use **Reanimated 3** + **Moti** for:

```text
Mood selection
Screen transitions (React Navigation animations)
Chat messages
Cards
Modal / bottom-sheet presentation
Exercise progress / breathing
Success states
```

Add subtle **haptics** (`expo-haptics`) on key confirmations. Avoid aggressive animation. Respect `prefers-reduced-motion` via `AccessibilityInfo`.

---

# 32. Performance

Optimize:

* Images (`expo-image` with caching)
* Fonts (preload before hiding splash)
* Bundle size (Hermes engine, avoid heavy deps)
* API requests (React Query caching + dedupe)
* Chat rendering (inverted FlashList, memoized bubbles)
* Long journal / mood lists (FlashList, not FlatList/ScrollView)
* Lazy-loaded feature screens
* Unnecessary re-renders (`React.memo`, stable selectors)
* Startup time (keep splash short, defer non-critical work)

Enable **Hermes**. Load heavy features only when required.

---

# 33. Security & Privacy

Mental-health information is sensitive application data.

The app must:

* Minimize unnecessary data exposure
* Never bundle API secrets in the app (they are extractable from binaries)
* Store tokens in Secure Store / Keychain, never plain AsyncStorage
* Clear sensitive temporary state (drafts, chat buffers) where appropriate
* Avoid logging private user content or full AI conversations in production
* Optionally gate the app with device biometrics (`expo-local-authentication`)
* Consider blurring app content in the app switcher (screen privacy)

Backend authorization remains authoritative.

---

# 34. Recommended Feature Structure

```text
features/
│
├── authentication/
│   ├── screens/
│   ├── components/
│   ├── state/
│   ├── services/
│   ├── models/
│   └── validation/
│
├── onboarding/
├── home/
│
├── ai-companion/
│   ├── screens/
│   ├── components/
│   ├── state/
│   ├── services/
│   └── models/
│
├── mood/
├── journal/
├── wellness/
├── insights/
├── professional-help/
└── profile/
```

(Note: `screens/` replaces the web `pages/`.)

---

# 35. Shared Design System

Reusable primitives (all native RN components):

```text
Button
IconButton
TextField          (wraps TextInput)
TextArea           (multiline TextInput)
Card
Chip
Badge
Avatar
Modal
BottomSheet        (@gorhom/bottom-sheet)
Snackbar
Toast
Tabs
SegmentedControl
Skeleton
EmptyState
ErrorState
LoadingState
AppText            (typography variants)
Screen             (SafeArea + theme background wrapper)
```

Product components:

```text
MoodSelector
EmotionSelector
MoodCard
DailyCheckIn
AIMessageBubble
ChatInput
JournalCard
JournalPrompt
InsightCard
ExerciseCard
BreathingVisualizer
ProfessionalCard
AppointmentCard
SafetyBanner
```

---

# 36. Screen Inventory

```text
01. Splash / Loading
02. Welcome
03. Language Selection
04. Onboarding
05. Goals
06. Privacy & Consent
07. Login
08. Register
09. Forgot Password
10. Home
11. Daily Check-In
12. Mood Selection
13. Mood History
14. Mood Details
15. AI Companion
16. Conversation
17. Journal
18. Create Journal Entry
19. Journal Details
20. Wellness
21. Exercise Details
22. Active Exercise
23. Exercise Completion
24. Insights
25. Professional Help
26. Professional Profile
27. Booking
28. Appointments
29. Profile
30. Settings
31. Privacy
32. Safety / Emergency Support
```

Reconcile with the SRS and Figma before implementation.

---

# 37. Workflow Coverage Matrix

| Workflow             | Screens       | Components          | API         | State         | Status |
| -------------------- | ------------- | ------------------- | ----------- | ------------- | ------ |
| Registration         | Register      | AuthForm            | POST        | Auth          |        |
| Login                | Login         | AuthForm            | POST        | Auth          |        |
| Onboarding           | Onboarding    | Step components     | POST/PATCH  | Onboarding    |        |
| Daily mood           | Check-in      | MoodSelector        | POST        | Mood          |        |
| Mood history         | Mood          | Chart/Cards         | GET         | Mood          |        |
| AI chat              | Companion     | Chat components     | POST/STREAM | Chat          |        |
| Journal              | Journal       | Journal components  | CRUD        | Journal       |        |
| Wellness             | Wellness      | Exercise components | GET         | Wellness      |        |
| Insights             | Insights      | Insight cards       | GET         | Insights      |        |
| Professional support | Professionals | Professional cards  | GET         | Professionals |        |
| Booking              | Booking       | Booking form        | POST        | Appointment   |        |
| Profile              | Profile       | Profile components  | GET/PATCH   | User          |        |
| Safety               | Safety        | Safety components   | GET/STATIC  | Safety        |        |

Every SRS workflow must appear here.

---

# 38. Implementation Rules

Before implementing any feature:

1. Understand the SRS requirement.
2. Inspect the relevant Figma design.
3. Identify reusable components.
4. Identify required API calls (and query keys).
5. Define state (server via React Query, UI via local/store).
6. Define loading / empty / error / success states.
7. Implement the UI with native primitives.
8. Connect the API through hooks/services.
9. Test RTL (Arabic) **and** LTR.
10. Test on both iOS and Android.
11. Test across phone sizes + safe areas + keyboard.
12. Test accessibility (VoiceOver / TalkBack).
13. Verify the complete user workflow.

---

# 39. Final Definition of Done

A feature is complete when:

```text
Requirement → User Flow → Screen → Reusable Components → State → API →
Validation → Loading → Empty → Error → Success → RTL → iOS → Android →
Responsive/Safe-area → Accessibility → Testing
```

has been implemented and verified.

---

# 40. AI Coding Agent Instructions

When implementing this project:

**First** — Analyze the entire repository before changing architecture.

**Second** — Analyze the SRS and map requirements to features.

**Third** — Analyze the Figma design and identify colors, typography, spacing, components, layouts, navigation, patterns.

**Fourth** — Create the design system (tokens, theme provider, `AppText`, primitives).

**Fifth** — Implement the application shell:

```text
Theme provider
RTL setup (I18nManager)
Localization (i18next)
Navigation (Root + Auth + Tabs)
Auth flow & protected navigators
API client + interceptors
React Query provider
Error boundary + error mapping
Secure storage
Font preloading + splash control
```

**Sixth** — Implement features incrementally. Never generate the entire app as one giant implementation.

**Seventh** — After every feature, verify:

```text
Happy path
Loading
Empty
Error
Success
RTL
iOS + Android
Safe-area + keyboard
Accessibility
API failure / offline
```

---

# 41. Important Design Rule

The final application should combine:

**SH Freud UI Kit visual language** · **Thmanyah Arabic typography** · **Warm natural color palette** · **Arabic RTL-first UX** · **Jordanian cultural context** · **Mental-health-specific interaction patterns** · **Native mobile feel (iOS & Android)**

The goal is not a generic Arabic app, nor a website in a WebView.

The goal is a **distinctive, native Arabic mental-health mobile experience that feels calm, personal, trustworthy, and culturally natural.**
