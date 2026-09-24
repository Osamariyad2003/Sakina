# Companion voice avatar

Animated Rive avatar for the AI Companion screen — listens, reflects, and
speaks during a voice turn, and recedes into a crisis hand-off when the
existing risk-detection logic fires.

```
mic tap
  -> useVoiceLoop.start()
  -> STT (expo-speech-recognition, ar-JO default) -> state=listening, avatar audioLevel <- mic amplitude
  -> final transcript -> state=reflecting (~750ms beat)
  -> companionService.sendMessage(transcript)   // same function the text chat uses
       -> riskDetected -> enterCrisis(): TTS stopped, state=crisis, onCrisis() navigates to Safety
       -> otherwise    -> state=speaking, TTS (expo-speech) plays, avatar audioLevel <- synthesized envelope
  -> TTS done -> state=idle
```

## Files

- `CompanionFace.tsx` — code-drawn avatar (react-native-svg + Reanimated) matching the design state sheet: listening (dot eyes, dashed ring, leans in), reflecting (closed eyes, slow breath), speaking (mouth + sound waves driven by `audioLevel`), crisis (smaller, desaturated, flat eyes). Same imperative handle as the Rive avatar. Used on web always, and on native whenever `companion.riv` fails to load — which is the case today, since the checked-in asset is a placeholder.
- `CompanionAvatar.tsx` — dumb Rive wrapper. Ref API: `setState`, `setAudioLevel`, `setValence`, `blink`, `nod`, `celebrate`. Only reads/writes the `mood` state machine's documented inputs (`state`, `audioLevel`, `valence`, `blink`, `nod`, `celebrate`) — no animation names hardcoded anywhere else.
- `useVoiceLoop.ts` — orchestrates one voice turn, owns the STT/TTS lifecycle, and is the single place `enterCrisis()` lives.
- `tts/ttsProvider.ts` + `tts/expoSpeechProvider.ts` — TTS isolated behind an interface. `expo-speech` has no viseme/amplitude data, so the current provider fakes a smoothed envelope while speech plays; swapping in a viseme-capable cloud TTS later means writing a new provider, not touching `useVoiceLoop` or the avatar.
- `audioLevel.ts` — clamp + exponential-moving-average smoothing shared by both the mic input level and the TTS output envelope, so the avatar never jitters.
- `src/features/ai-companion/components/CompanionVoicePanel.tsx` — mounts the avatar + mic button above the conversation on `ConversationScreen`, and swaps to the receded crisis panel when `status === 'crisis'`.

## Crisis behavior (by design, not a bug)

- `enterCrisis()` is a one-way gate (`inCrisis` ref inside `useVoiceLoop`). Once it fires: TTS stops immediately, `ExpoSpeechRecognitionModule.stop()` is called, the avatar is set to `CompanionState.Crisis`, and every other event handler in the hook checks the gate first and no-ops.
- There is **no automatic exit**. The only way back to `idle` is the user tapping "رجعت، بدي أكمل" / "I'm back, let's continue" in `CompanionVoicePanel`, which calls `useVoiceLoop().reset()`.
- The panel does not "perform empathy" in this state — no extra copy, no animation flourish beyond the avatar's own crisis pose. It just names that support is open elsewhere and gets out of the way.

## Native asset contract

`assets/rive/companion.riv` — artboard `companion`, state machine `mood`,
inputs `state` (0–5 enum), `audioLevel` (0–1), `valence` (-1–1), triggers
`blink`/`nod`/`celebrate`. Treat this file as a contract owned by design; if
an input is renamed, `CompanionAvatar.tsx` is the only file that needs to
change.

## Requires a Dev Client build

`expo-speech-recognition` and `rive-react-native` both ship native code —
**this will not run in Expo Go.** Build a Dev Client:

```bash
# package.json pins reasonable versions, but let expo-cli confirm the exact
# SDK 57-compatible versions before you trust them:
npx expo install rive-react-native expo-speech-recognition expo-speech
npm install

# generate native projects (reads app.json's plugins, including
# expo-speech-recognition and plugins/withRiveAndroidVersion.js)
npx expo prebuild --clean

# Android
npx expo run:android
# iOS
npx expo run:ios
```

If you already have native projects and just changed `app.json` plugins
(e.g. after pulling this change), re-run `npx expo prebuild --clean` — the
Android Rive version pin and the speech-recognition permissions are both
applied by config plugins during prebuild, not by hand-editing `android/`.

### Verifying the Android version pin

After `prebuild`, confirm `android/app/build.gradle` contains:

```gradle
configurations.all {
    resolutionStrategy {
        force "app.rive:rive-android:9.12.2"
    }
}
```

If it's missing, the plugin wasn't picked up — check it's listed in
`app.json` → `expo.plugins` as `"./plugins/withRiveAndroidVersion.js"`.

## Manual test checklist

1. Open the Companion tab, tap the mic — avatar should visibly enter
   "listening" (glow/eyes react) within ~1s.
2. Speak a sentence in Arabic — a live transcript should appear under the
   mic.
3. Stop talking — avatar pauses in "reflecting" for under a second, then
   "speaks" the reply with the mouth/glow reacting, then returns to idle.
4. Say something containing a risk keyword (see
   `src/features/ai-companion/models/riskDetection.ts`) — TTS/mic should
   stop immediately, the avatar should visibly recede, and the app should
   land on the Safety screen. Backing out of Safety must NOT auto-resume the
   companion; only the explicit "I'm back" button does.
5. On an Android **release** build, scroll the Companion screen — should be
   smooth (this is what the `rive-android:9.12.2` pin exists for).
