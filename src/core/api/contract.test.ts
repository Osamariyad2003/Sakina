import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseContract, parseContractList } from './contract';
import { AppError } from '../errors/AppError';

const Entry = z.object({ id: z.string(), mood: z.enum(['good', 'bad']) });

describe('parseContract', () => {
  it('returns the parsed value when the shape matches', () => {
    expect(parseContract(Entry, { id: 'a', mood: 'good' }, 'GET /x')).toEqual({ id: 'a', mood: 'good' });
  });

  it('ignores unknown keys, so an additive backend change stays compatible', () => {
    expect(parseContract(Entry, { id: 'a', mood: 'good', addedLater: 1 }, 'GET /x')).toEqual({
      id: 'a',
      mood: 'good',
    });
  });

  it('throws an AppError when a field is missing', () => {
    expect(() => parseContract(Entry, { id: 'a' }, 'GET /x')).toThrow(AppError);
  });

  it('throws when a field has the wrong type', () => {
    expect(() => parseContract(Entry, { id: 1, mood: 'good' }, 'GET /x')).toThrow(AppError);
  });

  it('reports as a server error rather than leaking payload detail to the user', () => {
    try {
      parseContract(Entry, { id: 'a', mood: 'sideways' }, 'GET /mood');
      throw new Error('should have thrown');
    } catch (error) {
      const appError = error as AppError;
      expect(appError.kind).toBe('server');
      expect(appError.message).toBe('Unexpected response shape from GET /mood');
      expect(appError.message).not.toContain('sideways');
    }
  });

  it('names the failing index for list endpoints', () => {
    const rows = [{ id: 'a', mood: 'good' }, { id: 'b' }];
    expect(() => parseContractList(Entry, rows, 'GET /mood')).toThrow(/GET \/mood\[1\]/);
  });
});
