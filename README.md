# Sakina — سكينة

Arabic-first mental-health and emotional-wellbeing mobile app for young
Arabic-speaking users in Jordan. React Native (Expo, TypeScript), Arabic/RTL
as the source layout.




## Requirements

- Node.js 18+
- npm
- For native builds: Xcode (iOS, macOS only) and/or Android Studio (Android)
- [Expo Go](https://expo.dev/go) is **not** sufficient once native modules
  land (MMKV, Skia, Nitro Modules, secure-store) — use a **dev client** build.

## Setup

```bash
npm install
```

## Run

```bash
npx expo start          # then press a (Android) / i (iOS) / scan the QR with a dev-client build
npm run android          # build & run on a connected Android device/emulator
npm run ios              # build & run on iOS (macOS only)
```

The first native run requires building a dev client (`npx expo run:android` /
`npx expo run:ios`, or `eas build --profile development`) because the app
depends on native modules not present in the stock Expo Go app.

## Project structure

```
src/
  core/         # api client, auth, error mapping, secure/cache storage
  ui/           # design tokens, ThemeProvider, Thmanyah fonts, primitives
  features/     # one folder per module: screens/components/state/services/models/validation
  navigation/   # RootNavigator, AuthStack, OnboardingStack, AppTabs
  i18n/         # i18next config + ar/en resources
  config/       # API base URL, feature flags, [ASSUMPTION] placeholders
  types/        # cross-cutting shared types
```

## Verifying changes

```bash
npx tsc --noEmit     # typecheck
npx expo-doctor       # dependency/config health check
```

There's no emulator/device available in this environment, so UI changes here
have been verified via typecheck only — a real device/emulator run is needed
to confirm visual and interaction behavior.
