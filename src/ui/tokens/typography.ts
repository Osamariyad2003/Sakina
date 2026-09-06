/**
 * Typography tokens — eng spec §6.
 *
 * Real Thmanyah font files live in `assets/fonts/` and are loaded by
 * `src/ui/fonts/useAppFonts.ts` by these exact filenames (see
 * assets/fonts/README.md). If loading ever fails at runtime, the app falls
 * back to the OS system font so it still runs.
 */

export const fontFamilies = {
  sansRegular: 'Thmanyah-Sans-Regular',
  sansMedium: 'Thmanyah-Sans-Medium',
  sansBold: 'Thmanyah-Sans-Bold',
  serifDisplay: 'Thmanyah-SerifDisplay-Regular',
  serifText: 'Thmanyah-SerifText-Regular',
} as const;

/** Used only if custom fonts fail to load — never referenced directly by screens. */
export const systemFontFallback = {
  sansRegular: undefined,
  sansMedium: undefined,
  sansBold: undefined,
  serifDisplay: undefined,
  serifText: undefined,
} as const;

export type TextVariant =
  | 'displayLg' // Thmanyah Serif Display — hero headings, onboarding
  | 'displayMd' // Thmanyah Serif Display — section intros
  | 'titleLg' // Thmanyah Sans Bold — screen titles
  | 'titleMd' // Thmanyah Sans Medium — card/section titles
  | 'body' // Thmanyah Sans Regular — default body text
  | 'bodyStrong' // Thmanyah Sans Medium — emphasized body
  | 'label' // Thmanyah Sans Medium — buttons, tabs, form labels
  | 'caption' // Thmanyah Sans Regular, small — metadata, timestamps
  | 'editorial'; // Thmanyah Serif Text — journal/long-form reflective content

interface VariantStyle {
  fontFamilyKey: keyof typeof fontFamilies;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const textVariants: Record<TextVariant, VariantStyle> = {
  displayLg: { fontFamilyKey: 'serifDisplay', fontSize: 32, lineHeight: 40 },
  displayMd: { fontFamilyKey: 'serifDisplay', fontSize: 24, lineHeight: 32 },
  titleLg: { fontFamilyKey: 'sansBold', fontSize: 20, lineHeight: 28 },
  titleMd: { fontFamilyKey: 'sansMedium', fontSize: 17, lineHeight: 24 },
  body: { fontFamilyKey: 'sansRegular', fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamilyKey: 'sansMedium', fontSize: 15, lineHeight: 22 },
  label: { fontFamilyKey: 'sansMedium', fontSize: 14, lineHeight: 20 },
  caption: { fontFamilyKey: 'sansRegular', fontSize: 12, lineHeight: 16 },
  editorial: { fontFamilyKey: 'serifText', fontSize: 17, lineHeight: 27 },
};
