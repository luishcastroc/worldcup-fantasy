import { Injectable, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private profile = signal<Profile | null>(null);
  
  currentProfile = computed(() => this.profile());
  isAuthenticated = computed(() => this.supabase.currentUser() !== null);
  isLoading = computed(() => this.supabase.isLoading());

  constructor(private supabase: SupabaseService) {
    // Load profile when user changes
    this.supabase.currentUser;
  }

  async signInWithGoogle(): Promise<void> {
    await this.supabase.signInWithGoogle();
  }

  async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.profile.set(null);
  }

  async loadProfile(): Promise<Profile | null> {
    const user = this.supabase.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return null;
    }

    this.profile.set(data);
    return data;
  }

  async updateProfile(updates: Partial<Profile>): Promise<Profile | null> {
    const user = this.supabase.currentUser();
    if (!user) return null;

    const { data, error } = await this.supabase.client
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    this.profile.set(data);
    return data;
  }

  getUserDisplayName(): string {
    const profile = this.profile();
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;
    
    const user = this.supabase.currentUser();
    if (user?.email) return user.email.split('@')[0];
    
    return 'User';
  }

  getUserAvatar(): string | null {
    const profile = this.profile();
    if (profile?.avatar_url) return profile.avatar_url;
    
    const user = this.supabase.currentUser();
    return user?.user_metadata?.['avatar_url'] ?? null;
  }
}
