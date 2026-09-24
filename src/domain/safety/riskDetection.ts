/**
 * [ASSUMPTION] No real risk-detection/escalation policy exists yet
 * (product-definition.md Open Question #3 — "what language triggers
 * escalation, and what the app shows/does when it fires" is explicitly
 * unresolved). This is a minimal, clearly-flagged keyword heuristic so the
 * business rule "the AI must escalate when risk language appears" (spec
 * §16 Safety) has SOME enforcement rather than none — it is NOT a clinical
 * risk-assessment tool and must be replaced by a real policy (ideally
 * server-side, ideally clinician-reviewed) before ship.
 */
const riskKeywords = [
  'انتحار',
  'اذي نفسي',
  'أذي نفسي',
  'ايذاء نفسي',
  'إيذاء نفسي',
  'ما بدي اعيش',
  'ما بدي أعيش',
  'مش قادر اكمل',
  'مش قادر أكمل',
  'بدي اموت',
  'بدي أموت',
  'suicide',
  'kill myself',
  'self harm',
  'self-harm',
  'end my life',
  "don't want to live",
];

export function containsRiskLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  return riskKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}
