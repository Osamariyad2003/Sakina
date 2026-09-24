import { describe, expect, it, vi } from 'vitest';
import { AppError } from './AppError';
import { errorText } from './errorText';

const t = (key: string) => (key === 'professionals.notFound' ? 'Not found' : `[${key}]`);

describe('errorText', () => {
  it('translates a message key when the thrower set one', () => {
    expect(errorText(AppError.withKey('professionals.notFound', 'unknown', 404), t)).toBe('Not found');
  });

  it('falls back to an already-translated message (errors mapped in errorMapper)', () => {
    expect(errorText(new AppError('لا يوجد اتصال', 'network'), t)).toBe('لا يوجد اتصال');
  });

  it('falls back to a generic message for a non-AppError', () => {
    expect(errorText(new Error('boom'), t)).toBe('[errors.unknown]');
    expect(errorText(undefined, t)).toBe('[errors.unknown]');
  });

  it('re-translates on each call, so a language switch takes effect', () => {
    const error = AppError.withKey('professionals.notFound');
    const arabic = vi.fn(() => 'غير موجود');
    expect(errorText(error, t)).toBe('Not found');
    expect(errorText(error, arabic)).toBe('غير موجود');
  });
});

describe('AppError.withKey', () => {
  it('keeps the key as the message, so logs are stable and never empty', () => {
    const error = AppError.withKey('community.postTooShort', 'validation', 400);
    expect(error.message).toBe('community.postTooShort');
    expect(error.messageKey).toBe('community.postTooShort');
    expect(error.kind).toBe('validation');
    expect(error.status).toBe(400);
  });
});
