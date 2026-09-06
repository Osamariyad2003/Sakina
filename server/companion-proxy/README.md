# Sakina Companion Proxy

A tiny backend that lets the Sakina app use **real Claude** for the AI Companion
**without ever putting the Anthropic API key in the mobile app**. The app talks
to this service; this service holds the key and calls Anthropic.

```
App  ──POST /companion/message──▶  this proxy  ──▶  Anthropic Messages API
      { messages: [...] }                            (key lives here only)
        ◀──── { reply } ────────
```

## Why a proxy (not direct SDK calls in the app)

An API key shipped inside a React Native bundle is extractable from every
install. It must live on a server. This also lets you tune the system prompt,
enforce server-side safety, add auth/rate-limiting, and swap models without an
app release.

## Run locally

```bash
cd server/companion-proxy
npm install
cp .env.example .env      # then paste your ANTHROPIC_API_KEY
npm start                 # listens on http://localhost:8787
```

Smoke test:

```bash
curl -s http://localhost:8787/companion/message \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"مرحبا، حاسس اني متوتر شوي"}]}'
```

## Point the app at it

Set these when building the app (e.g. in `.env`, EAS env, or the shell):

```
EXPO_PUBLIC_API_BASE_URL=https://<your-deployed-proxy>
EXPO_PUBLIC_AI_COMPANION_LIVE=true
```

- `EXPO_PUBLIC_API_BASE_URL` — the origin of this proxy (the app appends `config.companionApiPath` = `/companion/message`).
- `EXPO_PUBLIC_AI_COMPANION_LIVE=true` — flips only the Companion to the live path; every other feature stays on its mock. Leave unset for the mock companion.

For local device testing use your machine's LAN IP (not `localhost`), e.g.
`EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8787`.

## Model & cost

Defaults to `claude-opus-5`. For a high-volume supportive chat you may prefer
`claude-haiku-4-5` — change the `model` in `index.js`. Keep `max_tokens` modest
(replies are meant to be short).

## Safety (important, not optional before real users)

- The app **and** this proxy run a keyword self-harm check and short-circuit to a
  supportive crisis reply that points to the in-app Support & Emergency page —
  crisis language is never sent to the model.
- That keyword check is a **placeholder**, not a clinical risk tool
  (product-definition.md Open Question #3). Before shipping to real users,
  replace it with a real, ideally clinician-reviewed, escalation policy, add
  authentication + rate limiting, and confirm the model provider's data-handling
  guarantees for sensitive mental-health content (Open Question #4/#8).
- The system prompt forbids diagnosis and directs users to professionals. Review
  and localize it with a clinician before launch.

## Deploy

Any Node 18+ host works. Set `ANTHROPIC_API_KEY` as a secret (never in code):

- **Render / Railway / Fly**: a web service running `npm start`.
- **A container**: `node index.js`, expose `PORT`.
- **Serverless (Vercel/Lambda)**: lift the `/companion/message` handler into a
  function; keep the same request/response contract.
