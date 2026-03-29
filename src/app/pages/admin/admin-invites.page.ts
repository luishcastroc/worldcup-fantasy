import {
  Component,
  inject,
  signal,
} from '@angular/core';

import { InviteService } from '../../services/invite.service';

@Component({
    selector: 'app-admin-invites-page',
    standalone: true,
    template: `
        <div class="space-y-4">
            <!-- Generate button -->
            <div class="flex justify-end">
                <button
                    (click)="generateCode()"
                    [disabled]="isGenerating()"
                    class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    @if (isGenerating()) {
                        <svg
                            class="animate-spin h-4 w-4"
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
                        <span>Generando...</span>
                    } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Generar código</span>
                    }
                </button>
            </div>

            @if (newCode()) {
                <div class="card p-4 bg-green-50 border border-green-200 flex items-center justify-between">
                    <div>
                        <p class="text-xs text-green-600 font-medium mb-1">Nuevo código generado</p>
                        <p class="text-2xl font-mono font-bold text-green-800 tracking-widest">{{ newCode() }}</p>
                    </div>
                    <button
                        (click)="copyCode(newCode()!)"
                        class="text-green-700 hover:text-green-900 transition-colors"
                        title="Copiar"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                </div>
            }

            @if (errorMessage()) {
                <p class="text-sm text-red-600">{{ errorMessage() }}</p>
            }

            <!-- Codes table -->
            @if (inviteService.allCodesResource.isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            } @else if (inviteService.allCodesResource.value().length === 0) {
                <div class="card p-12 text-center text-gray-500">
                    <p>No hay códigos generados aún.</p>
                </div>
            } @else {
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Código
                                </th>
                                <th
                                    class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Estado
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                                >
                                    Generado
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                >
                                    Expira
                                </th>
                                <th
                                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                                >
                                    Usado
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @for (invite of inviteService.allCodesResource.value()!; track invite.id) {
                                <tr class="hover:bg-gray-50">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <span class="font-mono font-semibold text-gray-900 tracking-wider">
                                                {{ invite.code }}
                                            </span>
                                            <button
                                                (click)="copyCode(invite.code)"
                                                class="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Copiar"
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
                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-center">
                                        @if (invite.used_by) {
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                                            >
                                                Usado
                                            </span>
                                        } @else if (invite.expires_at && isExpired(invite.expires_at)) {
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                                            >
                                                Expirado
                                            </span>
                                        } @else {
                                            <span
                                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                                            >
                                                Disponible
                                            </span>
                                        }
                                    </td>
                                    <td class="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                                        {{ formatDate(invite.created_at) }}
                                    </td>
                                    <td class="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                                        {{ invite.expires_at ? formatDate(invite.expires_at) : 'Nunca' }}
                                    </td>
                                    <td class="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                                        {{ invite.used_at ? formatDate(invite.used_at) : '—' }}
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div>
    `,
})
export class AdminInvitesPageComponent {
    protected readonly inviteService = inject(InviteService);

    isGenerating = signal(false);
    newCode = signal<string | null>(null);
    errorMessage = signal('');

    async generateCode(): Promise<void> {
        this.isGenerating.set(true);
        this.errorMessage.set('');
        this.newCode.set(null);

        try {
            const code = await this.inviteService.generateCode();
            this.newCode.set(code);
            this.inviteService.allCodesResource.reload();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            this.errorMessage.set(
                message.includes('quota_exceeded')
                    ? 'Cuota de invitaciones alcanzada.'
                    : 'Error al generar código. Inténtalo de nuevo.',
            );
        } finally {
            this.isGenerating.set(false);
        }
    }

    copyCode(code: string): void {
        navigator.clipboard.writeText(code).catch(() => {});
    }

    isExpired(expiresAt: string): boolean {
        return new Date(expiresAt) < new Date();
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
}
