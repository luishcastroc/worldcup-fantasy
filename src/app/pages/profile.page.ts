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
import { AvatarThumbPipe } from '../pipes/avatar-thumb.pipe';
import { AvatarValidationError, CloudinaryService } from '../services/cloudinary.service';
import { PredictionsService } from '../services/predictions.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-profile-page',
    standalone: true,
    imports: [FormsModule, AvatarThumbPipe],
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
                    <div class="relative w-24 h-24 shrink-0">
                        @if (userAvatar()) {
                            <img [src]="userAvatar() | avatarThumb: 96" alt="Profile" class="w-24 h-24 rounded-full object-cover" />
                        } @else {
                            <div
                                class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold"
                            >
                                {{ userInitial() }}
                            </div>
                        }

                        <!-- Camera overlay button -->
                        <button
                            type="button"
                            (click)="fileInput.click()"
                            [disabled]="isUploadingAvatar()"
                            class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md ring-2 ring-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Cambiar foto"
                        >
                            @if (isUploadingAvatar()) {
                                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            } @else {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        </button>
                        <input
                            #fileInput
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            class="hidden"
                            (change)="onAvatarSelected($event)"
                        />
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ userName() }}</h2>
                        <p class="text-gray-500">{{ userEmail() }}</p>
                        @if (userAvatar()) {
                            <button
                                type="button"
                                (click)="removeAvatar()"
                                [disabled]="isUploadingAvatar()"
                                class="text-sm text-red-600 hover:text-red-700 mt-1 disabled:opacity-50"
                            >
                                Quitar foto
                            </button>
                        }
                    </div>
                </div>

                @if (avatarMessage()) {
                    <p
                        class="text-sm mb-4"
                        [class.text-green-600]="!avatarError()"
                        [class.text-red-600]="avatarError()"
                    >
                        {{ avatarMessage() }}
                    </p>
                }

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
    cloudinaryService = inject(CloudinaryService);
    router = inject(Router);

    ngOnInit(): void {
        // Always fetch fresh data when navigating to this page
        this.predictionsService.reload();
    }

    /** Synced from the profile resource, locally editable by the user. */
    editUsername = linkedSignal(
        () => this.authService.currentProfile()?.username ?? this.userName(),
    );
    isSaving = signal(false);
    saveMessage = signal('');
    saveError = signal(false);

    isUploadingAvatar = signal(false);
    avatarMessage = signal('');
    avatarError = signal(false);

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
        const profileAvatar = this.authService.currentProfile()?.avatar_url;
        if (profileAvatar) return profileAvatar;
        const user = this.supabaseService.currentUser();
        return user?.user_metadata?.['avatar_url'] || user?.user_metadata?.['picture'] || null;
    };

    async onAvatarSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        // Reset the input so selecting the same file again still fires change.
        input.value = '';
        if (!file) return;

        this.isUploadingAvatar.set(true);
        this.avatarMessage.set('');
        this.avatarError.set(false);

        try {
            const url = await this.cloudinaryService.uploadAvatar(file);
            await this.authService.updateProfile({ avatar_url: url });
            this.avatarMessage.set('¡Foto actualizada!');
            this.avatarError.set(false);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.avatarError.set(true);
            this.avatarMessage.set(
                error instanceof AvatarValidationError
                    ? error.message
                    : 'Error al subir la foto. Intenta de nuevo.',
            );
        } finally {
            this.isUploadingAvatar.set(false);
        }
    }

    async removeAvatar(): Promise<void> {
        this.isUploadingAvatar.set(true);
        this.avatarMessage.set('');
        this.avatarError.set(false);

        try {
            await this.authService.updateProfile({ avatar_url: null });
            this.avatarMessage.set('Foto eliminada.');
            this.avatarError.set(false);
        } catch (error) {
            console.error('Error removing avatar:', error);
            this.avatarError.set(true);
            this.avatarMessage.set('Error al quitar la foto. Intenta de nuevo.');
        } finally {
            this.isUploadingAvatar.set(false);
        }
    }

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
