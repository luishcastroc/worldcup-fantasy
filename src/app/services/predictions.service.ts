import { computed, inject, Injectable, resource, ResourceRef, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Prediction, PredictionInput, PredictionWithMatch } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PredictionsService {
  private supabase = inject(SupabaseService);

  /** Internal reload trigger — increment to force resources to refetch. */
  private reloadTrigger = signal(0);

  // Check if predictions are still allowed
  isPredictionOpen = computed(() => {
    const deadline = new Date(environment.predictionDeadline);
    return new Date() < deadline;
  });

  deadlineDate = computed(() => new Date(environment.predictionDeadline));

  /** Resource that loads user predictions with full match+team joins. */
  userPredictionsResource: ResourceRef<PredictionWithMatch[]> = resource({
    params: () => ({
      userId: this.supabase.currentUser()?.id,
      _reload: this.reloadTrigger(),
    }),
    loader: async ({ params }) => {
      if (!params.userId) return [];

      const { data, error } = await this.supabase.client
        .from('predictions')
        .select(`
          *,
          match:matches(
            *,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          )
        `)
        .eq('user_id', params.userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as PredictionWithMatch[];
    },
    defaultValue: [],
  });

  /** Resource that loads user predictions as a Map<matchId, Prediction>. */
  userPredictionsMapResource: ResourceRef<Map<number, Prediction>> = resource({
    params: () => ({
      userId: this.supabase.currentUser()?.id,
      _reload: this.reloadTrigger(),
    }),
    loader: async ({ params }) => {
      if (!params.userId) return new Map<number, Prediction>();

      const { data, error } = await this.supabase.client
        .from('predictions')
        .select('*')
        .eq('user_id', params.userId);

      if (error) throw error;

      const map = new Map<number, Prediction>();
      (data || []).forEach((p: Prediction) => {
        map.set(p.match_id, p);
      });
      return map;
    },
    defaultValue: new Map<number, Prediction>(),
  });

  // Convenience computed signals (backward-compatible API)
  predictions = computed(() => this.userPredictionsResource.value());
  predictionsMap = computed(() => this.userPredictionsMapResource.value());
  isLoading = computed(() => this.userPredictionsResource.isLoading());
  error = signal<string | null>(null);

  async getPredictionByMatchId(matchId: number): Promise<Prediction | null> {
    const user = this.supabase.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error getting prediction:', error);
      return null;
    }

    return data;
  }

  // Mutations stay imperative — resource() is for reads only

  async savePrediction(input: PredictionInput): Promise<Prediction | null> {
    if (!this.isPredictionOpen()) {
      this.error.set('Prediction deadline has passed');
      return null;
    }

    const user = this.supabase.currentUser();
    if (!user) {
      this.error.set('You must be logged in to make predictions');
      return null;
    }

    this.error.set(null);

    try {
      // Check if prediction exists
      const existing = await this.getPredictionByMatchId(input.match_id);

      if (existing) {
        // Update existing prediction
        const { data, error } = await this.supabase.client
          .from('predictions')
          .update({
            predicted_home_score: input.predicted_home_score,
            predicted_away_score: input.predicted_away_score,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating prediction:', error);
          this.error.set('Failed to update prediction');
          throw error;
        }

        // Reload resources to refresh data
        this.reloadTrigger.update(v => v + 1);
        return data;
      } else {
        // Create new prediction
        const { data, error } = await this.supabase.client
          .from('predictions')
          .insert({
            user_id: user.id,
            match_id: input.match_id,
            predicted_home_score: input.predicted_home_score,
            predicted_away_score: input.predicted_away_score,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating prediction:', error);
          this.error.set('Failed to save prediction');
          throw error;
        }

        // Reload resources to refresh data
        this.reloadTrigger.update(v => v + 1);
        return data;
      }
    } catch {
      return null;
    }
  }

  async deletePrediction(matchId: number): Promise<boolean> {
    if (!this.isPredictionOpen()) {
      this.error.set('Prediction deadline has passed');
      return false;
    }

    const user = this.supabase.currentUser();
    if (!user) return false;

    const { error } = await this.supabase.client
      .from('predictions')
      .delete()
      .eq('user_id', user.id)
      .eq('match_id', matchId);

    if (error) {
      console.error('Error deleting prediction:', error);
      return false;
    }

    // Reload resources to refresh data
    this.reloadTrigger.update(v => v + 1);
    return true;
  }

  /** Fetch all predictions (with match+team joins) for an arbitrary user. */
  async fetchPredictionsByUserId(userId: string): Promise<PredictionWithMatch[]> {
    const { data, error } = await this.supabase.client
      .from('predictions')
      .select(`
        *,
        match:matches(
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PredictionWithMatch[];
  }

  getTotalPoints(): number {
    return this.predictions().reduce((sum, p) => sum + p.points_earned, 0);
  }

  getExactPredictions(): number {
    return this.predictions().filter((p) => p.points_earned === 3).length;
  }

  getCorrectOutcomes(): number {
    return this.predictions().filter((p) => p.points_earned === 1).length;
  }

  getWrongPredictions(): number {
    return this.predictions().filter(
      (p) => p.match?.status === 'completed' && p.points_earned === 0
    ).length;
  }
}
