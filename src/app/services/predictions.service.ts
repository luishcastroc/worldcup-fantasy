import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Prediction, PredictionInput, PredictionWithMatch } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PredictionsService {
  predictions = signal<PredictionWithMatch[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Check if predictions are still allowed
  isPredictionOpen = computed(() => {
    const deadline = new Date(environment.predictionDeadline);
    return new Date() < deadline;
  });

  deadlineDate = computed(() => new Date(environment.predictionDeadline));

  constructor(private supabase: SupabaseService) {}

  async loadUserPredictions(): Promise<PredictionWithMatch[]> {
    const user = this.supabase.currentUser();
    if (!user) return [];

    this.isLoading.set(true);
    this.error.set(null);

    try {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading predictions:', error);
        this.error.set('Failed to load predictions');
        throw error;
      }

      const predictions = (data || []) as PredictionWithMatch[];
      this.predictions.set(predictions);
      return predictions;
    } finally {
      this.isLoading.set(false);
    }
  }

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

  async getUserPredictionsMap(): Promise<Map<number, Prediction>> {
    const user = this.supabase.currentUser();
    if (!user) return new Map();

    const { data, error } = await this.supabase.client
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading predictions map:', error);
      return new Map();
    }

    const map = new Map<number, Prediction>();
    (data || []).forEach((p: Prediction) => {
      map.set(p.match_id, p);
    });
    return map;
  }

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

    this.isLoading.set(true);
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

        // Update local state
        await this.loadUserPredictions();
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

        // Update local state
        await this.loadUserPredictions();
        return data;
      }
    } finally {
      this.isLoading.set(false);
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

    // Update local state
    await this.loadUserPredictions();
    return true;
  }

  getTotalPoints(): number {
    return this.predictions().reduce((sum, p) => sum + p.points_earned, 0);
  }

  getExactPredictions(): number {
    return this.predictions().filter((p) => p.points_earned === 2).length;
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
