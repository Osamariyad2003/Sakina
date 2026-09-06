/**
 * AI Mental Illness Symptom Checker — content, types, and pure helpers.
 *
 * Structure/flow mirrors the SH Freud UI Kit v1.7 "AI Symptom Checker" flow
 * (intro → method → symptoms + finding score → extra info → analyzing →
 * possible conditions → condition detail; plus a guided "Dr. Freud AI"
 * chatbot path → session complete → history). The Figma file is a community
 * file with no editor access, so this is the flow reproduced with 100% Sakina
 * tokens/primitives and bilingual (ar/en) content — NO visual value is taken
 * from Figma.
 *
 * ⚠️ NOT A DIAGNOSIS. Neither spec defines a clinical taxonomy, a matching
 * model, or an escalation policy (product-definition.md Open Questions
 * #2/#3/#4). Everything below is illustrative, non-clinical DRAFT content:
 * the "matches", "risk factors", "severity", and "likelihood" are a
 * deterministic demo heuristic, never a medical assessment. Every results
 * surface must show the non-diagnostic disclaimer and a route to real
 * support. Replace with a clinician-reviewed model + real risk policy before
 * ship. See ASSUMPTIONS.md.
 */

export type CheckerMethod = 'manual' | 'chatbot';

export type Severity = 'lowToMild' | 'moderate' | 'severe' | 'verySevere';
export type MatchStrength = 'low' | 'medium' | 'high';

export interface SymptomOption {
  id: string;
  labelAr: string;
  labelEn: string;
}

/** Mental-health symptom catalog (draft — see file header). */
export const symptomCatalog: SymptomOption[] = [
  { id: 'moodSwing', labelAr: 'تقلّب المزاج', labelEn: 'Mood swings' },
  { id: 'sadness', labelAr: 'حزن', labelEn: 'Sadness' },
  { id: 'anxiety', labelAr: 'قلق', labelEn: 'Anxiety' },
  { id: 'avoidance', labelAr: 'تجنّب', labelEn: 'Avoidance' },
  { id: 'selfHarm', labelAr: 'إيذاء النفس', labelEn: 'Self-harm' },
  { id: 'sleepless', labelAr: 'أرق', labelEn: 'Sleeplessness' },
  { id: 'obsessions', labelAr: 'وساوس', labelEn: 'Obsessions' },
  { id: 'panic', labelAr: 'نوبات هلع', labelEn: 'Panic' },
  { id: 'socialAnxiety', labelAr: 'قلق اجتماعي', labelEn: 'Social anxiety' },
  { id: 'hardToTalk', labelAr: 'صعوبة بالكلام', labelEn: 'Hard to talk' },
  { id: 'lowEnergy', labelAr: 'طاقة منخفضة', labelEn: 'Low energy' },
  { id: 'appetiteChange', labelAr: 'تغيّر الشهية', labelEn: 'Appetite change' },
  { id: 'concentration', labelAr: 'صعوبة التركيز', labelEn: 'Trouble concentrating' },
  { id: 'hopelessness', labelAr: 'فقدان الأمل', labelEn: 'Hopelessness' },
  { id: 'flashbacks', labelAr: 'ذكريات مؤلمة متكررة', labelEn: 'Flashbacks' },
  { id: 'irritability', labelAr: 'سرعة الانفعال', labelEn: 'Irritability' },
];

/** Physical symptoms surfaced in the chatbot flow. */
export const physicalSymptomCatalog: SymptomOption[] = [
  { id: 'fatigue', labelAr: 'إرهاق', labelEn: 'Fatigue' },
  { id: 'rapidHeartbeat', labelAr: 'تسارع ضربات القلب', labelEn: 'Rapid heartbeat' },
  { id: 'sleepy', labelAr: 'نعاس', labelEn: 'Sleepy' },
  { id: 'appetiteChange', labelAr: 'تغيّر الشهية', labelEn: 'Change in appetite' },
  { id: 'muscleTension', labelAr: 'شدّ عضلي', labelEn: 'Muscle tension' },
  { id: 'headaches', labelAr: 'صداع', labelEn: 'Headaches' },
  { id: 'numbness', labelAr: 'خدر', labelEn: 'Numbness' },
];

/** Emotions offered at the start of the chatbot flow. */
export const checkerEmotions: SymptomOption[] = [
  { id: 'sadness', labelAr: 'حزن', labelEn: 'Sadness' },
  { id: 'anxious', labelAr: 'قلق', labelEn: 'Anxious' },
  { id: 'restless', labelAr: 'تململ', labelEn: 'Restless' },
  { id: 'pain', labelAr: 'ألم', labelEn: 'Pain' },
  { id: 'insecure', labelAr: 'عدم أمان', labelEn: 'Insecure' },
];

/** Illustrative medication list for the "current medications" search steps. */
export const medicationCatalog: { id: string; label: string }[] = [
  { id: 'paracetamol', label: 'Paracetamol' },
  { id: 'atorvastatin', label: 'Atorvastatin' },
  { id: 'omeprazole', label: 'Omeprazole' },
  { id: 'levothyroxine', label: 'Levothyroxine' },
  { id: 'metformin', label: 'Metformin' },
  { id: 'lisinopril', label: 'Lisinopril' },
  { id: 'sertraline', label: 'Sertraline' },
  { id: 'fluoxetine', label: 'Fluoxetine' },
];

/** Five emoji faces for the "your current emotion" picker. */
export const emotionFaces: { id: string; emoji: string }[] = [
  { id: 'emo1', emoji: '😞' },
  { id: 'emo2', emoji: '🙁' },
  { id: 'emo3', emoji: '😐' },
  { id: 'emo4', emoji: '🙂' },
  { id: 'emo5', emoji: '😄' },
];

export interface ConditionContent {
  id: string;
  nameAr: string;
  nameEn: string;
  shortAr: string;
  shortEn: string;
  descriptionAr: string;
  descriptionEn: string;
  /** Symptom ids that count toward a match. */
  symptomIds: string[];
  severity: Severity;
  /** Illustrative 0-100 "risk factor" shown on the detail (NOT clinical). */
  riskFactor: number;
  /** "N out of 10 people" figure for the "how common" viz. */
  commonPerTen: number;
  symptomsAr: string[];
  symptomsEn: string[];
  treatmentsAr: string[];
  treatmentsEn: string[];
  highlightsAr: string[];
  highlightsEn: string[];
}

export const conditionCatalog: ConditionContent[] = [
  {
    id: 'mdd',
    nameAr: 'الاكتئاب الجسيم',
    nameEn: 'Major Depressive Disorder',
    shortAr: 'اضطراب مزاجي · MDD',
    shortEn: 'Mood Disorder · MDD',
    descriptionAr:
      'الاكتئاب الجسيم اضطراب مزاجي بيتميّز بحزن مستمر وفقدان للاهتمام أو المتعة، وبيأثر على الحياة اليومية والعلاقات والصحة الجسدية.',
    descriptionEn:
      'Major Depressive Disorder is a mood disorder marked by persistent sadness and loss of interest or pleasure, affecting daily life, relationships, and physical health.',
    symptomIds: ['sadness', 'hopelessness', 'lowEnergy', 'sleepless', 'appetiteChange', 'concentration', 'selfHarm'],
    severity: 'verySevere',
    riskFactor: 87.5,
    commonPerTen: 4,
    symptomsAr: ['حزن مستمر معظم اليوم', 'فقدان الاهتمام أو المتعة', 'تغيّرات بالنوم أو الشهية', 'صعوبة بالتركيز'],
    symptomsEn: ['Persistent sadness most of the day', 'Loss of interest or pleasure', 'Changes in sleep or appetite', 'Difficulty concentrating'],
    treatmentsAr: ['العلاج السلوكي المعرفي (CBT)', 'متابعة دوائية متقدّمة', 'تغييرات في نمط الحياة', 'مجموعات دعم واعية'],
    treatmentsEn: ['CBT (behavioural therapy)', 'Advanced medication management', 'Lifestyle changes', 'Supportive mindful groups'],
    highlightsAr: ['بيبدأ عادةً تدريجياً', 'التدخّل المبكر بيساعد كتير', 'قابل للعلاج مع الدعم المناسب'],
    highlightsEn: ['Usually starts gradually', 'Early support helps a lot', 'Treatable with the right support'],
  },
  {
    id: 'gad',
    nameAr: 'اضطراب القلق العام',
    nameEn: 'Generalized Anxiety Disorder',
    shortAr: 'اضطراب قلق · GAD',
    shortEn: 'Anxiety Disorder · GAD',
    descriptionAr: 'قلق وتوتر مفرط ومستمر حول أمور الحياة اليومية، بيصعب التحكم فيه وبيرافقه أعراض جسدية.',
    descriptionEn: 'Excessive, persistent worry about everyday things that is hard to control and comes with physical symptoms.',
    symptomIds: ['anxiety', 'sleepless', 'concentration', 'irritability', 'lowEnergy'],
    severity: 'severe',
    riskFactor: 72,
    commonPerTen: 3,
    symptomsAr: ['قلق مفرط ومستمر', 'توتر وصعوبة استرخاء', 'سرعة انفعال', 'صعوبة بالنوم'],
    symptomsEn: ['Excessive, persistent worry', 'Tension and trouble relaxing', 'Irritability', 'Sleep difficulty'],
    treatmentsAr: ['العلاج السلوكي المعرفي', 'تمارين تنفّس واسترخاء', 'متابعة دوائية عند الحاجة'],
    treatmentsEn: ['CBT', 'Breathing & relaxation practice', 'Medication when needed'],
    highlightsAr: ['بيستجيب منيح للعلاج', 'التمارين اليومية بتخفّف الأعراض'],
    highlightsEn: ['Responds well to therapy', 'Daily practice eases symptoms'],
  },
  {
    id: 'bipolar',
    nameAr: 'الاضطراب ثنائي القطب',
    nameEn: 'Bipolar Disorder',
    shortAr: 'اضطراب مزاجي',
    shortEn: 'Mood Disorder',
    descriptionAr: 'تقلّبات كبيرة بالمزاج والطاقة بين فترات ارتفاع (هوس) وفترات اكتئاب.',
    descriptionEn: 'Marked swings in mood and energy between elevated (manic) periods and depressive periods.',
    symptomIds: ['moodSwing', 'sleepless', 'irritability', 'lowEnergy', 'sadness'],
    severity: 'moderate',
    riskFactor: 58,
    commonPerTen: 2,
    symptomsAr: ['تقلّبات حادة بالمزاج', 'فترات طاقة عالية جداً', 'فترات اكتئاب', 'تغيّر أنماط النوم'],
    symptomsEn: ['Sharp mood swings', 'Very high-energy periods', 'Depressive periods', 'Changing sleep patterns'],
    treatmentsAr: ['متابعة دوائية منتظمة', 'علاج نفسي', 'روتين نوم ثابت'],
    treatmentsEn: ['Consistent medication', 'Psychotherapy', 'Stable sleep routine'],
    highlightsAr: ['المتابعة المنتظمة أساسية', 'الاستقرار ممكن مع الدعم'],
    highlightsEn: ['Consistency is key', 'Stability is achievable with support'],
  },
  {
    id: 'ocd',
    nameAr: 'الوسواس القهري',
    nameEn: 'Obsessive-Compulsive Disorder',
    shortAr: 'اضطراب قلق · OCD',
    shortEn: 'Anxiety Disorder · OCD',
    descriptionAr: 'أفكار متطفّلة متكررة (وساوس) وسلوكيات قهرية بيعملها الشخص لتخفيف القلق.',
    descriptionEn: 'Recurring intrusive thoughts (obsessions) and compulsive behaviours done to reduce anxiety.',
    symptomIds: ['obsessions', 'anxiety', 'avoidance', 'concentration'],
    severity: 'moderate',
    riskFactor: 55,
    commonPerTen: 2,
    symptomsAr: ['أفكار متطفّلة متكررة', 'سلوكيات قهرية', 'قلق مرتبط بالوساوس'],
    symptomsEn: ['Recurring intrusive thoughts', 'Compulsive behaviours', 'Anxiety tied to obsessions'],
    treatmentsAr: ['العلاج بالتعرّض ومنع الاستجابة (ERP)', 'العلاج السلوكي المعرفي', 'متابعة دوائية'],
    treatmentsEn: ['Exposure & response prevention (ERP)', 'CBT', 'Medication'],
    highlightsAr: ['ERP من أكثر العلاجات فعالية', 'التقدّم تدريجي'],
    highlightsEn: ['ERP is highly effective', 'Progress is gradual'],
  },
  {
    id: 'ptsd',
    nameAr: 'اضطراب ما بعد الصدمة',
    nameEn: 'Post-Traumatic Stress Disorder',
    shortAr: 'اضطراب مرتبط بالصدمة · PTSD',
    shortEn: 'Trauma-related · PTSD',
    descriptionAr: 'أعراض بتظهر بعد التعرّض لحدث صادم، منها ذكريات مؤلمة متكررة وتجنّب ويقظة مفرطة.',
    descriptionEn: 'Symptoms after a traumatic event, including flashbacks, avoidance, and heightened alertness.',
    symptomIds: ['flashbacks', 'avoidance', 'sleepless', 'irritability', 'anxiety'],
    severity: 'moderate',
    riskFactor: 61,
    commonPerTen: 2,
    symptomsAr: ['ذكريات مؤلمة متكررة', 'تجنّب المواقف المرتبطة بالحدث', 'يقظة مفرطة', 'صعوبة بالنوم'],
    symptomsEn: ['Recurring flashbacks', 'Avoiding reminders', 'Hypervigilance', 'Sleep difficulty'],
    treatmentsAr: ['علاج نفسي متخصّص بالصدمة', 'العلاج السلوكي المعرفي', 'الدعم المجتمعي'],
    treatmentsEn: ['Trauma-focused therapy', 'CBT', 'Community support'],
    highlightsAr: ['الدعم المتخصّص مهم', 'التعافي ممكن مع الوقت'],
    highlightsEn: ['Specialized support matters', 'Recovery is possible over time'],
  },
  {
    id: 'socialAnxiety',
    nameAr: 'اضطراب القلق الاجتماعي',
    nameEn: 'Social Anxiety Disorder',
    shortAr: 'رهاب اجتماعي',
    shortEn: 'Social Phobia',
    descriptionAr: 'خوف شديد ومستمر من المواقف الاجتماعية والتقييم من الآخرين، بيأدي لتجنّبها.',
    descriptionEn: 'Intense, persistent fear of social situations and being judged, leading to avoidance.',
    symptomIds: ['socialAnxiety', 'avoidance', 'hardToTalk', 'anxiety'],
    severity: 'lowToMild',
    riskFactor: 44,
    commonPerTen: 3,
    symptomsAr: ['خوف من المواقف الاجتماعية', 'تجنّب التجمّعات', 'صعوبة بالكلام مع الناس'],
    symptomsEn: ['Fear of social situations', 'Avoiding gatherings', 'Hard to talk to people'],
    treatmentsAr: ['العلاج السلوكي المعرفي', 'تمارين تعرّض تدريجي', 'مجموعات دعم'],
    treatmentsEn: ['CBT', 'Gradual exposure practice', 'Support groups'],
    highlightsAr: ['التعرّض التدريجي بيساعد كتير', 'قابل للتحسّن بشكل واضح'],
    highlightsEn: ['Gradual exposure helps a lot', 'Noticeably improvable'],
  },
];

export interface TherapistContent {
  id: string;
  name: string;
  specialtyAr: string;
  specialtyEn: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  verified: boolean;
}

/** [ASSUMPTION] Illustrative therapist directory (Professional Help booking is deferred — config.featureFlags.professionalBooking=false). Read-only. */
export const therapistDirectory: TherapistContent[] = [
  { id: 'therapist-1', name: 'Dr. Megumin Black', specialtyAr: 'اكتئاب', specialtyEn: 'Depression', distanceKm: 1.9, rating: 4.1, reviews: 24, verified: true },
  { id: 'therapist-2', name: 'Dr. Azunyan U. Wu', specialtyAr: 'وسواس قهري', specialtyEn: 'OCD', distanceKm: 8.0, rating: 3.3, reviews: 128, verified: true },
  { id: 'therapist-3', name: 'Dr. Frankenstein F', specialtyAr: 'قلق', specialtyEn: 'Anxiety', distanceKm: 47.0, rating: 3.7, reviews: 22, verified: false },
];

/** A recorded checker run — for Session History. */
export interface CheckerSession {
  id: string;
  method: CheckerMethod;
  createdAt: string;
  symptomIds: string[];
  topConditionId: string | null;
  /** True if risk language / self-harm was reported during this run. */
  riskFlagged: boolean;
}

export interface ConditionMatch {
  conditionId: string;
  /** 0-1 overlap score. */
  score: number;
  strength: MatchStrength;
}

// ---------------------------------------------------------------------------
// Pure helpers.
// ---------------------------------------------------------------------------

/** Maps a chatbot emotion answer onto a symptom id so the guided path has signal. */
const emotionSymptomMap: Record<string, string> = {
  sadness: 'sadness',
  anxious: 'anxiety',
  restless: 'irritability',
  pain: 'lowEnergy',
  insecure: 'socialAnxiety',
};

export function symptomsFromEmotion(emotionId: string | null): string[] {
  if (!emotionId) return [];
  const mapped = emotionSymptomMap[emotionId];
  return mapped ? [mapped] : [];
}

/** Rank conditions by symptom overlap. Deterministic demo heuristic (not clinical). */
export function rankConditions(symptomIds: string[]): ConditionMatch[] {
  const selected = new Set(symptomIds);
  return conditionCatalog
    .map((condition) => {
      const overlap = condition.symptomIds.filter((id) => selected.has(id)).length;
      const score = condition.symptomIds.length ? overlap / condition.symptomIds.length : 0;
      const strength: MatchStrength = score >= 0.6 ? 'high' : score >= 0.3 ? 'medium' : 'low';
      return { conditionId: condition.id, score, strength };
    })
    .sort((a, b) => b.score - a.score);
}

/** "Symptom checker finding score" (0-1) — more inputs → more accurate (illustrative). */
export function findingScore(symptomCount: number): number {
  return Math.max(0, Math.min(1, symptomCount / 6));
}

export function getCondition(id: string): ConditionContent | undefined {
  return conditionCatalog.find((c) => c.id === id);
}
