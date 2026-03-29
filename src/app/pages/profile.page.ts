import {
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
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
                        <p class="text-sm text-gray-500">Resultados Correctos</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <p class="text-3xl font-bold text-gray-600">{{ stats().totalPredictions }}</p>
                        <p class="text-sm text-gray-500">Predicciones Hechas</p>
                    </div>
                </div>
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
export class ProfilePageComponent {
    authService = inject(AuthService);
    supabaseService = inject(SupabaseService);
    predictionsService = inject(PredictionsService);
    router = inject(Router);

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

    async signOut(): Promise<void> {
        await this.authService.signOut();
        this.router.navigate(['/login']);
    }
}
