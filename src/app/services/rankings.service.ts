import { computed, inject, Injectable, resource, ResourceRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserRanking } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RankingsService {
  private supabase = inject(SupabaseService);

  /** Resource that loads all user rankings, ordered by rank. */
  rankingsResource: ResourceRef<UserRanking[]> = resource({
    loader: async () => {
      const { data, error } = await this.supabase.client
        .from('user_rankings')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      return (data || []) as UserRanking[];
    },
    defaultValue: [],
  });

  /** Resource that loads the current user's ranking. Reacts to user changes. */
  currentUserRankingResource: ResourceRef<UserRanking | null> = resource({
    params: () => ({ userId: this.supabase.currentUser()?.id }),
    loader: async ({ params }) => {
      if (!params.userId) return null;

      const { data, error } = await this.supabase.client
        .from('user_rankings')
        .select('*')
        .eq('user_id', params.userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as UserRanking) ?? null;
    },
    defaultValue: null,
  });

  // Convenience computed signals (backward-compatible API)
  rankings = computed(() => this.rankingsResource.value());
  isLoading = computed(() => this.rankingsResource.isLoading());
  error = computed<string | null>(() => {
    const err = this.rankingsResource.error();
    return err ? err.message ?? 'Failed to load rankings' : null;
  });

  getTopRankings(limit: number = 10): UserRanking[] {
    return this.rankings().slice(0, limit);
  }

  searchRankings(query: string): UserRanking[] {
    const lowerQuery = query.toLowerCase();
    return this.rankings().filter(
      (r) => r.username?.toLowerCase().includes(lowerQuery)
    );
  }
}
