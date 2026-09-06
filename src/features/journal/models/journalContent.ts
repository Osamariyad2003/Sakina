/**
 * [ASSUMPTION] Neither spec enumerates real guided-prompt content — this is
 * reasonable draft copy, not a confirmed content decision. Revise with
 * content review before ship (see ASSUMPTIONS.md).
 */
export interface JournalPromptOption {
  id: string;
  textAr: string;
  textEn: string;
}

export const journalPrompts: JournalPromptOption[] = [
  { id: 'todayImpact', textAr: 'شو أكتر شي أثر فيك اليوم؟', textEn: 'What affected you most today?' },
  { id: 'gratitude', textAr: 'اشكر نفسك على شي عملته اليوم', textEn: 'Thank yourself for something you did today' },
  { id: 'tomorrow', textAr: 'شو بتتمنى يصير بكرا؟', textEn: 'What do you hope happens tomorrow?' },
  { id: 'threeWords', textAr: 'وصف شعورك هلأ بثلاث كلمات', textEn: 'Describe how you feel right now in three words' },
  { id: 'learnedAboutSelf', textAr: 'شو تعلمت عن نفسك هالأسبوع؟', textEn: 'What did you learn about yourself this week?' },
];
