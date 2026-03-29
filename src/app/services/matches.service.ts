import { computed, inject, Injectable, resource, ResourceRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MatchWithTeams, Team } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MatchesService {
  private supabase = inject(SupabaseService);

  /** Resource that loads all teams, sorted by group and name. */
  teamsResource: ResourceRef<Team[]> = resource({
    loader: async () => {
      const { data, error } = await this.supabase.client
        .from('teams')
        .select('*')
        .order('group_letter', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as Team[];
    },
    defaultValue: [],
  });

  /** Resource that loads all matches with joined team data. */
  matchesResource: ResourceRef<MatchWithTeams[]> = resource({
    loader: async () => {
      const { data, error } = await this.supabase.client
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .order('match_date', { ascending: true });

      if (error) throw error;
      return (data || []) as MatchWithTeams[];
    },
    defaultValue: [],
  });

  // Convenience computed signals (backward-compatible API)
  matches = computed(() => this.matchesResource.value());
  teams = computed(() => this.teamsResource.value());
  isLoading = computed(() => this.matchesResource.isLoading());
  error = computed<string | null>(() => {
    const err = this.matchesResource.error();
    return err ? err.message ?? 'Failed to load matches' : null;
  });

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
