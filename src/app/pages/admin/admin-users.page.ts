import { Component, inject, resource, ResourceRef, signal } from '@angular/core';
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
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cuota
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Registro
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
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>

                @if (errorMessage()) {
                    <p class="text-sm text-red-600 text-center">{{ errorMessage() }}</p>
                }
            }
        </div>
    `,
})
export class AdminUsersPageComponent {
    private supabase = inject(SupabaseService);

    saving = signal<string | null>(null);
    errorMessage = signal('');

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

    async updateProfile(
        id: string,
        field: 'status' | 'role' | 'invite_quota',
        event: Event,
    ): Promise<void> {
        const rawValue = (event.target as HTMLInputElement | HTMLSelectElement).value;
        const value = field === 'invite_quota' ? Number(rawValue) : rawValue;

        this.saving.set(id);
        this.errorMessage.set('');

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

    statusClass(status: string): string {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'suspended': return 'bg-red-50 text-red-700 border-red-200';
            default: return '';
        }
    }

    getInitial(username: string | null): string {
        return username ? username.charAt(0).toUpperCase() : 'U';
    }

    formatDate(dateStr?: string): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    }
}
