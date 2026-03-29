import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    template: `
        @if (isAuthenticated()) {
            <nav class="bg-white shadow-md sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <a routerLink="/matches" class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-fifa-gold rounded-full flex items-center justify-center">
                                <svg class="w-6 h-6 text-fifa-dark" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                                    />
                                </svg>
                            </div>
                            <span class="font-bold text-lg text-fifa-dark hidden sm:block">FIFA 2026</span>
                        </a>

                        <!-- Desktop Navigation -->
                        <div class="hidden md:flex items-center gap-1">
                            <a
                                routerLink="/matches"
                                routerLinkActive="nav-link-active"
                                [routerLinkActiveOptions]="{ exact: true }"
                                class="nav-link"
                            >
                                Partidos
                            </a>
                            <a routerLink="/my-predictions" routerLinkActive="nav-link-active" class="nav-link">
                                Mis Predicciones
                            </a>
                            <a routerLink="/results" routerLinkActive="nav-link-active" class="nav-link">
                                Resultados
                            </a>
                            <a routerLink="/rankings" routerLinkActive="nav-link-active" class="nav-link"> Ranking </a>
                        </div>

                        <!-- User Menu -->
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <button (click)="toggleMenu()" class="flex items-center gap-2 focus:outline-none">
                                    @if (userAvatar()) {
                                        <img [src]="userAvatar()" [alt]="userName()" class="w-8 h-8 rounded-full" />
                                    } @else {
                                        <div
                                            class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium"
                                        >
                                            {{ userInitial() }}
                                        </div>
                                    }
                                    <span class="hidden sm:block text-sm font-medium text-gray-700">
                                        {{ userName() }}
                                    </span>
                                    <svg
                                        class="w-4 h-4 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                <!-- Dropdown Menu -->
                                @if (isMenuOpen()) {
                                    <div
                                        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 animate-fade-in"
                                    >
                                        <a
                                            routerLink="/profile"
                                            (click)="closeMenu()"
                                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Perfil
                                        </a>
                                        <hr class="my-1" />
                                        <button
                                            (click)="signOut()"
                                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Navigation -->
                    <div class="md:hidden border-t border-gray-200">
                        <div class="flex justify-around py-2">
                            <a
                                routerLink="/matches"
                                routerLinkActive="text-primary-600"
                                [routerLinkActiveOptions]="{ exact: true }"
                                class="flex flex-col items-center text-xs text-gray-600"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span>Partidos</span>
                            </a>
                            <a
                                routerLink="/my-predictions"
                                routerLinkActive="text-primary-600"
                                class="flex flex-col items-center text-xs text-gray-600"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                                <span>Predicciones</span>
                            </a>
                            <a
                                routerLink="/results"
                                routerLinkActive="text-primary-600"
                                class="flex flex-col items-center text-xs text-gray-600"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <span>Resultados</span>
                            </a>
                            <a
                                routerLink="/rankings"
                                routerLinkActive="text-primary-600"
                                class="flex flex-col items-center text-xs text-gray-600"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                    />
                                </svg>
                                <span>Ranking</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        }
    `,
})
export class NavbarComponent {
    private readonly authService = inject(AuthService);
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);

    isMenuOpen = signal(false);

    isAuthenticated = computed(() => this.supabase.currentUser() !== null);

    userName = computed(() => {
        const user = this.supabase.currentUser();
        if (!user) return '';
        return (
            user.user_metadata?.['full_name'] || user.user_metadata?.['name'] || user.email?.split('@')[0] || 'Usuario'
        );
    });

    userAvatar = computed(() => {
        const user = this.supabase.currentUser();
        return user?.user_metadata?.['avatar_url'] || user?.user_metadata?.['picture'] || null;
    });

    userInitial = computed(() => {
        const name = this.userName();
        return name ? name.charAt(0).toUpperCase() : 'U';
    });

    toggleMenu(): void {
        this.isMenuOpen.update(v => !v);
    }

    closeMenu(): void {
        this.isMenuOpen.set(false);
    }

    async signOut(): Promise<void> {
        this.closeMenu();
        await this.authService.signOut();
        this.router.navigate(['/login']);
    }
}
