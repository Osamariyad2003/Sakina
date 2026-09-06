// Sakina AI Companion proxy.
//
// Why this exists: the Anthropic API key must NEVER ship inside a mobile app
// bundle (it would be extractable from every install). The app calls THIS
// service, and this service holds the key and calls Claude. Deploy it on any
// Node host (Render, Fly, a container, a serverless function) and point the
// app's EXPO_PUBLIC_API_BASE_URL at it, then set EXPO_PUBLIC_AI_COMPANION_LIVE=true.
//
// Contract (matches src/features/ai-companion/services/companionService.ts):
//   POST /companion/message   body: { messages: [{ role: 'user'|'assistant', content: string }] }
//                             ->   { reply: string }

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// The companion's persona + guardrails. Kept here (server-side) so it can be
// tuned without shipping an app update. Arabic-first (Jordanian), warm, brief,
// and explicitly NON-CLINICAL — it never diagnoses or claims to be a clinician.
const SYSTEM_PROMPT = [
  'You are "Sakina", a warm, supportive mental-health companion in an Arabic-first app.',
  'Default to natural, colloquial Jordanian Arabic; if the user writes in English, reply in English.',
  'Be brief and human — usually 1–3 sentences. Listen, reflect feelings, and ask one gentle open question.',
  'You are NOT a doctor or therapist and you never diagnose, name conditions, or prescribe. Say so if asked for medical advice, and gently encourage reaching out to a qualified professional.',
  'If the user expresses thoughts of self-harm, suicide, or being in danger, respond with calm care, take it seriously, and direct them to immediate support (the app has a Support & Emergency page) and to contact a trusted person or local emergency services now. Do not attempt to counsel a crisis yourself.',
  'Never claim to store data, contact anyone, or take actions in the real world. Stay within a supportive conversation.',
].join(' ');

// Minimal server-side safety net (mirrors the app's client-side check). The app
// already short-circuits risk language before calling this endpoint; this is
// defense-in-depth so a crisis message is never routed to the model even if a
// different client calls the proxy directly. NOT a clinical risk tool.
const RISK_KEYWORDS = [
  'انتحار', 'اذي نفسي', 'أذي نفسي', 'ايذاء نفسي', 'إيذاء نفسي', 'ما بدي اعيش', 'ما بدي أعيش',
  'بدي اموت', 'بدي أموت', 'suicide', 'kill myself', 'self harm', 'self-harm', 'end my life', "don't want to live",
];
const RISK_REPLY =
  'سمعتك، وشو ما تحكيه مهم. أنا رفيق للدعم بس مش بديل عن مختص، وحاسس إنه الوضع أكبر من اللي فيني ساعد فيه لحالي. ' +
  'رجاءً افتح صفحة الدعم والطوارئ بالتطبيق الآن، أو تواصل مع حدا بتثق فيه أو مع خدمات الطوارئ فوراً.';

function containsRisk(text) {
  const lower = (text || '').toLowerCase();
  return RISK_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/companion/message', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const cleaned = messages
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content }));

    if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'messages must end with a user turn' });
    }

    const lastUser = cleaned[cleaned.length - 1].content;
    if (containsRisk(lastUser)) {
      return res.json({ reply: RISK_REPLY, riskFlagged: true });
    }

    const response = await client.messages.create({
      model: 'claude-opus-5', // per Anthropic guidance; switch to claude-haiku-4-5 for lower cost
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cleaned,
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    return res.json({ reply, riskFlagged: false });
  } catch (err) {
    console.error('[companion-proxy] error', err?.status ?? '', err?.message ?? err);
    // Don't leak internals to the client; the app maps this to a friendly error.
    return res.status(502).json({ error: 'companion_unavailable' });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Sakina companion proxy listening on :${port}`));
