import { describe, expect, it } from 'vitest';
import { containsRiskLanguage } from './riskDetection';
import { mustEscalate, mustNotEscalate } from './escalationPhrases.fixture';

/**
 * The on-device half of the crisis hand-off. A miss here means someone in
 * crisis is not escalated before the network is even reached, so these tests
 * are exhaustive over the shared fixture rather than illustrative.
 *
 * See docs/architecture-review.md §13 (P0) for why this suite exists.
 */
describe('containsRiskLanguage', () => {
  describe('escalates on every phrase in the shared fixture', () => {
    for (const phrase of mustEscalate) {
      it(`escalates: ${phrase}`, () => {
        expect(containsRiskLanguage(phrase)).toBe(true);
      });
    }
  });

  describe('does not escalate ordinary distress', () => {
    for (const phrase of mustNotEscalate) {
      it(`stays quiet: ${phrase}`, () => {
        expect(containsRiskLanguage(phrase)).toBe(false);
      });
    }
  });

  describe('normalisation', () => {
    it('ignores Arabic diacritics', () => {
      expect(containsRiskLanguage('بدّي أمـوت')).toBe(true);
    });

    it('folds alef, ya and ta-marbuta variants', () => {
      expect(containsRiskLanguage('ٱريد ان اموت')).toBe(true);
    });

    it('is case-insensitive for English', () => {
      expect(containsRiskLanguage('I WANT TO DIE')).toBe(true);
    });

    it('accepts curly apostrophes', () => {
      expect(containsRiskLanguage('I don’t want to live')).toBe(true);
    });

    it('collapses repeated whitespace', () => {
      expect(containsRiskLanguage('kill    myself')).toBe(true);
    });
  });

  describe('matching behaviour', () => {
    it('detects a phrase embedded in a longer message', () => {
      expect(
        containsRiskLanguage('it has been a long week and honestly I want to die, I am so tired'),
      ).toBe(true);
    });

    it('is safe on empty and whitespace-only input', () => {
      expect(containsRiskLanguage('')).toBe(false);
      expect(containsRiskLanguage('   \n  ')).toBe(false);
    });
  });
});
