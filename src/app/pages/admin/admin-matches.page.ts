import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatchWithTeams } from '../../models';
import { TeamFlagComponent } from '../../components/team-flag.component';
import { MatchesService } from '../../services/matches.service';
import { PredictionsService } from '../../services/predictions.service';

@Component({
    selector: 'app-admin-matches-page',
    standalone: true,
    imports: [FormsModule, TeamFlagComponent],
    template: `
        <div class="space-y-4">
            <!-- Header bar -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-3">
                    <select
                        [ngModel]="filterGroup()"
                        (ngModelChange)="filterGroup.set($event)"
                        class="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Todos los grupos</option>
                        @for (g of groupLetters(); track g) {
                            <option [value]="g">Grupo {{ g }}</option>
                        }
                    </select>

                    <select
                        [ngModel]="filterStatus()"
                        (ngModelChange)="filterStatus.set($event)"
                        class="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="scheduled">Pendientes</option>
                        <option value="completed">Completados</option>
                    </select>
                </div>

                <button
                    (click)="clearAll()"
                    [disabled]="clearingAll()"
                    class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                    Limpiar todo
                </button>
            </div>

            <!-- Clear-all confirmation banner -->
            @if (confirmingClearAll()) {
                <div class="border-l-4 border-red-500 bg-red-50 rounded p-4">
                    <p class="text-sm font-medium text-red-800 mb-1">¿Estás seguro?</p>
                    <p class="text-sm text-red-700 mb-3">
                        Se eliminarán todos los resultados y se resetearán los puntos de todas las predicciones. Esta
                        acción no se puede deshacer.
                    </p>
                    <div class="flex gap-2">
                        <button
                            (click)="confirmClearAll()"
                            [disabled]="clearingAll()"
                            class="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            @if (clearingAll()) {
                                <span class="flex items-center gap-1">
                                    <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
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
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        ></path>
                                    </svg>
                                    Limpiando...
                                </span>
                            } @else {
                                Confirmar
                            }
                        </button>
                        <button
                            (click)="confirmingClearAll.set(false)"
                            [disabled]="clearingAll()"
                            class="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            }

            <!-- Feedback messages -->
            @if (errorMessage()) {
                <div class="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                    {{ errorMessage() }}
                </div>
            }
            @if (successMessage()) {
                <div class="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-700">
                    {{ successMessage() }}
                </div>
            }

            <!-- Match table -->
            @if (matchesService.isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            } @else {
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Grupo
                                </th>
                                <th
                                    class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Fecha
                                </th>
                                <th
                                    class="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Local
                                </th>
                                <th
                                    class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Resultado
                                </th>
                                <th
                                    class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Visitante
                                </th>
                                <th
                                    class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Estado
                                </th>
                                <th
                                    class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @for (match of filteredMatches(); track match.id) {
                                <tr class="hover:bg-gray-50">
                                    <!-- Group -->
                                    <td class="px-3 py-3 text-center">
                                        <span
                                            class="text-xs font-medium text-gray-500 bg-gray-100 rounded px-2 py-0.5"
                                            >{{ match.group_letter }}</span
                                        >
                                    </td>

                                    <!-- Date -->
                                    <td class="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        {{ formatMatchDate(match.match_date) }}
                                    </td>

                                    <!-- Home team -->
                                    <td class="px-3 py-3 text-right">
                                        <span class="inline-flex items-center gap-1 justify-end">
                                            <span class="font-medium text-gray-900">{{ match.home_team.name }}</span>
                                            <app-team-flag
                                                [flagUrl]="match.home_team.flag_url"
                                                [teamCode]="match.home_team.code"
                                                size="sm"
                                            />
                                        </span>
                                    </td>

                                    <!-- Result / edit form -->
                                    <td class="px-3 py-3 text-center">
                                        @if (editingMatchId() === match.id) {
                                            <div class="flex items-center justify-center gap-1">
                                                <input
                                                    type="number"
                                                    [ngModel]="editHomeScore()"
                                                    (ngModelChange)="editHomeScore.set($event)"
                                                    min="0"
                                                    max="99"
                                                    class="w-12 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                                <span class="text-gray-400 font-medium">:</span>
                                                <input
                                                    type="number"
                                                    [ngModel]="editAwayScore()"
                                                    (ngModelChange)="editAwayScore.set($event)"
                                                    min="0"
                                                    max="99"
                                                    class="w-12 text-center text-sm border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                                />
                                            </div>
                                        } @else if (match.status === 'completed') {
                                            <span class="font-bold text-gold-600 text-base"
                                                >{{ match.home_score }} - {{ match.away_score }}</span
                                            >
                                        } @else {
                                            <span class="text-gray-400">— vs —</span>
                                        }
                                    </td>

                                    <!-- Away team -->
                                    <td class="px-3 py-3">
                                        <span class="inline-flex items-center gap-1">
                                            <app-team-flag
                                                [flagUrl]="match.away_team.flag_url"
                                                [teamCode]="match.away_team.code"
                                                size="sm"
                                            />
                                            <span class="font-medium text-gray-900">{{ match.away_team.name }}</span>
                                        </span>
                                    </td>

                                    <!-- Status badge -->
                                    <td class="px-3 py-3 text-center">
                                        <span
                                            class="text-xs rounded-full px-2 py-0.5 font-medium border {{
                                                statusBadgeClass(match.status)
                                            }}"
                                        >
                                            {{ match.status === 'completed' ? 'Completado' : 'Pendiente' }}
                                        </span>
                                    </td>

                                    <!-- Actions -->
                                    <td class="px-3 py-3 text-center">
                                        @if (saving() === match.id || clearing() === match.id) {
                                            <div
                                                class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"
                                            ></div>
                                        } @else if (editingMatchId() === match.id) {
                                            <div class="flex items-center justify-center gap-1">
                                                <button
                                                    (click)="saveResult()"
                                                    class="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    (click)="cancelEdit()"
                                                    class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        } @else if (confirmingClearId() === match.id) {
                                            <div class="flex items-center justify-center gap-1">
                                                <button
                                                    (click)="confirmClearResult(match.id)"
                                                    class="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Confirmar
                                                </button>
                                                <button
                                                    (click)="confirmingClearId.set(null)"
                                                    class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        } @else if (match.status === 'completed') {
                                            <div class="flex items-center justify-center gap-1">
                                                <button
                                                    (click)="startEdit(match)"
                                                    class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                                    title="Editar resultado"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    (click)="confirmingClearId.set(match.id)"
                                                    class="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                    title="Limpiar resultado"
                                                >
                                                    Limpiar
                                                </button>
                                            </div>
                                        } @else {
                                            <button
                                                (click)="startEdit(match)"
                                                class="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded hover:bg-primary-700 transition-colors"
                                            >
                                                Ingresar resultado
                                            </button>
                                        }
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>

                    @if (filteredMatches().length === 0) {
                        <div class="text-center py-8 text-gray-500 text-sm">
                            No hay partidos para los filtros seleccionados.
                        </div>
                    }
                </div>
            }
        </div>
    `,
})
export class AdminMatchesPageComponent {
    protected readonly matchesService = inject(MatchesService);
    private readonly predictionsService = inject(PredictionsService);

    editingMatchId = signal<number | null>(null);
    editHomeScore = signal<number | null>(null);
    editAwayScore = signal<number | null>(null);

    confirmingClearId = signal<number | null>(null);
    confirmingClearAll = signal(false);

    saving = signal<number | null>(null);
    clearing = signal<number | null>(null);
    clearingAll = signal(false);

    filterGroup = signal<string>('all');
    filterStatus = signal<'all' | 'scheduled' | 'completed'>('all');

    errorMessage = signal('');
    successMessage = signal('');

    filteredMatches = computed(() => {
        let list = this.matchesService.matches();
        const group = this.filterGroup();
        const status = this.filterStatus();
        if (group !== 'all') list = list.filter(m => m.group_letter === group);
        if (status !== 'all') list = list.filter(m => m.status === status);
        return list;
    });

    groupLetters = computed(() => this.matchesService.getGroupLetters());

    startEdit(match: MatchWithTeams): void {
        this.editingMatchId.set(match.id);
        this.editHomeScore.set(match.home_score ?? 0);
        this.editAwayScore.set(match.away_score ?? 0);
        this.confirmingClearId.set(null);
        this.clearError();
    }

    cancelEdit(): void {
        this.editingMatchId.set(null);
        this.editHomeScore.set(null);
        this.editAwayScore.set(null);
    }

    async saveResult(): Promise<void> {
        const matchId = this.editingMatchId();
        const homeScore = this.editHomeScore();
        const awayScore = this.editAwayScore();

        if (matchId === null || homeScore === null || awayScore === null) return;
        if (homeScore < 0 || awayScore < 0) {
            this.showError('Los marcadores deben ser números positivos.');
            return;
        }

        this.saving.set(matchId);
        this.clearError();

        try {
            const result = await this.matchesService.setMatchResult(matchId, homeScore, awayScore);
            if (result === 'ok') {
                this.cancelEdit();
                this.matchesService.matchesResource.reload();
                this.predictionsService.reload();
                this.showSuccess('Resultado guardado correctamente.');
            } else {
                this.showError(this.rpcErrorMessage(result));
            }
        } catch {
            this.showError('Error al guardar el resultado. Intenta de nuevo.');
        } finally {
            this.saving.set(null);
        }
    }

    confirmingClearResult(matchId: number): void {
        this.confirmingClearId.set(matchId);
        this.cancelEdit();
    }

    async confirmClearResult(matchId: number): Promise<void> {
        this.clearing.set(matchId);
        this.clearError();

        try {
            const result = await this.matchesService.clearMatchResult(matchId);
            if (result === 'ok') {
                this.confirmingClearId.set(null);
                this.matchesService.matchesResource.reload();
                this.predictionsService.reload();
                this.showSuccess('Resultado eliminado correctamente.');
            } else {
                this.showError(this.rpcErrorMessage(result));
            }
        } catch {
            this.showError('Error al limpiar el resultado. Intenta de nuevo.');
        } finally {
            this.clearing.set(null);
        }
    }

    clearAll(): void {
        this.confirmingClearAll.set(true);
        this.cancelEdit();
        this.confirmingClearId.set(null);
    }

    async confirmClearAll(): Promise<void> {
        this.clearingAll.set(true);
        this.clearError();

        try {
            const result = await this.matchesService.clearAllResults();
            if (result === 'ok') {
                this.confirmingClearAll.set(false);
                this.matchesService.matchesResource.reload();
                this.predictionsService.reload();
                this.showSuccess('Todos los resultados fueron eliminados.');
            } else {
                this.showError(this.rpcErrorMessage(result));
            }
        } catch {
            this.showError('Error al limpiar los resultados. Intenta de nuevo.');
        } finally {
            this.clearingAll.set(false);
        }
    }

    formatMatchDate(dateStr: string): string {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-MX', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    statusBadgeClass(status: string): string {
        return status === 'completed'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-50 text-gray-500 border-gray-200';
    }

    private rpcErrorMessage(code: string): string {
        switch (code) {
            case 'not_admin':
                return 'No tienes permisos de administrador.';
            case 'not_found':
                return 'El partido no fue encontrado.';
            case 'invalid_scores':
                return 'Los marcadores deben ser números válidos (≥ 0).';
            default:
                return `Error inesperado: ${code}`;
        }
    }

    private showError(msg: string): void {
        this.errorMessage.set(msg);
        this.successMessage.set('');
    }

    private showSuccess(msg: string): void {
        this.successMessage.set(msg);
        this.errorMessage.set('');
        setTimeout(() => this.successMessage.set(''), 4000);
    }

    private clearError(): void {
        this.errorMessage.set('');
    }
}
