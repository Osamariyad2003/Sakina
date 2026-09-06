# Frontend Engineering & UI Architecture Specification

# 1. Project Overview

## Project Name

**[FINAL APP NAME]**

## Product Type

Arabic-first mental-health and emotional-wellbeing application designed specifically for users in Jordan.

## Product Vision

Build a calm, private, supportive digital space where users can understand their emotions, reflect on their experiences, build healthy habits, and access appropriate mental-health support.

The application should feel like a **safe personal space**, not a medical dashboard.

The experience should combine:

- AI-powered emotional support
- Mood tracking
- Journaling
- Wellness exercises
- Personalized insights
- Mental-health education
- Professional support
- Safety and escalation resources

The AI should be positioned as a **supportive companion**, not a doctor, psychiatrist, or replacement for professional care.

---

# 2. Target Audience

Primary users:

- Young adults in Jordan
- Arabic-speaking users
- University students
- Early-career users
- People experiencing stress, anxiety, loneliness, emotional difficulties, or burnout
- Users who want to understand their emotions and build healthier habits

The product should remain accessible to users who have no previous experience with mental-health applications.

---

# 3. Product Experience

The application should feel:

- Calm
- Warm
- Human
- Private
- Trustworthy
- Non-judgmental
- Modern
- Arabic-first
- Culturally appropriate

Avoid making the application feel like:

- A hospital system
- A clinical dashboard
- A generic chatbot
- A productivity application
- A social network

The primary emotional message is:

> **"You have a safe place to pause, understand what you're feeling, and take the next small step."**

---

# 4. UI / Design Reference

## Primary Design Reference

**SH Freud UI Kit — v1.7 Demo**

The provided Figma design should be treated as the primary visual reference for:

- Layout principles
- Component style
- Cards
- Forms
- Navigation
- Spacing
- Visual hierarchy
- Interaction patterns
- Illustration direction
- Emotional tone

However, the UI should **not be copied blindly**.

The existing design language should be adapted into an Arabic-first Jordanian mental-health product.

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
```

---

# 5. Typography System

## Primary Arabic Typeface

Use the provided **Thmanyah Typeface Family**.

### Thmanyah Sans

Primary UI font.

Use for:

- Navigation
- Buttons
- Forms
- Labels
- Body text
- Cards
- Input fields
- Error messages
- Notifications
- Metadata

### Thmanyah Serif Display

Display typography.

Use for:

- Hero headings
- Major emotional statements
- Onboarding headings
- Section introductions
- Important empty states

Example:

```text
كيف حاسس اليوم؟
```

### Thmanyah Serif Text

Use selectively for:

- Journal content
- Long-form educational content
- Reflective content
- Quotes
- Editorial-style sections

## Typography Principle

Do not use Serif Display for normal UI text.

Typography should create a distinction between:

```text
Emotional / expressive content
        ↓
Thmanyah Serif Display

Functional / interactive content
        ↓
Thmanyah Sans
```

---

# 6. Color System

The visual system should be based on **calm natural colors**, avoiding aggressive medical colors.

## Core Palette

```text
Background Primary
#F5F1EA

Surface
#FCFAF7

Primary
#6F8376

Primary Dark
#34433D

Warm Accent
#C9A58D

Soft Blue
#AEBFC0

Text Primary
#292D2B

Text Secondary
#737A76
```

## Semantic Colors

```text
Success
Use a muted natural green.

Warning
Use a soft warm amber.

Error
Use a muted terracotta/red.

Info
Use the soft blue family.
```

Do not use extremely saturated red, green, or blue unless required for a clear safety/status indication.

---

# 7. Design Tokens

Create centralized tokens.

```text
colors/
typography/
spacing/
radius/
shadows/
breakpoints/
motion/
```

Components must consume semantic tokens rather than hardcoded values.

Example:

```text
background.primary
surface.primary
brand.primary
text.primary
text.secondary
status.error
status.success
```

---

# 8. RTL Architecture

Arabic is the **primary language and source layout direction**.

The application must be RTL-first.

Implement:

- RTL navigation
- RTL forms
- RTL cards
- RTL chat
- RTL lists
- RTL spacing
- RTL icons
- RTL animations
- RTL page transitions

English should be supported as an optional LTR experience.

Language switching:

```text
Arabic → RTL

English → LTR
```

Do not build the English layout first and mirror it later.

---

# 9. Application Navigation

Recommended primary navigation:

```text
Home
AI Companion
Mood
Journal
Wellness
Profile
```

Depending on the final Figma design, this can be implemented as:

```text
Bottom Navigation
```

on mobile.

Desktop/tablet may use:

```text
Sidebar / Adaptive Navigation
```

The active navigation item must have a clear visual state.

---

# 10. Main Application Flows

## Flow 1 — First Launch

```text
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
Home
```

---

# 11. Authentication

## Screens

```text
Welcome
Login
Register
Forgot Password
Reset Password
```

## Responsibilities

Authentication is responsible for:

- Account creation
- Login
- Logout
- Session restoration
- Password recovery
- Protected routes
- Token management

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

# 12. Home

## Responsibility

The Home screen is the user's emotional starting point.

It should answer:

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

# 13. Daily Mood Check-In

## Responsibility

Allow users to record their emotional state quickly.

## Flow

```text
Mood
 ↓
Emotion
 ↓
Possible Trigger
 ↓
Optional Note
 ↓
Save
 ↓
Confirmation
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

# 14. Mood Tracking

## Responsibility

Allow users to understand emotional patterns over time.

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
MoodChart
MoodHistoryCard
EmotionChip
TriggerChip
MoodEntry
DateSelector
InsightCard
```

## Edge States

```text
No Mood Data
Loading History
Failed to Load
Incomplete Data
No Data For Selected Period
```

---

# 15. AI Companion

## Responsibility

Provide conversational emotional support.

## Main Components

```text
ChatHeader
ConversationList
AIMessageBubble
UserMessageBubble
TypingIndicator
ChatInput
SuggestedPrompt
RetryMessage
ConversationEmptyState
```

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

When a conversation requires professional or emergency support, the UI should provide an appropriate escalation path.

---

# 16. Journaling

## Responsibility

Provide a private space for reflection.

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
JournalEditor
JournalPrompt
JournalEntry
DateHeader
DeleteConfirmation
AIReflectionCard
```

## Empty State

```text
لسه ما كتبت شيء اليوم.

اكتب أول شيء يخطر ببالك.
```

---

# 17. Wellness

## Responsibility

Provide short activities that help users regulate stress and emotions.

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
Exercise Details
 ↓
Preparation
 ↓
Exercise
 ↓
Progress
 ↓
Completion
```

## Components

```text
ExerciseCard
ExerciseTimer
ProgressIndicator
BreathingVisualizer
ExerciseInstructions
CompletionState
```

---

# 18. Insights

## Responsibility

Transform collected emotional data into understandable patterns.

Potential insights:

```text
Mood Trends
Frequent Emotions
Common Triggers
Weekly Changes
Positive Patterns
Personalized Suggestions
```

The language should remain supportive.

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

# 19. Professional Help

## Responsibility

Connect users to appropriate professional support when needed.

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

---

# 20. Safety & Emergency Support

Safety must be treated as a dedicated product capability.

Potential components:

```text
SafetyNotice
CrisisSupportCard
EmergencyResources
ProfessionalHelpCard
SafetyCheck
```

Safety information must be easy to access.

Do not hide important support information behind multiple navigation layers.

---

# 21. API Architecture

Use:

```text
UI
 ↓
State / Controller
 ↓
Service / Use Case
 ↓
Repository
 ↓
API Client
 ↓
Backend
```

Never put API requests directly inside visual components.

Suggested structure:

```text
core/
    api/
    auth/
    errors/
    storage/

features/
    authentication/
    mood/
    ai-companion/
    journal/
    wellness/
    insights/
    professional-help/
```

---

# 22. Data Models

Create typed models for API data.

Potential models:

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

Do not use unstructured objects throughout the application when typed models are appropriate.

---

# 23. State Management

Use feature-level state management.

Example:

```text
AuthenticationState
MoodState
ChatState
JournalState
WellnessState
InsightsState
AppointmentState
```

Keep transient UI state local.

Examples:

```text
Modal visibility
Selected tab
Password visibility
Expanded card
Current onboarding step
```

Do not place every UI variable into global state.

---

# 24. Loading Architecture

Use consistent loading patterns.

Examples:

```text
SkeletonCard
SkeletonList
LoadingButton
PageLoader
ChatTypingIndicator
```

Do not show a blank screen while waiting for API data.

---

# 25. Empty States

Every list/data screen must have a meaningful empty state.

Examples:

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

Empty states should guide the user toward the next action.

---

# 26. Error Handling

Errors should be transformed into human-readable Arabic messages.

Example:

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

Never expose:

```text
HTTP 500
AxiosError
Stack trace
Backend exception
```

to normal users.

---

# 27. Form Validation

Validate:

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

Validation messages must be clear and Arabic-friendly.

Example:

```text
يرجى إدخال بريد إلكتروني صحيح.
```

---

# 28. Responsive Architecture

Primary target:

```text
Mobile
```

Secondary:

```text
Tablet
Desktop
```

Mobile should receive the most attention because the product is an emotionally personal experience.

Do not simply scale desktop down.

Adapt:

```text
Navigation
Cards
Spacing
Typography
Dialogs
Forms
Charts
Chat
```

---

# 29. Accessibility

Implement:

- Semantic elements
- Keyboard navigation
- Screen-reader labels
- Accessible forms
- Focus management
- Visible focus states
- Adequate contrast
- Reduced motion
- Accessible error messages
- Large touch targets

Do not communicate meaning using color alone.

---

# 30. Motion

Motion should reinforce calmness.

Use subtle transitions for:

```text
Mood selection
Page transitions
Chat messages
Cards
Modal presentation
Exercise progress
Success states
```

Avoid aggressive animation.

Respect:

```text
prefers-reduced-motion
```

---

# 31. Performance

Optimize:

- Images
- Fonts
- Bundle size
- API requests
- Chat rendering
- Long journal lists
- Mood history
- Lazy-loaded routes
- Unnecessary re-renders

Load heavy features only when required.

---

# 32. Security & Privacy

Mental-health information should be treated as sensitive application data.

The frontend must:

- Minimize unnecessary data exposure
- Never expose API secrets
- Never expose private backend credentials
- Secure authentication storage according to platform capabilities
- Clear sensitive temporary state where appropriate
- Avoid logging private user content
- Avoid logging full AI conversations in production

Backend authorization remains authoritative.

---

# 33. Recommended Feature Structure

```text
features/
│
├── authentication/
│   ├── pages/
│   ├── components/
│   ├── state/
│   ├── services/
│   ├── models/
│   └── validation/
│
├── onboarding/
│
├── home/
│
├── ai-companion/
│   ├── pages/
│   ├── components/
│   ├── state/
│   ├── services/
│   └── models/
│
├── mood/
│
├── journal/
│
├── wellness/
│
├── insights/
│
├── professional-help/
│
└── profile/
```

---

# 34. Shared Design System

Create reusable components:

```text
Button
IconButton
TextField
TextArea
Card
Chip
Badge
Avatar
Modal
BottomSheet
Snackbar
Toast
Tabs
SegmentedControl
Skeleton
EmptyState
ErrorState
LoadingState
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
ProfessionalCard
AppointmentCard
SafetyBanner
```

---

# 35. Screen Inventory

Initial screen inventory:

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

The final inventory must be reconciled with the SRS and Figma design before implementation.

---

# 36. Workflow Coverage Matrix

Create and maintain:

| Workflow | Screens | Components | API | State | Status |
|---|---|---|---|---|---|
| Registration | Register | AuthForm | POST | Auth | |
| Login | Login | AuthForm | POST | Auth | |
| Onboarding | Onboarding | Step components | POST/PATCH | Onboarding | |
| Daily mood | Check-in | MoodSelector | POST | Mood | |
| Mood history | Mood | Chart/Cards | GET | Mood | |
| AI chat | Companion | Chat components | POST/STREAM | Chat | |
| Journal | Journal | Journal components | CRUD | Journal | |
| Wellness | Wellness | Exercise components | GET | Wellness | |
| Insights | Insights | Insight cards | GET | Insights | |
| Professional support | Professionals | Professional cards | GET | Professionals | |
| Booking | Booking | Booking form | POST | Appointment | |
| Profile | Profile | Profile components | GET/PATCH | User | |
| Safety | Safety | Safety components | GET/STATIC | Safety | |

Every SRS workflow must appear in this matrix.

---

# 37. Implementation Rules

Before implementing any feature:

1. Understand the SRS requirement.
2. Inspect the relevant Figma design.
3. Identify reusable components.
4. Identify required API calls.
5. Define state.
6. Define loading/empty/error/success states.
7. Implement the UI.
8. Connect the API.
9. Test RTL.
10. Test responsive behavior.
11. Test accessibility.
12. Verify the complete user workflow.

---

# 38. Final Definition of Done

A feature is NOT complete when the UI looks correct.

A feature is complete when:

```text
Requirement
    ↓
User Flow
    ↓
Screen
    ↓
Reusable Components
    ↓
State
    ↓
API
    ↓
Validation
    ↓
Loading
    ↓
Empty
    ↓
Error
    ↓
Success
    ↓
RTL
    ↓
Responsive
    ↓
Accessibility
    ↓
Testing
```

has been implemented and verified.

---

# 39. AI Coding Agent Instructions

When implementing this project:

### First

Analyze the entire repository before changing architecture.

### Second

Analyze the SRS and map requirements to features.

### Third

Analyze the Figma design and identify:

```text
Colors
Typography
Spacing
Components
Layouts
Navigation
Patterns
```

### Fourth

Create the design system.

### Fifth

Implement the application shell:

```text
Theme
RTL
Localization
Routing
Authentication
API client
Error handling
```

### Sixth

Implement features incrementally.

Never generate the entire application as one giant implementation.

### Seventh

After every feature, verify:

```text
Happy path
Loading
Empty
Error
Success
RTL
Responsive
Accessibility
API failure
```

---

# 40. Important Design Rule

The final application should combine:

**SH Freud UI Kit visual language**

+

**Thmanyah Arabic typography**

+

**Warm natural color palette**

+

**Arabic RTL-first UX**

+

**Jordanian cultural context**

+

**Mental-health-specific interaction patterns**

The goal is not to produce a generic Arabic application.

The goal is to create a **distinctive Arabic mental-health experience that feels calm, personal, trustworthy, and culturally natural.**