import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { fontFamilies } from '../tokens/typography';

/**
 * Real Thmanyah font files, dropped into `assets/fonts/` (see
 * assets/fonts/README.md). If loading ever fails at runtime (corrupt file,
 * unsupported platform, etc.), `fontsReady` still resolves `true` with
 * `fontsAvailable: false`, so the app falls back to the OS system font
 * instead of hanging on the splash screen forever.
 */
const FONT_ASSETS: Record<string, number | null> = {
  [fontFamilies.sansRegular]: require('../../../assets/fonts/Thmanyah-Sans-Regular.otf'),
  [fontFamilies.sansMedium]: require('../../../assets/fonts/Thmanyah-Sans-Medium.otf'),
  [fontFamilies.sansBold]: require('../../../assets/fonts/Thmanyah-Sans-Bold.otf'),
  [fontFamilies.serifDisplay]: require('../../../assets/fonts/Thmanyah-SerifDisplay-Regular.otf'),
  [fontFamilies.serifText]: require('../../../assets/fonts/Thmanyah-SerifText-Regular.otf'),
};

export function useAppFonts() {
  const [fontsReady, setFontsReady] = useState(false);
  const [fontsAvailable, setFontsAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const entries = Object.entries(FONT_ASSETS).filter(([, asset]) => asset != null) as [
        string,
        number,
      ][];

      if (entries.length === 0) {
        // No real font assets wired up yet — proceed with system font fallback.
        if (!cancelled) {
          setFontsAvailable(false);
          setFontsReady(true);
        }
        return;
      }

      try {
        await Font.loadAsync(Object.fromEntries(entries));
        if (!cancelled) {
          setFontsAvailable(true);
          setFontsReady(true);
        }
      } catch (error) {
        console.warn('[useAppFonts] Failed to load Thmanyah fonts, falling back to system font.', error);
        if (!cancelled) {
          setFontsAvailable(false);
          setFontsReady(true);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { fontsReady, fontsAvailable };
}
