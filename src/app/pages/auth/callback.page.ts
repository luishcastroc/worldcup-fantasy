import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { InviteService } from '../../services/invite.service';
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
    private readonly auth = inject(AuthService);
    private readonly inviteService = inject(InviteService);
    private readonly router = inject(Router);

    ngOnInit(): void {
        this.handleAuthCallback();
    }

    private async handleAuthCallback(): Promise<void> {
        try {
            const { data, error } = await this.supabase.client.auth.getSession();

            if (error) {
                console.error('Auth callback error:', error);
                this.router.navigate(['/login']);
                return;
            }

            if (!data.session) {
                this.router.navigate(['/login']);
                return;
            }

            // Case 1: User validated an invite code before OAuth → redeem it
            const pendingCode = localStorage.getItem('pendingInviteCode');
            if (pendingCode) {
                localStorage.removeItem('pendingInviteCode');
                await this.redeemAndNavigate(pendingCode);
                return;
            }

            // Case 2 & 3: No pending invite code — check if this is a
            // returning approved user or a garbage pending user
            await this.auth.waitForProfile();
            const profile = this.auth.currentProfile();

            if (profile && profile.status === 'approved') {
                // Case 2: Returning approved user → go straight in
                this.router.navigate(['/matches']);
            } else {
                // Case 3: No invite code and not approved → garbage user.
                // Clean up the auto-created auth + profile records so
                // no orphan user is left in the database.
                await this.cleanupAndRedirect();
            }
        } catch (err) {
            console.error('Unexpected error in auth callback:', err);
            this.router.navigate(['/login']);
        }
    }

    /**
     * Redeem the invite code that was validated on the login page.
     */
    private async redeemAndNavigate(code: string): Promise<void> {
        try {
            const result = await this.inviteService.redeemCode(code);

            if (result === 'ok' || result === 'already_approved') {
                this.router.navigate(['/matches']);
            } else {
                // Code became invalid/expired between validation and redemption.
                // Clean up the garbage user and send back to login with error.
                console.warn('Failed to redeem invite code:', result);
                await this.cleanupAndRedirect(
                    result === 'expired'
                        ? 'El código de invitación expiró. Solicita uno nuevo.'
                        : 'El código de invitación ya no es válido. Inténtalo con otro.',
                );
            }
        } catch (err) {
            console.error('Error redeeming invite code:', err);
            await this.cleanupAndRedirect('Ocurrió un error al canjear el código. Inténtalo de nuevo.');
        }
    }

    /**
     * Delete the garbage pending user that was just created by OAuth,
     * sign out the session, and redirect to login with an optional
     * error message.
     */
    private async cleanupAndRedirect(message?: string): Promise<void> {
        try {
            await this.supabase.client.rpc('cleanup_pending_user');
        } catch (err) {
            console.error('Error cleaning up pending user:', err);
        }

        await this.supabase.signOut();

        if (message) {
            localStorage.setItem('loginError', message);
        } else {
            localStorage.setItem('loginError', 'Necesitas un código de invitación para registrarte.');
        }

        this.router.navigate(['/login']);
    }
}
