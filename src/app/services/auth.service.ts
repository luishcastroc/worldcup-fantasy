import { computed, inject, Injectable, resource, ResourceRef } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase = inject(SupabaseService);

  /** Resource that loads the current user's profile. Reacts to user changes. */
  profileResource: ResourceRef<Profile | null> = resource({
    params: () => ({ userId: this.supabase.currentUser()?.id }),
    loader: async ({ params }) => {
      if (!params.userId) return null;

      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', params.userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return data as Profile;
    },
    defaultValue: null,
  });

  currentProfile = computed(() => this.profileResource.value());
  isAuthenticated = computed(() => this.supabase.currentUser() !== null);
  isLoading = computed(() => this.supabase.isLoading());

  async signInWithGoogle(): Promise<void> {
    await this.supabase.signInWithGoogle();
  }

  async signOut(): Promise<void> {
    await this.supabase.signOut();
  }

  // Mutation stays imperative — resource() is for reads only
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

    // Reload the profile resource to refresh data
    this.profileResource.reload();
    return data;
  }

  getUserDisplayName(): string {
    const profile = this.currentProfile();
    if (profile?.username) return profile.username;
    if (profile?.full_name) return profile.full_name;

    const user = this.supabase.currentUser();
    if (user?.email) return user.email.split('@')[0];

    return 'User';
  }

  getUserAvatar(): string | null {
    const profile = this.currentProfile();
    if (profile?.avatar_url) return profile.avatar_url;

    const user = this.supabase.currentUser();
    return user?.user_metadata?.['avatar_url'] ?? null;
  }
}
