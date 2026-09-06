/**
 * [ASSUMPTION] Real Jordan crisis/hotline numbers were not provided
 * (product-definition.md §21/Open Question — safety content owner undefined).
 * These are CLEARLY MARKED PLACEHOLDERS — do not ship without replacing them
 * with verified, current numbers for Jordan.
 */
export interface EmergencyResource {
  id: string;
  titleAr: string;
  titleEn: string;
  phoneNumber: string; // tel: link target
  descriptionAr: string;
  descriptionEn: string;
}

export const emergencyResources: EmergencyResource[] = [
  {
    id: 'placeholder-national-emergency',
    titleAr: 'الطوارئ (رقم تجريبي — يجب استبداله)',
    titleEn: 'Emergency (placeholder — must be replaced)',
    phoneNumber: '911',
    descriptionAr: '[ASSUMPTION] رقم تجريبي فقط — استبدله برقم الطوارئ الرسمي بالأردن قبل الإطلاق.',
    descriptionEn: '[ASSUMPTION] Placeholder number only — replace with the official Jordan emergency number before ship.',
  },
  {
    id: 'placeholder-crisis-line',
    titleAr: 'خط الدعم النفسي (رقم تجريبي — يجب استبداله)',
    titleEn: 'Crisis support line (placeholder — must be replaced)',
    phoneNumber: '110',
    descriptionAr: '[ASSUMPTION] رقم تجريبي فقط — استبدله بخط الدعم النفسي المعتمد بالأردن قبل الإطلاق.',
    descriptionEn: '[ASSUMPTION] Placeholder number only — replace with a verified Jordan crisis support line before ship.',
  },
];
