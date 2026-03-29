import { describe, it, expect } from 'vitest';
import { calculatePoints, getPredictionOutcome } from './prediction.model';

describe('getPredictionOutcome', () => {
  it('returns L when home wins', () => {
    expect(getPredictionOutcome(2, 0)).toBe('L');
    expect(getPredictionOutcome(1, 0)).toBe('L');
  });

  it('returns V when away wins', () => {
    expect(getPredictionOutcome(0, 1)).toBe('V');
    expect(getPredictionOutcome(1, 3)).toBe('V');
  });

  it('returns T on a draw', () => {
    expect(getPredictionOutcome(0, 0)).toBe('T');
    expect(getPredictionOutcome(2, 2)).toBe('T');
  });
});

describe('calculatePoints', () => {
  describe('exact score (3 points)', () => {
    it('awards 3 for an exact home win', () => {
      expect(calculatePoints(2, 1, 2, 1)).toBe(3);
    });

    it('awards 3 for an exact away win', () => {
      expect(calculatePoints(0, 2, 0, 2)).toBe(3);
    });

    it('awards 3 for an exact draw', () => {
      expect(calculatePoints(1, 1, 1, 1)).toBe(3);
    });

    it('awards 3 for 0-0 predicted and actual', () => {
      expect(calculatePoints(0, 0, 0, 0)).toBe(3);
    });
  });

  describe('correct outcome (1 point)', () => {
    it('awards 1 for correct home win with wrong score', () => {
      expect(calculatePoints(2, 0, 3, 1)).toBe(1);
      expect(calculatePoints(1, 0, 4, 2)).toBe(1);
    });

    it('awards 1 for correct away win with wrong score', () => {
      expect(calculatePoints(0, 1, 1, 3)).toBe(1);
    });

    it('awards 1 for correct draw with wrong score', () => {
      expect(calculatePoints(0, 0, 2, 2)).toBe(1);
      expect(calculatePoints(1, 1, 3, 3)).toBe(1);
    });
  });

  describe('wrong prediction (0 points)', () => {
    it('awards 0 when predicted home win but result is draw', () => {
      expect(calculatePoints(2, 0, 1, 1)).toBe(0);
    });

    it('awards 0 when predicted draw but result is home win', () => {
      expect(calculatePoints(1, 1, 2, 0)).toBe(0);
    });

    it('awards 0 when predicted home win but away won', () => {
      expect(calculatePoints(2, 0, 0, 1)).toBe(0);
    });

    it('awards 0 when predicted away win but home won', () => {
      expect(calculatePoints(0, 2, 3, 0)).toBe(0);
    });

    it('awards 0 when predicted draw but away won', () => {
      expect(calculatePoints(0, 0, 0, 1)).toBe(0);
    });
  });
});
