/**
 * Platform-agnostic contract shared by `CompanionAvatar.tsx` (native, backed
 * by Rive) and `CompanionAvatar.web.tsx` (web — `rive-react-native` has no
 * web implementation, see that file). Kept dependency-free so neither
 * platform file needs to import the other.
 */

/**
 * Mirrors the state machine's `state` enum input 1:1 — see
 * `assets/rive/companion.riv` (artboard `companion`, state machine `mood`).
 * Never hardcode the animation/timeline names; only these numeric inputs.
 */
export enum CompanionState {
  Idle = 0,
  Listening = 1,
  Reflecting = 2,
  Speaking = 3,
  Encouraging = 4,
  Crisis = 5,
}

export interface CompanionAvatarHandle {
  setState: (state: CompanionState) => void;
  setAudioLevel: (level: number) => void;
  setValence: (valence: number) => void;
  blink: () => void;
  nod: () => void;
  celebrate: () => void;
}
