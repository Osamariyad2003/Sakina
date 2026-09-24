# `src/domain`

Business rules that more than one feature depends on.

Anything here must be **framework-free**: no React, no React Native, no i18n,
no storage, no HTTP. That is what lets these rules be unit-tested under plain
Node, and what stops a feature from importing another feature's internals to
get at a shared rule (see `docs/architecture-review.md` §6.3).

A rule used by exactly one feature stays in that feature's `models/`. Move it
here when a second feature needs it — not before.

## Contents

- `safety/` — risk-language detection used by the AI Companion, AI Therapy and
  Community. Its keyword list is mirrored by the backend; the shared fixture
  in `escalationPhrases.fixture.ts` is asserted by both repos' test suites so
  the two cannot drift apart silently.
