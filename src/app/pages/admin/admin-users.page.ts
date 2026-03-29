import {
  Component,
  inject,
  resource,
  ResourceRef,
  signal,
} from '@angular/core';

import { Profile } from '../../models';
import { SupabaseService } from '../../services/supabase.service';

@Component({
    selector: 'app-admin-users-page',
    standalone: true,
    template: `
        <div class="space-y-4">
            @if (profilesResource.isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            } @else {
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Usuario
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Estado
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Rol
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Cuota
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Registro
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @for (profile of profilesResource.value(); track profile.id) {
                                <tr class="hover:bg-gray-50">
                                    <!-- User info -->
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            @if (profile.avatar_url) {
                                                <img
                                                    [src]="profile.avatar_url"
                                                    [alt]="profile.username"
                                                    class="w-8 h-8 rounded-full"
                                                />
                                            } @else {
                                                <div
                                                    class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium"
                                                >
                                                    {{ getInitial(profile.username) }}
                                                </div>
                                            }
                                            <div>
                                                <p class="font-medium text-gray-900">
                                                    {{ profile.username || 'Sin nombre' }}
                                                </p>
                                                @if (profile.full_name && profile.full_name !== profile.username) {
                                                    <p class="text-xs text-gray-500">{{ profile.full_name }}</p>
                                                }
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Status -->
                                    <td class="px-4 py-3 text-center">
                                        <select
                                            [value]="profile.status"
                                            (change)="updateProfile(profile.id, 'status', $event)"
                                            [disabled]="saving() === profile.id"
                                            class="text-xs rounded-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            [class]="statusClass(profile.status)"
                                        >
                                            <option value="pending">Pendiente</option>
                                            <option value="approved">Aprobado</option>
                                            <option value="suspended">Suspendido</option>
                                        </select>
                                    </td>

                                    <!-- Role -->
                                    <td class="px-4 py-3 text-center">
                                        <select
                                            [value]="profile.role"
                                            (change)="updateProfile(profile.id, 'role', $event)"
                                            [disabled]="saving() === profile.id"
                                            class="text-xs rounded-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>

                                    <!-- Invite quota -->
                                    <td class="px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            [value]="profile.invite_quota"
                                            min="0"
                                            max="50"
                                            (change)="updateProfile(profile.id, 'invite_quota', $event)"
                                            [disabled]="saving() === profile.id"
                                            class="w-16 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
                                        />
                                    </td>

                                    <!-- Created at -->
                                    <td class="px-4 py-3 text-gray-500 text-xs">
                                        {{ formatDate(profile.created_at) }}
                                    </td>

                                    <!-- Actions -->
                                    <td class="px-4 py-3 text-center">
                                        @if (profile.id === currentUserId) {
                                            <span class="text-xs text-gray-400 italic">Tú</span>
                                        } @else if (deleting() === profile.id) {
                                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 mx-auto"></div>
                                        } @else if (confirmingDelete() === profile.id) {
                                            <div class="flex items-center justify-center gap-1">
                                                <button
                                                    (click)="deleteUser(profile.id)"
                                                    class="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    (click)="confirmingDelete.set(null)"
                                                    class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        } @else {
                                            <button
                                                (click)="confirmingDelete.set(profile.id)"
                                                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Eliminar usuario"
                                            >
                                                <svg
                                                    class="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        }
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>

                <!-- Confirmation banner for delete -->
                @if (confirmingDelete()) {
                    <div class="card p-4 border-l-4 border-red-500 bg-red-50">
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
                            <div>
                                <p class="text-sm font-medium text-red-800">
                                    ¿Estás seguro de eliminar a
                                    <strong>{{ getDeleteTargetName() }}</strong
                                    >?
                                </p>
                                <p class="text-xs text-red-600 mt-1">
                                    Se borrarán todas sus predicciones y datos. Esta acción no se puede deshacer.
                                </p>
                            </div>
                        </div>
                    </div>
                }

                @if (errorMessage()) {
                    <p class="text-sm text-red-600 text-center">{{ errorMessage() }}</p>
                }

                @if (successMessage()) {
                    <p class="text-sm text-green-600 text-center">{{ successMessage() }}</p>
                }
            }
        </div>
    `,
})
export class AdminUsersPageComponent {
    private readonly supabase = inject(SupabaseService);

    saving = signal<string | null>(null);
    deleting = signal<string | null>(null);
    confirmingDelete = signal<string | null>(null);
    errorMessage = signal('');
    successMessage = signal('');

    currentUserId = this.supabase.currentUser()?.id;

    profilesResource: ResourceRef<Profile[]> = resource({
        loader: async () => {
            const { data, error } = await this.supabase.client
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error loading profiles:', error);
                return [];
            }

            return (data ?? []) as Profile[];
        },
        defaultValue: [],
    });

    async updateProfile(id: string, field: 'status' | 'role' | 'invite_quota', event: Event): Promise<void> {
        const rawValue = (event.target as HTMLInputElement | HTMLSelectElement).value;
        const value = field === 'invite_quota' ? Number(rawValue) : rawValue;

        this.saving.set(id);
        this.errorMessage.set('');
        this.successMessage.set('');

        const { error } = await this.supabase.client
            .from('profiles')
            .update({ [field]: value })
            .eq('id', id);

        if (error) {
            console.error('Error updating profile:', error);
            this.errorMessage.set('Error al guardar cambios. Inténtalo de nuevo.');
        } else {
            this.profilesResource.reload();
        }

        this.saving.set(null);
    }

    async deleteUser(userId: string): Promise<void> {
        this.deleting.set(userId);
        this.confirmingDelete.set(null);
        this.errorMessage.set('');
        this.successMessage.set('');

        try {
            const { data, error } = await this.supabase.client.rpc('admin_delete_user', {
                p_user_id: userId,
            });

            if (error) {
                console.error('Error deleting user:', error);
                this.errorMessage.set('Error al eliminar usuario. Inténtalo de nuevo.');
                return;
            }

            switch (data) {
                case 'ok':
                    this.successMessage.set('Usuario eliminado correctamente.');
                    this.profilesResource.reload();
                    // Clear success message after a few seconds
                    setTimeout(() => this.successMessage.set(''), 4000);
                    break;
                case 'self_delete':
                    this.errorMessage.set('No puedes eliminarte a ti mismo.');
                    break;
                case 'not_found':
                    this.errorMessage.set('Usuario no encontrado.');
                    this.profilesResource.reload();
                    break;
                case 'not_admin':
                    this.errorMessage.set('No tienes permisos para esta acción.');
                    break;
                default:
                    this.errorMessage.set('Respuesta inesperada. Inténtalo de nuevo.');
            }
        } catch {
            this.errorMessage.set('Error al eliminar usuario. Inténtalo de nuevo.');
        } finally {
            this.deleting.set(null);
        }
    }

    getDeleteTargetName(): string {
        const targetId = this.confirmingDelete();
        if (!targetId) return '';
        const profile = this.profilesResource.value()?.find(p => p.id === targetId);
        return profile?.username || profile?.full_name || 'este usuario';
    }

    statusClass(status: string): string {
        switch (status) {
            case 'approved':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'suspended':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return '';
        }
    }

    getInitial(username: string | null): string {
        return username ? username.charAt(0).toUpperCase() : 'U';
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
}
