import { describe, it, expect, beforeEach } from 'vitest';
import { RankingsService } from './rankings.service';
import { UserRanking } from '../models';

const supabaseStub: any = { client: {}, currentUser: () => null };

function makeRanking(overrides: Partial<UserRanking>): UserRanking {
  return {
    user_id: 'u1',
    username: 'user',
    avatar_url: null,
    total_points: 0,
    exact_predictions: 0,
    correct_outcomes: 0,
    exact_with_goals: 0,
    total_predictions: 0,
    rank: 1,
    ...overrides,
  };
}

describe('RankingsService', () => {
  let service: RankingsService;

  beforeEach(() => {
    service = new RankingsService(supabaseStub);
  });

  describe('getTopRankings', () => {
    it('returns at most the requested number of entries', () => {
      const rankings = Array.from({ length: 15 }, (_, i) =>
        makeRanking({ user_id: `u${i}`, rank: i + 1, total_points: 15 - i })
      );
      service.rankings.set(rankings);

      expect(service.getTopRankings(10)).toHaveLength(10);
    });

    it('defaults to 10 entries', () => {
      const rankings = Array.from({ length: 20 }, (_, i) =>
        makeRanking({ user_id: `u${i}`, rank: i + 1 })
      );
      service.rankings.set(rankings);

      expect(service.getTopRankings()).toHaveLength(10);
    });

    it('returns all entries when fewer than limit', () => {
      service.rankings.set([makeRanking({ user_id: 'u1' }), makeRanking({ user_id: 'u2' })]);
      expect(service.getTopRankings(10)).toHaveLength(2);
    });
  });

  describe('searchRankings', () => {
    beforeEach(() => {
      service.rankings.set([
        makeRanking({ user_id: 'u1', username: 'Alice' }),
        makeRanking({ user_id: 'u2', username: 'Bob' }),
        makeRanking({ user_id: 'u3', username: 'alicia' }),
      ]);
    });

    it('matches case-insensitively', () => {
      expect(service.searchRankings('alice')).toHaveLength(1);
      expect(service.searchRankings('ALICE')).toHaveLength(1);
      expect(service.searchRankings('ali')).toHaveLength(2); // Alice + alicia
    });

    it('returns empty array when nothing matches', () => {
      expect(service.searchRankings('xyz')).toHaveLength(0);
    });

    it('returns all entries for empty query', () => {
      expect(service.searchRankings('')).toHaveLength(3);
    });
  });

  describe('ranking sort order (tiebreaker logic)', () => {
    it('higher total_points ranks first', () => {
      const rankings = [
        makeRanking({ user_id: 'u1', username: 'A', total_points: 10, rank: 1 }),
        makeRanking({ user_id: 'u2', username: 'B', total_points: 7, rank: 2 }),
        makeRanking({ user_id: 'u3', username: 'C', total_points: 4, rank: 3 }),
      ];
      service.rankings.set(rankings);
      const top = service.getTopRankings(3);
      expect(top[0].username).toBe('A');
      expect(top[1].username).toBe('B');
      expect(top[2].username).toBe('C');
    });

    it('on equal points, more exact_predictions ranks higher', () => {
      // Both players have 10 points but different exact counts
      const rankings = [
        makeRanking({ user_id: 'u1', username: 'MoreExact', total_points: 10, exact_predictions: 3, rank: 1 }),
        makeRanking({ user_id: 'u2', username: 'LessExact', total_points: 10, exact_predictions: 1, rank: 2 }),
      ];
      service.rankings.set(rankings);
      const top = service.getTopRankings(2);
      expect(top[0].username).toBe('MoreExact');
      expect(top[1].username).toBe('LessExact');
    });

    it('on equal points and equal exact_predictions, more exact_with_goals ranks higher', () => {
      const rankings = [
        makeRanking({ user_id: 'u1', username: 'HighGoals', total_points: 10, exact_predictions: 2, exact_with_goals: 7, rank: 1 }),
        makeRanking({ user_id: 'u2', username: 'LowGoals',  total_points: 10, exact_predictions: 2, exact_with_goals: 3, rank: 2 }),
      ];
      service.rankings.set(rankings);
      const top = service.getTopRankings(2);
      expect(top[0].username).toBe('HighGoals');
      expect(top[1].username).toBe('LowGoals');
    });
  });
});
