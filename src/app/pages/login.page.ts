import {
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { InviteService } from '../services/invite.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [FormsModule],
    template: `
        <div
            class="min-h-screen bg-linear-to-br from-fifa-dark via-primary-900 to-fifa-dark flex items-center justify-center px-4"
        >
            <div class="max-w-md w-full">
                <!-- Logo and Title -->
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 bg-fifa-gold rounded-full mb-4">
                        <svg class="w-12 h-12 text-fifa-dark" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                            />
                        </svg>
                    </div>
                    <h1 class="text-4xl font-bold text-white mb-2">FIFA 2026</h1>
                    <h2 class="text-2xl font-semibold text-fifa-gold">Quiniela Mundial</h2>
                    <p class="text-gray-300 mt-4">¡Predice resultados y compite con tus amigos!</p>
                </div>

                <!-- Error from callback redirect (e.g. no invite code) -->
                @if (loginError()) {
                    <div class="card p-4 border-l-4 border-red-500 bg-red-50 mb-4">
                        <div class="flex items-start gap-3">
                            <svg
                                class="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                            <p class="text-sm text-red-700">{{ loginError() }}</p>
                        </div>
                    </div>
                }

                <!-- Login Card -->
                <div class="card p-8">
                    <div class="space-y-6">
                        @if (!codeValidated() && !returningUser()) {
                            <!-- STATE 1: Invite code entry -->
                            <div class="text-center">
                                <h3 class="text-xl font-semibold text-gray-900 mb-2">Acceso por invitación</h3>
                                <p class="text-gray-600 text-sm">
                                    Esta quiniela es privada. Ingresa tu código de invitación para continuar.
                                </p>
                            </div>

                            <!-- Code input -->
                            <div>
                                <label for="invite-code" class="block text-sm font-medium text-gray-700 mb-1">
                                    Código de invitación
                                </label>
                                <input
                                    id="invite-code"
                                    type="text"
                                    [(ngModel)]="inviteCode"
                                    (ngModelChange)="errorMessage.set('')"
                                    (keydown.enter)="validateInviteCode()"
                                    placeholder="Ej: AB3X7YZ2"
                                    maxlength="8"
                                    [disabled]="isValidating()"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                @if (errorMessage()) {
                                    <p class="mt-2 text-sm text-red-600">{{ errorMessage() }}</p>
                                }
                            </div>

                            <!-- Validate button -->
                            <button
                                (click)="validateInviteCode()"
                                [disabled]="isValidating() || !inviteCode.trim()"
                                class="w-full py-3 px-6 bg-fifa-gold text-fifa-dark font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                @if (isValidating()) {
                                    <svg
                                        class="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            class="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                        ></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>Verificando...</span>
                                } @else {
                                    <span>Validar código</span>
                                }
                            </button>

                            <!-- Returning user link -->
                            <div class="text-center">
                                <button
                                    (click)="returningUser.set(true)"
                                    class="text-sm text-gray-500 hover:text-primary-600 underline transition-colors"
                                >
                                    ¿Ya tienes cuenta? Inicia sesión
                                </button>
                            </div>
                        } @else {
                            <!-- STATE 2: Provider sign-in (code validated OR returning user) -->
                            <div class="text-center">
                                @if (codeValidated()) {
                                    <div
                                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Código válido
                                    </div>
                                    <h3 class="text-xl font-semibold text-gray-900 mb-2">¡Casi listo!</h3>
                                    <p class="text-gray-600">Inicia sesión para completar tu registro</p>
                                } @else {
                                    <h3 class="text-xl font-semibold text-gray-900 mb-2">¡Bienvenido de vuelta!</h3>
                                    <p class="text-gray-600">Inicia sesión para continuar</p>
                                }
                            </div>

                            <!-- Google Sign In Button -->
                            <button
                                (click)="signInWithGoogle()"
                                [disabled]="isSigningIn()"
                                class="btn-google w-full"
                            >
                                @if (isSigningIn()) {
                                    <svg
                                        class="animate-spin h-5 w-5 text-gray-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            class="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                        ></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                } @else {
                                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span>Iniciar sesión con Google</span>
                                }
                            </button>

                            <!-- Back link -->
                            @if (returningUser() && !codeValidated()) {
                                <div class="text-center">
                                    <button
                                        (click)="returningUser.set(false)"
                                        class="text-sm text-gray-500 hover:text-primary-600 underline transition-colors"
                                    >
                                        ¿Nuevo usuario? Ingresa un código de invitación
                                    </button>
                                </div>
                            }
                        }

                        <!-- Divider -->
                        <div class="relative">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-200"></div>
                            </div>
                        </div>

                        <!-- Features -->
                        <div class="space-y-3">
                            <div class="flex items-center gap-3 text-sm text-gray-600">
                                <svg
                                    class="w-5 h-5 text-green-500 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Predice los 72 partidos de fase de grupos</span>
                            </div>
                            <div class="flex items-center gap-3 text-sm text-gray-600">
                                <svg
                                    class="w-5 h-5 text-green-500 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Gana 2 puntos por marcador exacto</span>
                            </div>
                            <div class="flex items-center gap-3 text-sm text-gray-600">
                                <svg
                                    class="w-5 h-5 text-green-500 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Gana 1 punto por resultado correcto</span>
                            </div>
                            <div class="flex items-center gap-3 text-sm text-gray-600">
                                <svg
                                    class="w-5 h-5 text-green-500 shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Compite en el ranking global</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <p class="text-center text-gray-400 text-sm mt-6">
                    Al iniciar sesión, aceptas nuestros Términos de Servicio
                </p>
            </div>
        </div>
    `,
})
export class LoginPageComponent {
    private readonly authService = inject(AuthService);
    private readonly inviteService = inject(InviteService);
    private readonly supabaseService = inject(SupabaseService);
    private readonly router = inject(Router);

    inviteCode = '';
    codeValidated = signal(false);
    returningUser = signal(false);
    isValidating = signal(false);
    isSigningIn = signal(false);
    errorMessage = signal('');
    loginError = signal('');

    constructor() {
        // Pick up any error message from the auth callback redirect
        const storedError = localStorage.getItem('loginError');
        if (storedError) {
            this.loginError.set(storedError);
            localStorage.removeItem('loginError');
        }

        // Redirect if already logged in
        if (this.supabaseService.isAuthenticated()) {
            this.router.navigate(['/matches']);
        }
    }

    async validateInviteCode(): Promise<void> {
        if (!this.inviteCode.trim()) return;

        this.isValidating.set(true);
        this.errorMessage.set('');

        try {
            const result = await this.inviteService.validateCode(this.inviteCode);

            if (result === 'valid') {
                // Store the code for redemption after OAuth callback
                localStorage.setItem('pendingInviteCode', this.inviteCode.trim().toUpperCase());
                this.codeValidated.set(true);
            } else if (result === 'expired') {
                this.errorMessage.set('Este código ha expirado. Solicita uno nuevo a quien te invitó.');
            } else {
                this.errorMessage.set('Código inválido o ya utilizado. Verifica e inténtalo de nuevo.');
            }
        } catch {
            this.errorMessage.set('Ocurrió un error. Por favor inténtalo de nuevo.');
        } finally {
            this.isValidating.set(false);
        }
    }

    async signInWithGoogle(): Promise<void> {
        this.isSigningIn.set(true);
        try {
            await this.authService.signInWithGoogle();
        } catch (error) {
            console.error('Sign in error:', error);
            this.isSigningIn.set(false);
        }
    }
}
