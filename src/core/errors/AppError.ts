export type AppErrorKind =
  | 'network'
  | 'unauthorized'
  | 'sessionExpired'
  | 'validation'
  | 'server'
  | 'unknown';

/** Carries a human-readable Arabic/English message — never a raw stack/HTTP body (spec §27). */
export class AppError extends Error {
  kind: AppErrorKind;
  status?: number;
  /**
   * i18n key for this error, when the thrower knows which message belongs to
   * it. Preferred over a pre-translated `message`: a layer that does not
   * render cannot know the user's language, and a translated string cannot be
   * re-rendered after a language switch or logged in a stable form
   * (docs/architecture-review.md §6.5).
   *
   * `message` still carries the key as its fallback, so logs and older display
   * sites show something stable rather than an empty string. Use
   * `errorText(error, t)` to render one.
   */
  messageKey?: string;

  constructor(message: string, kind: AppErrorKind = 'unknown', status?: number, messageKey?: string) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
    this.messageKey = messageKey;
  }

  /** Throw-site helper: the message *is* the key until something renders it. */
  static withKey(messageKey: string, kind: AppErrorKind = 'unknown', status?: number): AppError {
    return new AppError(messageKey, kind, status, messageKey);
  }
}
