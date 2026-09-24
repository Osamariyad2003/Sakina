/**
 * [ASSUMPTION] No real risk-detection/escalation policy exists yet
 * (product-definition.md Open Question #3 — "what language triggers
 * escalation, and what the app shows/does when it fires" is explicitly
 * unresolved). This is a minimal, clearly-flagged keyword heuristic so the
 * business rule "the AI must escalate when risk language appears" (spec
 * §16 Safety) has SOME enforcement rather than none — it is NOT a clinical
 * risk-assessment tool and must be replaced by a real policy (ideally
 * server-side, ideally clinician-reviewed) before ship.
 *
 * This is the on-device first line: it works offline and before any network
 * call. The backend runs its own, equivalent classifier and the app raises the
 * crisis UI if either one fires. Keep the two term lists in step
 * (Sakina-backend: riskDetection.service.js). Recall over precision — a false
 * positive only shows support resources.
 */
const riskKeywords = [
  // Arabic: Modern Standard + Jordanian/Levantine
  'انتحار',
  'اذي نفسي',
  'أذي نفسي',
  'ايذاء نفسي',
  'إيذاء نفسي',
  'اؤذي نفسي',
  'أؤذي نفسي',
  'بدي اموت',
  'بدي أموت',
  'بدي أنتحر',
  'بدي أقتل نفسي',
  'بدي أقتل حالي',
  // Broader stems, so the phrase is caught without "بدي" in front of it
  // (e.g. "أفكر أن أقتل نفسي", "أريد أن أنهي حياتي").
  'أقتل نفسي',
  'أقتل حالي',
  'أنهي حياتي',
  'الكل أحسن بدوني',
  'أحسن لو ما كنت موجود',
  'بدي أخلص من حياتي',
  'بدي أنهي حياتي',
  'بدي أذي نفسي',
  'ما بدي اعيش',
  'ما بدي أعيش',
  'مابدي أعيش',
  'نفسي أموت',
  'حياتي ما الها معنى',
  'حياتي ما الها قيمة',
  'لا معنى للحياة',
  'أريد أن أموت',
  'مش قادر اكمل',
  'مش قادر أكمل',
  // English
  'suicide',
  'suicidal',
  'kill myself',
  'self harm',
  'self-harm',
  'hurt myself',
  'end my life',
  'take my own life',
  'want to die',
  'wanna die',
  "don't want to live",
  'dont want to live',
  'better off dead',
  'better off without me',
  'end it all',
  'no reason to live',
];

// Arabic diacritics + tatweel, then fold alef/ya/ta-marbuta variants, so
// "بدّي أموت" and "بدي اموت" compare equal.
const ARABIC_MARKS = /[ً-ٰٟـ]/g;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(ARABIC_MARKS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[‘’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const normalizedKeywords = riskKeywords.map(normalize);

export function containsRiskLanguage(text: string): boolean {
  const haystack = normalize(text);
  return normalizedKeywords.some((keyword) => haystack.includes(keyword));
}
