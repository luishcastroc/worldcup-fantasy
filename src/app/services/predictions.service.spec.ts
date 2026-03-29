import { describe, it, expect, beforeEach } from 'vitest';
import { PredictionsService } from './predictions.service';
import { PredictionWithMatch } from '../models';

const supabaseStub: any = { client: {}, currentUser: () => null };

function makePrediction(points: number): PredictionWithMatch {
  return {
    id: Math.random(),
    user_id: 'u1',
    match_id: Math.random(),
    predicted_home_score: 1,
    predicted_away_score: 0,
    points_earned: points,
    match: { status: 'completed' } as any,
  };
}

describe('PredictionsService — stat helpers', () => {
  let service: PredictionsService;

  beforeEach(() => {
    service = new PredictionsService(supabaseStub);
  });

  it('getTotalPoints sums all points_earned', () => {
    service.predictions.set([
      makePrediction(3),
      makePrediction(1),
      makePrediction(0),
      makePrediction(3),
    ]);
    expect(service.getTotalPoints()).toBe(7);
  });

  it('getExactPredictions counts predictions with 3 points', () => {
    service.predictions.set([
      makePrediction(3),
      makePrediction(3),
      makePrediction(1),
      makePrediction(0),
    ]);
    expect(service.getExactPredictions()).toBe(2);
  });

  it('getCorrectOutcomes counts predictions with 1 point', () => {
    service.predictions.set([
      makePrediction(3),
      makePrediction(1),
      makePrediction(1),
      makePrediction(0),
    ]);
    expect(service.getCorrectOutcomes()).toBe(2);
  });

  it('getWrongPredictions counts completed matches with 0 points', () => {
    service.predictions.set([
      makePrediction(0), // completed, 0 pts → wrong
      makePrediction(0), // completed, 0 pts → wrong
      makePrediction(3), // exact → not wrong
      { ...makePrediction(0), match: { status: 'scheduled' } as any }, // not completed → not counted
    ]);
    expect(service.getWrongPredictions()).toBe(2);
  });

  it('returns zeros when predictions list is empty', () => {
    service.predictions.set([]);
    expect(service.getTotalPoints()).toBe(0);
    expect(service.getExactPredictions()).toBe(0);
    expect(service.getCorrectOutcomes()).toBe(0);
    expect(service.getWrongPredictions()).toBe(0);
  });
});
