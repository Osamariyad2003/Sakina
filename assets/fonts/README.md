# Thmanyah font files

Real Thmanyah Typeface Family files (eng spec §6), sourced from the licensed
family in `Thmanyah-Font-Family/`. Five weights across the three sub-families
are bundled directly in this folder for the app to `require()`:

```
Thmanyah-Sans-Regular.otf
Thmanyah-Sans-Medium.otf
Thmanyah-Sans-Bold.otf
Thmanyah-SerifDisplay-Regular.otf
Thmanyah-SerifText-Regular.otf
```

They're loaded at runtime by `src/ui/fonts/useAppFonts.ts` (via `expo-font`'s
`Font.loadAsync`) and linked into native builds via the `expo-font` config
plugin entry in `app.json`. If either list changes, keep them in sync.

`Thmanyah-Font-Family/` also contains the other weights (Light/Black) and
serif sub-families in both `.otf` and `.woff2`, plus the license PDF and
specimen sheets — kept for reference/licensing, not bundled. Pull additional
weights from there the same way if the design system ever needs them.
