/**
 * Web build of `CompanionAvatar`. `rive-react-native` calls
 * `requireNativeComponent` at module-import time and has no web
 * implementation — importing it on web throws before any component even
 * renders. Metro/webpack (via `expo start --web`) picks this `.web.tsx`
 * file over `CompanionAvatar.tsx` automatically for web bundles, so the
 * native file's import is never evaluated here.
 *
 * Web always renders the code-drawn `CompanionFace`, which exposes the same
 * imperative handle, so `useVoiceLoop` and `CompanionVoicePanel` need no
 * platform branching of their own.
 */
export { CompanionFace as CompanionAvatar } from './CompanionFace';
export { CompanionState, type CompanionAvatarHandle } from './companionState';
