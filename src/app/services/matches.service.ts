import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Match, MatchWithTeams, Team } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MatchesService {
  matches = signal<MatchWithTeams[]>([]);
  teams = signal<Team[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private supabase: SupabaseService) {}

  async loadTeams(): Promise<Team[]> {
    const { data, error } = await this.supabase.client
      .from('teams')
      .select('*')
      .order('group_letter', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading teams:', error);
      throw error;
    }

    this.teams.set(data || []);
    return data || [];
  }

  async loadMatches(): Promise<MatchWithTeams[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // First load teams if not already loaded
      if (this.teams().length === 0) {
        await this.loadTeams();
      }

      const { data, error } = await this.supabase.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .order('match_date', { ascending: true });

      if (error) {
        console.error('Error loading matches:', error);
        this.error.set('Failed to load matches');
        throw error;
      }

      const matches = (data || []) as MatchWithTeams[];
      this.matches.set(matches);
      return matches;
    } finally {
      this.isLoading.set(false);
    }
  }

  async getMatchById(id: number): Promise<MatchWithTeams | null> {
    const { data, error } = await this.supabase.client
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(*),
        away_team:teams!matches_away_team_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading match:', error);
      return null;
    }

    return data as MatchWithTeams;
  }

  getMatchesByGroup(groupLetter: string): MatchWithTeams[] {
    return this.matches().filter((m) => m.group_letter === groupLetter);
  }

  getMatchesByDate(date: string): MatchWithTeams[] {
    return this.matches().filter((m) => 
      m.match_date.startsWith(date)
    );
  }

  getCompletedMatches(): MatchWithTeams[] {
    return this.matches().filter((m) => m.status === 'completed');
  }

  getScheduledMatches(): MatchWithTeams[] {
    return this.matches().filter((m) => m.status === 'scheduled');
  }

  getGroupLetters(): string[] {
    const groups = new Set(this.matches().map((m) => m.group_letter));
    return Array.from(groups).sort();
  }

  getMatchDates(): string[] {
    const dates = new Set(
      this.matches().map((m) => m.match_date.split('T')[0])
    );
    return Array.from(dates).sort();
  }
}
