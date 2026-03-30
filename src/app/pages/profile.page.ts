import {
  Component,
  computed,
  inject,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { InviteService } from '../services/invite.service';
import { PredictionsService } from '../services/predictions.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [FormsModule],
    template: `
        <div class="max-w-2xl mx-auto px-4 py-6">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Perfil</h1>
                <p class="text-gray-600">Administra tu configuración de cuenta</p>
            </div>

            <!-- Profile Card -->
            <div class="card p-6 mb-6">
                <div class="flex items-center gap-6 mb-6">
                    @if (userAvatar()) {
                        <img [src]="userAvatar()" alt="Profile" class="w-24 h-24 rounded-full" />
                    } @else {
                        <div
                            class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold"
                        >
                            {{ userInitial() }}
                        </div>
                    }
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ userName() }}</h2>
                        <p class="text-gray-500">{{ userEmail() }}</p>
                    </div>
                </div>

                <!-- Edit Username -->
                <div class="border-t pt-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2"> Nombre para mostrar </label>
                    <div class="flex gap-3">
                        <input
                            type="text"
                            [ngModel]="editUsername()"
                            (ngModelChange)="editUsername.set($event)"
                            (focus)="clearMessage()"
                            placeholder="Ingresa tu nombre"
                            class="input-field flex-1"
                        />
                        <button (click)="updateUsername()" [disabled]="isSaving() || !editUsername()" class="btn-primary">
                            @if (isSaving()) {
                                Guardando...
                            } @else {
                                Guardar
                            }
                        </button>
                    </div>
                    @if (saveMessage()) {
                        <p
                            class="text-sm mt-2"
                            [class.text-green-600]="!saveError()"
                            [class.text-red-600]="saveError()"
                        >
                            {{ saveMessage() }}
                        </p>
                    }
                </div>
            </div>

            <!-- Stats Card -->
            <div class="card p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Tus Estadísticas</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-3xl font-bold text-primary-600">{{ stats().totalPoints }}</p>
                        <p class="text-sm text-gray-500">Puntos Totales</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-3xl font-bold text-green-600">{{ stats().exactPredictions }}</p>
                        <p class="text-sm text-gray-500">Resultados Exactos</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-3xl font-bold text-blue-600">{{ stats().correctOutcomes }}</p>
                        <p class="text-sm text-gray-500">Solo Resultado</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-3xl font-bold text-gray-600">{{ stats().totalPredictions }}</p>
                        <p class="text-sm text-gray-500">Predicciones Hechas</p>
                    </div>
                </div>
            </div>

            <!-- Invitations Card -->
            <div class="card p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Invitaciones</h3>
                        <p class="text-sm text-gray-500 mt-0.5">
                            Comparte estos códigos con quien quieras invitar
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-500">Disponibles</p>
                        <p class="text-2xl font-bold text-primary-600">{{ availableInvites() }}</p>
                    </div>
                </div>

                <!-- Generate button -->
                @if (availableInvites() > 0) {
                    <button
                        (click)="generateInvite()"
                        [disabled]="isGeneratingInvite()"
                        class="mb-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        @if (isGeneratingInvite()) {
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Generando...</span>
                        } @else {
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Generar código</span>
                        }
                    </button>
                }

                @if (inviteError()) {
                    <p class="text-sm text-red-600 mb-3">{{ inviteError() }}</p>
                }

                <!-- Codes list -->
                @if (inviteService.myCodesResource.isLoading()) {
                    <div class="flex justify-center py-4">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                } @else if ((inviteService.myCodesResource.value() ?? []).length === 0) {
                    <p class="text-sm text-gray-400 italic">Aún no has generado ningún código.</p>
                } @else {
                    <div class="space-y-2">
                        @for (invite of inviteService.myCodesResource.value()!; track invite.id) {
                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono font-semibold text-gray-900 tracking-wider">{{ invite.code }}</span>
                                    @if (invite.used_by) {
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                            Usado
                                        </span>
                                    } @else if (invite.expires_at && isExpired(invite.expires_at)) {
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                            Expirado
                                        </span>
                                    } @else {
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            Disponible
                                        </span>
                                    }
                                </div>
                                <div class="flex items-center gap-2">
                                    @if (invite.expires_at && !invite.used_by) {
                                        <span class="text-xs text-gray-400">Expira {{ formatExpiry(invite.expires_at) }}</span>
                                    }
                                    @if (!invite.used_by) {
                                        <button
                                            (click)="copyInvite(invite.code)"
                                            class="text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copiar código"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>

            <!-- Danger Zone -->
            <div class="card p-6 border-red-200">
                <h3 class="text-lg font-semibold text-red-600 mb-4">Acciones de Cuenta</h3>
                <button
                    (click)="signOut()"
                    class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    `,
})
export class ProfilePageComponent implements OnInit {
    authService = inject(AuthService);
    supabaseService = inject(SupabaseService);
    predictionsService = inject(PredictionsService);
    router = inject(Router);
    protected readonly inviteService = inject(InviteService);

    ngOnInit(): void {
        // Always fetch fresh data when navigating to this page
        this.predictionsService.reload();
    }

    isGeneratingInvite = signal(false);
    inviteError = signal('');

    /** Synced from the profile resource, locally editable by the user. */
    editUsername = linkedSignal(
        () => this.authService.currentProfile()?.username ?? this.userName(),
    );
    isSaving = signal(false);
    saveMessage = signal('');
    saveError = signal(false);

    /** Derive stats reactively from the predictions resource. */
    stats = computed(() => ({
        totalPoints: this.predictionsService.getTotalPoints(),
        exactPredictions: this.predictionsService.getExactPredictions(),
        correctOutcomes: this.predictionsService.getCorrectOutcomes(),
        totalPredictions: this.predictionsService.predictions().length,
    }));

    userName = () => {
        const user = this.supabaseService.currentUser();
        return (
            user?.user_metadata?.['full_name'] || user?.user_metadata?.['name'] || user?.email?.split('@')[0] || 'User'
        );
    };

    userEmail = () => {
        return this.supabaseService.currentUser()?.email || '';
    };

    userAvatar = () => {
        const user = this.supabaseService.currentUser();
        return user?.user_metadata?.['avatar_url'] || user?.user_metadata?.['picture'] || null;
    };

    userInitial = () => {
        const name = this.userName();
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    async updateUsername(): Promise<void> {
        if (!this.editUsername().trim()) return;

        this.isSaving.set(true);
        this.saveMessage.set('');
        this.saveError.set(false);

        try {
            await this.authService.updateProfile({
                username: this.editUsername().trim(),
            });
            this.saveMessage.set('¡Perfil actualizado exitosamente!');
            this.saveError.set(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            this.saveMessage.set('Error al actualizar el perfil. Intenta de nuevo.');
            this.saveError.set(true);
        } finally {
            this.isSaving.set(false);
        }
    }

    clearMessage(): void {
        this.saveMessage.set('');
        this.saveError.set(false);
    }

    availableInvites = computed(() => {
        const profile = this.authService.currentProfile();
        if (!profile) return 0;
        const quota = profile.invite_quota;
        const unused = (this.inviteService.myCodesResource.value() ?? []).filter(c => !c.used_by && !this.isExpired(c.expires_at ?? null)).length;
        return Math.max(0, quota - unused);
    });

    async generateInvite(): Promise<void> {
        this.isGeneratingInvite.set(true);
        this.inviteError.set('');
        try {
            await this.inviteService.generateCode();
            this.inviteService.myCodesResource.reload();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            this.inviteError.set(
                message.includes('quota_exceeded')
                    ? 'Has alcanzado tu límite de invitaciones.'
                    : 'Error al generar el código. Inténtalo de nuevo.',
            );
        } finally {
            this.isGeneratingInvite.set(false);
        }
    }

    copyInvite(code: string): void {
        navigator.clipboard.writeText(code).catch(() => {});
    }

    isExpired(expiresAt: string | null): boolean {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    }

    formatExpiry(expiresAt: string): string {
        return new Date(expiresAt).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short',
        });
    }

    async signOut(): Promise<void> {
        await this.authService.signOut();
        this.router.navigate(['/login']);
    }
}
