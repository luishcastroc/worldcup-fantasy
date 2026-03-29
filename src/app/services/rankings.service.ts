import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserRanking } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RankingsService {
  rankings = signal<UserRanking[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private supabase: SupabaseService) {}

  async loadRankings(): Promise<UserRanking[]> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.supabase.client
        .from('user_rankings')
        .select('*')
        .order('rank', { ascending: true });

      if (error) {
        console.error('Error loading rankings:', error);
        this.error.set('Failed to load rankings');
        throw error;
      }

      this.rankings.set(data || []);
      return data || [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCurrentUserRanking(): Promise<UserRanking | null> {
    const user = this.supabase.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('user_rankings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user ranking:', error);
      return null;
    }

    return data;
  }

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
