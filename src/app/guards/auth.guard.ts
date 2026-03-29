import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
    const supabase = inject(SupabaseService);
    const router = inject(Router);

    // Wait for auth to initialize
    await supabase.waitForAuth();

    if (supabase.isAuthenticated()) {
        return true;
    }

    // Redirect to login
    router.navigate(['/login']);
    return false;
};
