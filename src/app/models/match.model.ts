import { Team } from './team.model';

export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Match {
    id: number;
    home_team_id: number;
    away_team_id: number;
    match_date: string;
    venue: string | null;
    city: string | null;
    group_letter: string;
    home_score: number | null;
    away_score: number | null;
    status: MatchStatus;
    created_at?: string;
    updated_at?: string;
    // Joined data
    home_team?: Team;
    away_team?: Team;
}

export interface MatchWithTeams extends Match {
    home_team: Team;
    away_team: Team;
}
