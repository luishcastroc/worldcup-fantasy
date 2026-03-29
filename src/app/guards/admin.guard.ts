import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protects /admin routes. Assumes authGuard already ran (user is authenticated + approved).
 * Non-admin users are redirected to /matches.
 */
export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAdmin()) {
        router.navigate(['/matches']);
        return false;
    }

    return true;
};
