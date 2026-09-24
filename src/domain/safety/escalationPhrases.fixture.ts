/**
 * SHARED FIXTURE — keep byte-identical with
 * `Sakina-backend/tests/fixtures/escalationPhrases.js`.
 *
 * The app and the backend each run their own risk detector (the app's works
 * offline and before any network call; the backend's is the server-side
 * check). Two independent keyword lists drift silently, and a drift here
 * means a person in crisis is not escalated. This fixture is the contract
 * both sides are tested against: every phrase below MUST escalate in BOTH
 * repos, and `mustNotEscalate` must escalate in neither.
 *
 * Adding a phrase: add it here, copy the file to the other repo, run both
 * test suites, and extend whichever detector fails.
 *
 * [ASSUMPTION] This list is a floor, not a clinical instrument — the real
 * escalation policy is still unresolved (product-definition.md Open
 * Question #3). Recall over precision: a false positive only surfaces
 * support resources.
 */

/** Every one of these must be detected as risk language by both detectors. */
export const mustEscalate = [
  // --- English, direct ---
  'I want to kill myself',
  'thinking about suicide',
  'I feel suicidal today',
  'I want to end my life',
  'I might take my own life',
  'I want to die',
  'i wanna die',
  'I keep wanting to hurt myself',
  'this is self harm',
  'this is self-harm',
  'I think I should end it all',
  "I don't want to live anymore",
  'dont want to live anymore',
  'everyone would be better off without me',
  'they would be better off dead',
  'there is no reason to live',

  // --- Arabic: Modern Standard ---
  'أفكر في الانتحار',
  'أريد أن أموت',
  'أريد أن أنهي حياتي',
  'لا معنى للحياة',
  'أفكر أن أقتل نفسي',
  'أريد أن أؤذي نفسي',
  'إيذاء نفسي',

  // --- Arabic: Jordanian / Levantine ---
  'بدي أموت',
  'بدي اموت',
  'بدي أنتحر',
  'بدي أقتل نفسي',
  'بدي أقتل حالي',
  'بدي أخلص من حياتي',
  'بدي أنهي حياتي',
  'بدي أذي نفسي',
  'ما بدي أعيش',
  'ما بدي اعيش',
  'مابدي أعيش',
  'نفسي أموت',
  'حياتي ما الها معنى',
  'حياتي ما الها قيمة',
  'الكل أحسن بدوني',
  'أحسن لو ما كنت موجود',

  // --- Normalisation cases: diacritics, tatweel, alef/ya/ta-marbuta ---
  'بدّي أموت',
  'بــدي أموت',
  'بدي امـوت',
  'ٱريد ان اموت',
] as const;

/**
 * Ordinary distress that must NOT trigger the crisis hand-off. Escalating
 * these would teach people that saying how they feel takes the companion
 * away from them.
 */
export const mustNotEscalate = [
  'I feel sad today',
  'I am so tired of work',
  'I had a panic attack last night',
  'I feel hopeless about my exams',
  'my friend died last year',
  'I am dying to see that film',
  'this deadline is killing me',
  'حاسس بضيقة اليوم',
  'تعبان من الدوام',
  'زعلان من صاحبي',
  'يومي كان صعب',
] as const;
