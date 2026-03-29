import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { InviteService } from '../services/invite.service';

@Component({
    selector: 'app-invite-page',
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
                </div>

                <!-- Invite Card -->
                <div class="card p-8">
                    <div class="space-y-6">
                        <!-- User info -->
                        @if (auth.currentProfile(); as profile) {
                            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                @if (auth.getUserAvatar(); as avatar) {
                                    <img [src]="avatar" alt="Avatar" class="w-10 h-10 rounded-full" />
                                } @else {
                                    <div
                                        class="w-10 h-10 rounded-full bg-fifa-gold flex items-center justify-center text-fifa-dark font-bold"
                                    >
                                        {{ auth.getUserDisplayName().charAt(0).toUpperCase() }}
                                    </div>
                                }
                                <div>
                                    <p class="font-medium text-gray-900">{{ auth.getUserDisplayName() }}</p>
                                    <p class="text-xs text-gray-500">Cuenta verificada</p>
                                </div>
                            </div>
                        }

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
                                [(ngModel)]="code"
                                (ngModelChange)="errorMessage.set('')"
                                placeholder="Ej: AB3X7YZ2"
                                maxlength="8"
                                [disabled]="isLoading()"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            @if (errorMessage()) {
                                <p class="mt-2 text-sm text-red-600">{{ errorMessage() }}</p>
                            }
                        </div>

                        <!-- Submit button -->
                        <button
                            (click)="submit()"
                            [disabled]="isLoading() || !code.trim()"
                            class="w-full py-3 px-6 bg-fifa-gold text-fifa-dark font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            @if (isLoading()) {
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
                                <span>Ingresar</span>
                            }
                        </button>

                        <!-- Sign out link -->
                        <div class="text-center">
                            <button
                                (click)="signOut()"
                                class="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Usar otra cuenta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class InvitePageComponent {
    protected readonly auth = inject(AuthService);
    private readonly inviteService = inject(InviteService);
    private readonly router = inject(Router);

    code = '';
    isLoading = signal(false);
    errorMessage = signal('');

    async submit(): Promise<void> {
        if (!this.code.trim()) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        try {
            const result = await this.inviteService.redeemCode(this.code);

            if (result === 'ok' || result === 'already_approved') {
                await this.auth.profileResource.reload();
                this.router.navigate(['/matches']);
            } else if (result === 'invalid') {
                this.errorMessage.set('Código inválido o ya utilizado. Verifica e inténtalo de nuevo.');
            } else if (result === 'expired') {
                this.errorMessage.set('Este código ha expirado. Solicita uno nuevo a quien te invitó.');
            }
        } catch {
            this.errorMessage.set('Ocurrió un error. Por favor inténtalo de nuevo.');
        } finally {
            this.isLoading.set(false);
        }
    }

    async signOut(): Promise<void> {
        await this.auth.signOut();
        this.router.navigate(['/login']);
    }
}
