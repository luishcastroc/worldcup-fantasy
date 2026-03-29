import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private authInitialized: Promise<void>;
  private resolveAuthInit!: () => void;
  
  currentUser = signal<User | null>(null);
  session = signal<Session | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.authInitialized = new Promise(resolve => {
      this.resolveAuthInit = resolve;
    });

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    // Initialize auth state
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      this.isLoading.set(false);
      this.resolveAuthInit();
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
      this.isLoading.set(false);
    });
  }

  /**
   * Wait for auth to be initialized. Use this instead of polling isLoading().
   */
  waitForAuth(): Promise<void> {
    return this.authInitialized;
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
