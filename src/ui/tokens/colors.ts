/**
 * Color tokens — eng spec §7.
 * Raw palette values live ONLY here. Everything else in the app must consume
 * semantic tokens from `theme.colors`, never these raw hexes directly.
 */

export const palette = {
  backgroundPrimary: '#F5F1EA',
  surface: '#FCFAF7',
  primary: '#6F8376',
  primaryDark: '#34433D',
  warmAccent: '#C9A58D',
  softBlue: '#AEBFC0',
  textPrimary: '#292D2B',
  textSecondary: '#737A76',

  // Muted semantic hues (spec §7: avoid saturated red/green/blue)
  successMuted: '#7A9B7E',
  warningMuted: '#D3A45C',
  errorMuted: '#B97A64',
  infoMuted: '#8FA6B2',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

/**
 * Dark-mode palette. Kept close in hue to the light palette so the brand
 * still reads as "Sakina" at night — darker grounds, lifted text/surfaces.
 */
export const darkPalette = {
  backgroundPrimary: '#1B1E1C',
  surface: '#22261F',
  primary: '#8FA893',
  primaryDark: '#B7C7B9',
  warmAccent: '#D8B79C',
  softBlue: '#9FB3B5',
  textPrimary: '#F2F1ED',
  textSecondary: '#A7ADA8',

  successMuted: '#8FB093',
  warningMuted: '#E0B876',
  errorMuted: '#CB9683',
  infoMuted: '#A3BAC5',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

/**
 * Extended per-category accent tokens (Home cards/tracker rows) — "Botanical
 * & warm" direction, confirmed with the product owner. `sky`/`clay` alias
 * the existing `softBlue`/`warmAccent` brand tokens rather than duplicating
 * their hex; `moss`/`mauve`/`gold` are new, kept in the same soft/
 * desaturated family (never neon, per the design brief).
 */
export const accentPalette = {
  reflection: '#D9BE8C', // gold
  mood: palette.softBlue, // sky
  mindful: palette.warmAccent, // clay
  journaling: '#9CAA85', // moss
  stress: '#C6A7B3', // mauve
  hydration: '#9DBFBB', // teal
  steps: '#CFA07C', // terracotta
  sleep: '#A99CC4', // soft lavender (Sleep tracker) — desaturated, never neon
} as const;

/** Dark-mode accents — lightened ~8-10%, same relationship darkPalette uses for the base brand tokens. */
export const darkAccentPalette = {
  reflection: '#E6CFA0',
  mood: darkPalette.softBlue,
  mindful: darkPalette.warmAccent,
  journaling: '#B4C29C',
  stress: '#D7BCC6',
  hydration: '#A7C5C2',
  steps: '#D4AA89',
  sleep: '#BBAFD4',
} as const;

export type ColorScheme = 'light' | 'dark';

export function buildSemanticColors(scheme: ColorScheme) {
  const p = scheme === 'light' ? palette : darkPalette;
  const a = scheme === 'light' ? accentPalette : darkAccentPalette;

  return {
    accent: a,
    background: {
      primary: p.backgroundPrimary,
      surface: p.surface,
    },
    brand: {
      primary: p.primary,
      primaryDark: p.primaryDark,
      accent: p.warmAccent,
      accentSoft: p.softBlue,
    },
    text: {
      primary: p.textPrimary,
      secondary: p.textSecondary,
      inverse: scheme === 'light' ? p.white : p.black,
      onBrand: p.white,
    },
    border: {
      subtle: scheme === 'light' ? '#E3DDD1' : '#33392F',
      default: scheme === 'light' ? '#D2CABB' : '#3E4536',
    },
    status: {
      success: p.successMuted,
      warning: p.warningMuted,
      error: p.errorMuted,
      info: p.infoMuted,
    },
    overlay: scheme === 'light' ? 'rgba(41,45,43,0.45)' : 'rgba(0,0,0,0.6)',
  } as const;
}

export type SemanticColors = ReturnType<typeof buildSemanticColors>;
