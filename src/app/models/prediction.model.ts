import { MatchWithTeams } from './match.model';

export interface Prediction {
    id: number;
    user_id: string;
    match_id: number;
    predicted_home_score: number;
    predicted_away_score: number;
    points_earned: number;
    created_at?: string;
    updated_at?: string;
    // Joined data
    match?: MatchWithTeams;
}

export interface PredictionInput {
    match_id: number;
    predicted_home_score: number;
    predicted_away_score: number;
}

export interface PredictionWithMatch extends Prediction {
    match: MatchWithTeams;
}

export type PredictionOutcome = 'L' | 'V' | 'T'; // Local (home), Visitor (away), Tie

export function getPredictionOutcome(homeScore: number, awayScore: number): PredictionOutcome {
    if (homeScore > awayScore) return 'L';
    if (homeScore < awayScore) return 'V';
    return 'T';
}

export function calculatePoints(
    predictedHome: number,
    predictedAway: number,
    actualHome: number,
    actualAway: number,
): number {
    // Exact match = 3 points
    if (predictedHome === actualHome && predictedAway === actualAway) {
        return 3;
    }

    // Correct outcome = 1 point
    const predictedOutcome = getPredictionOutcome(predictedHome, predictedAway);
    const actualOutcome = getPredictionOutcome(actualHome, actualAway);

    if (predictedOutcome === actualOutcome) {
        return 1;
    }

    // Wrong = 0 points
    return 0;
}
