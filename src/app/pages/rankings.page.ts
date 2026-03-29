import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { UserRanking } from '../models';
import { RankingsService } from '../services/rankings.service';
import { SupabaseService } from '../services/supabase.service';

@Component({
    selector: 'app-rankings-page',
    standalone: true,
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Clasificación</h1>
                <p class="text-gray-600">Mira cómo te posicionas contra otros jugadores</p>
            </div>

            <!-- Current User Position -->
            @if (currentUserRanking(); as ranking) {
                <div class="card bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 mb-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <span class="text-3xl font-bold">#{{ ranking.rank }}</span>
                            </div>
                            <div>
                                <p class="text-lg font-semibold">Tu Posición</p>
                                <p class="text-primary-100">{{ ranking.username || 'Tú' }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-4xl font-bold">{{ ranking.total_points }}</p>
                            <p class="text-primary-100">puntos</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ ranking.exact_predictions }}</p>
                            <p class="text-xs text-primary-100">Exactos</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ ranking.correct_outcomes }}</p>
                            <p class="text-xs text-primary-100">Acertados</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold">{{ ranking.total_predictions }}</p>
                            <p class="text-xs text-primary-100">Total</p>
                        </div>
                    </div>
                </div>
            }

            <!-- Search -->
            <div class="mb-6">
                <input
                    type="text"
                    [value]="searchQuery()"
                    (input)="onSearchChange($event)"
                    placeholder="Buscar jugadores..."
                    class="input-field max-w-md"
                />
            </div>

            <!-- Loading -->
            @if (rankingsService.isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            } @else {
                <!-- Rankings Table -->
                @if (filteredRankings().length > 0) {
                    <div class="card overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                                    >
                                        Pos
                                    </th>
                                    <th
                                        class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Jugador
                                    </th>
                                    <th
                                        class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Puntos
                                    </th>
                                    <th
                                        class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                                    >
                                        Exactos
                                    </th>
                                    <th
                                        class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                                    >
                                        Acertados
                                    </th>
                                    <th
                                        class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                                    >
                                        Predicciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @for (ranking of filteredRankings(); track ranking.user_id) {
                                    <tr class="hover:bg-gray-50" [class.bg-primary-50]="isCurrentUser(ranking.user_id)">
                                        <!-- Rank -->
                                        <td class="px-4 py-4">
                                            @if (ranking.rank === 1) {
                                                <span
                                                    class="inline-flex items-center justify-center w-8 h-8 bg-yellow-400 text-yellow-900 rounded-full font-bold"
                                                >
                                                    🥇
                                                </span>
                                            } @else if (ranking.rank === 2) {
                                                <span
                                                    class="inline-flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-700 rounded-full font-bold"
                                                >
                                                    🥈
                                                </span>
                                            } @else if (ranking.rank === 3) {
                                                <span
                                                    class="inline-flex items-center justify-center w-8 h-8 bg-amber-600 text-white rounded-full font-bold"
                                                >
                                                    🥉
                                                </span>
                                            } @else {
                                                <span
                                                    class="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-bold text-sm"
                                                >
                                                    {{ ranking.rank }}
                                                </span>
                                            }
                                        </td>

                                        <!-- Player -->
                                        <td class="px-4 py-4">
                                            <div class="flex items-center gap-3">
                                                @if (ranking.avatar_url) {
                                                    <img
                                                        [src]="ranking.avatar_url"
                                                        [alt]="ranking.username"
                                                        class="w-10 h-10 rounded-full"
                                                    />
                                                } @else {
                                                    <div
                                                        class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium"
                                                    >
                                                        {{ getInitial(ranking.username) }}
                                                    </div>
                                                }
                                                <div>
                                                    <p class="font-medium text-gray-900">
                                                        {{ ranking.username || 'Anónimo' }}
                                                        @if (isCurrentUser(ranking.user_id)) {
                                                            <span class="text-primary-600 text-sm">(Tú)</span>
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <!-- Points -->
                                        <td class="px-4 py-4 text-center">
                                            <span class="text-xl font-bold text-primary-600">
                                                {{ ranking.total_points }}
                                            </span>
                                        </td>

                                        <!-- Exact -->
                                        <td class="px-4 py-4 text-center hidden sm:table-cell">
                                            <span class="text-green-600 font-medium">
                                                {{ ranking.exact_predictions }}
                                            </span>
                                        </td>

                                        <!-- Correct -->
                                        <td class="px-4 py-4 text-center hidden sm:table-cell">
                                            <span class="text-blue-600 font-medium">
                                                {{ ranking.correct_outcomes }}
                                            </span>
                                        </td>

                                        <!-- Total Predictions -->
                                        <td class="px-4 py-4 text-center hidden md:table-cell">
                                            <span class="text-gray-600">
                                                {{ ranking.total_predictions }}
                                            </span>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                } @else if (searchQuery()) {
                    <div class="card p-12 text-center">
                        <p class="text-gray-500">No se encontraron jugadores con "{{ searchQuery() }}"</p>
                    </div>
                } @else {
                    <div class="card p-12 text-center">
                        <svg
                            class="w-16 h-16 text-gray-300 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Aún no hay clasificación</h3>
                        <p class="text-gray-500">
                            La clasificación aparecerá una vez que los partidos se completen y se otorguen puntos.
                        </p>
                    </div>
                }
            }

            <!-- Scoring Legend -->
            <div class="mt-8 card p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Sistema de Puntuación</h3>
                <div class="grid md:grid-cols-3 gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span class="text-green-700 font-bold">+3</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">Resultado Exacto</p>
                            <p class="text-sm text-gray-500">Acertaste el marcador exacto</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span class="text-blue-700 font-bold">+1</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">Resultado Correcto</p>
                            <p class="text-sm text-gray-500">Ganador o empate correcto</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span class="text-red-700 font-bold">0</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">Predicción Incorrecta</p>
                            <p class="text-sm text-gray-500">Resultado equivocado</p>
                        </div>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                    <p class="text-sm text-gray-600">
                        <strong>Reglas de desempate:</strong> Puntos → Predicciones exactas → Goles en predicciones
                        exactas
                    </p>
                </div>
            </div>
        </div>
    `,
})
export class RankingsPageComponent {
    rankingsService = inject(RankingsService);
    supabaseService = inject(SupabaseService);

    searchQuery = signal('');

    currentUserRanking = computed(() => this.rankingsService.currentUserRankingResource.value());

    filteredRankings = computed(() => {
        const query = this.searchQuery().toLowerCase();
        const rankings = this.rankingsService.rankings();

        if (!query) return rankings;

        return rankings.filter(r => r.username?.toLowerCase().includes(query));
    });

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
    }

    isCurrentUser(userId: string): boolean {
        return this.supabaseService.currentUser()?.id === userId;
    }

    getInitial(username: string | null): string {
        return username ? username.charAt(0).toUpperCase() : 'U';
    }
}
