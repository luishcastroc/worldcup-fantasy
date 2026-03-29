import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { signal } from '@angular/core';
import { PredictionsService } from './predictions.service';
import { SupabaseService } from './supabase.service';
import { PredictionWithMatch } from '../models';

setupTestBed({ zoneless: false });

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
    TestBed.configureTestingModule({
      providers: [
        PredictionsService,
        {
          provide: SupabaseService,
          useValue: {
            client: {},
            currentUser: signal(null),
          },
        },
      ],
    });
    service = TestBed.inject(PredictionsService);
  });

  it('getTotalPoints sums all points_earned', () => {
    service.userPredictionsResource.set([
      makePrediction(3),
      makePrediction(1),
      makePrediction(0),
      makePrediction(3),
    ]);
    expect(service.getTotalPoints()).toBe(7);
  });

  it('getExactPredictions counts predictions with 3 points', () => {
    service.userPredictionsResource.set([
      makePrediction(3),
      makePrediction(3),
      makePrediction(1),
      makePrediction(0),
    ]);
    expect(service.getExactPredictions()).toBe(2);
  });

  it('getCorrectOutcomes counts predictions with 1 point', () => {
    service.userPredictionsResource.set([
      makePrediction(3),
      makePrediction(1),
      makePrediction(1),
      makePrediction(0),
    ]);
    expect(service.getCorrectOutcomes()).toBe(2);
  });

  it('getWrongPredictions counts completed matches with 0 points', () => {
    service.userPredictionsResource.set([
      makePrediction(0), // completed, 0 pts → wrong
      makePrediction(0), // completed, 0 pts → wrong
      makePrediction(3), // exact → not wrong
      { ...makePrediction(0), match: { status: 'scheduled' } as any }, // not completed → not counted
    ]);
    expect(service.getWrongPredictions()).toBe(2);
  });

  it('returns zeros when predictions list is empty', () => {
    service.userPredictionsResource.set([]);
    expect(service.getTotalPoints()).toBe(0);
    expect(service.getExactPredictions()).toBe(0);
    expect(service.getCorrectOutcomes()).toBe(0);
    expect(service.getWrongPredictions()).toBe(0);
  });
});
