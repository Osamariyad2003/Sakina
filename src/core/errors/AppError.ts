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

  constructor(message: string, kind: AppErrorKind = 'unknown', status?: number) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
  }
}
