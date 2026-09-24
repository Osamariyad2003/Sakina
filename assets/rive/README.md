# `companion.riv` is a placeholder

`companion.riv` in this folder is **not a real Rive file** — it's an empty
stub so Metro can resolve `require('../../assets/rive/companion.riv')` in
`src/companion/CompanionAvatar.tsx` and the app builds/runs locally.

Loading it will fail at runtime (`RNRiveErrorType.MalformedFile` or similar).
`CompanionAvatar` catches that via `onError` and renders the code-drawn `CompanionFace` instead of crashing — see its `failed` state — so the rest of the
Companion screen (mic button, voice loop, crisis flow) is still testable
without the real asset.

**Replace this file** with the designer-delivered `companion.riv` — same
filename, same folder, artboard `companion`, state machine `mood`. No code
changes needed; `CompanionAvatar.tsx` only reads the documented state-machine
inputs (`state`, `audioLevel`, `valence`, `blink`, `nod`, `celebrate`), never
hardcodes animation names.
