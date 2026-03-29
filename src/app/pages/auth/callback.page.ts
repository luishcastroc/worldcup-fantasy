import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-auth-callback-page',
    standalone: true,
    template: `
        <div class="min-h-screen flex items-center justify-center bg-gray-50">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    `,
})
export class AuthCallbackPageComponent implements OnInit {
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.handleAuthCallback();
    }

    private async handleAuthCallback(): Promise<void> {
        try {
            // Supabase will automatically pick up the hash fragment and set the session
            // We just need to wait for it to process
            const { data, error } = await this.supabase.client.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                this.router.navigate(['/login']);
                return;
            }

            if (data.session) {
                // Profile resource auto-loads when user signal changes
                this.router.navigate(['/matches']);
            } else {
                // No session, redirect to login
                this.router.navigate(['/login']);
            }
        } catch (err) {
            console.error('Unexpected error in auth callback:', err);
            this.router.navigate(['/login']);
        }
    }
}
