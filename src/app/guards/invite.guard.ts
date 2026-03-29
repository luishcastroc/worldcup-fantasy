import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

/**
 * Protects the /invite route.
 * - Unauthenticated users → /login
 * - Already approved users → /matches (no need to enter a code)
 * - Pending users → allowed through
 */
export const inviteGuard: CanActivateFn = async () => {
    const supabase = inject(SupabaseService);
    const auth = inject(AuthService);
    const router = inject(Router);

    await supabase.waitForAuth();

    if (!supabase.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    await auth.waitForProfile();

    if (auth.isApproved()) {
        router.navigate(['/matches']);
        return false;
    }

    return true;
};
