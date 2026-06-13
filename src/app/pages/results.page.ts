import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { TeamFlagComponent } from '../components/team-flag.component';
import { MatchScorer, Prediction } from '../models';
import { AvatarThumbPipe } from '../pipes/avatar-thumb.pipe';
import { MatchesService } from '../services/matches.service';
import { PredictionsService } from '../services/predictions.service';

@Component({
    selector: 'app-results-page',
    standalone: true,
    imports: [DatePipe, TeamFlagComponent, AvatarThumbPipe],
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Resultados</h1>
                <p class="text-gray-600">Revisa los partidos completados y cómo te fue con tus predicciones</p>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2 mb-6">
                <button
                    (click)="selectedGroup.set(null)"
                    [class]="selectedGroup() === null ? 'btn-primary' : 'btn-secondary'"
                    class="py-2! px-4! text-sm"
                >
                    Todos los Grupos
                </button>
                @for (group of groups(); track group) {
                    <button
                        (click)="selectedGroup.set(group)"
                        [class]="selectedGroup() === group ? 'btn-primary' : 'btn-secondary'"
                        class="py-2! px-4! text-sm"
                    >
                        Grupo {{ group }}
                    </button>
                }
            </div>

            <!-- Loading -->
            @if (matchesService.isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            } @else {
                @if (completedMatches().length > 0) {
                    <div class="grid gap-4">
                        @for (match of filteredMatches(); track match.id) {
                            <div class="card p-4">
                                <!-- Match Header -->
                                <div class="flex justify-between items-center mb-4">
                                    <span class="badge badge-info">Grupo {{ match.group_letter }}</span>
                                    <span class="text-sm text-gray-500">
                                        {{ match.match_date | date: 'MMM d, yyyy' }}
                                    </span>
                                </div>

                                <!-- Match Result -->
                                <div class="flex items-center justify-center gap-4 sm:gap-8 mb-4">
                                    <!-- Home Team -->
                                    <div class="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                                        <span class="font-semibold text-gray-900 text-right hidden sm:block">
                                            {{ match.home_team.name }}
                                        </span>
                                        <span class="font-semibold text-gray-900 sm:hidden">
                                            {{ match.home_team.code }}
                                        </span>
                                        <app-team-flag
                                            [flagUrl]="match.home_team.flag_url"
                                            [teamCode]="match.home_team.code"
                                            size="lg"
                                        />
                                    </div>

                                    <!-- Score -->
                                    <div class="flex items-center gap-2 px-4">
                                        <span class="text-4xl font-bold text-gray-900">{{ match.home_score }}</span>
                                        <span class="text-2xl text-gray-400">-</span>
                                        <span class="text-4xl font-bold text-gray-900">{{ match.away_score }}</span>
                                    </div>

                                    <!-- Away Team -->
                                    <div class="flex items-center gap-2 sm:gap-3 flex-1">
                                        <app-team-flag
                                            [flagUrl]="match.away_team.flag_url"
                                            [teamCode]="match.away_team.code"
                                            size="lg"
                                        />
                                        <span class="font-semibold text-gray-900 hidden sm:block">
                                            {{ match.away_team.name }}
                                        </span>
                                        <span class="font-semibold text-gray-900 sm:hidden">
                                            {{ match.away_team.code }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Venue -->
                                @if (match.venue) {
                                    <div class="text-center text-xs text-gray-500 mb-4">
                                        {{ match.venue }}, {{ match.city }}
                                    </div>
                                }

                                <!-- User's Prediction -->
                                @if (getPrediction(match.id); as prediction) {
                                    <div class="border-t pt-4">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <span class="text-sm text-gray-500">Tu predicción: </span>
                                                <span class="font-semibold">
                                                    {{ prediction.predicted_home_score }} -
                                                    {{ prediction.predicted_away_score }}
                                                </span>
                                            </div>
                                            <div
                                                class="flex items-center gap-2 px-3 py-1 rounded-full"
                                                [class.bg-green-100]="prediction.points_earned > 0"
                                                [class.bg-red-100]="prediction.points_earned === 0"
                                            >
                                                @if (prediction.points_earned === 3) {
                                                    <svg
                                                        class="w-5 h-5 text-green-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd"
                                                        />
                                                    </svg>
                                                    <span class="text-sm font-semibold text-green-700"
                                                        >¡Exacto! +3</span
                                                    >
                                                } @else if (prediction.points_earned === 1) {
                                                    <svg
                                                        class="w-5 h-5 text-green-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clip-rule="evenodd"
                                                        />
                                                    </svg>
                                                    <span class="text-sm font-semibold text-green-700">+1</span>
                                                } @else {
                                                    <svg
                                                        class="w-5 h-5 text-red-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fill-rule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                            clip-rule="evenodd"
                                                        />
                                                    </svg>
                                                    <span class="text-sm font-semibold text-red-700">0</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                } @else {
                                    <div class="border-t pt-4">
                                        <p class="text-sm text-gray-400 text-center">Sin predicción</p>
                                    </div>
                                }

                                <!-- Who got points on this match -->
                                @if (scorers(match.id); as matchScorers) {
                                    <div class="border-t mt-4 pt-4">
                                        <!-- Exact-score alert -->
                                        @if (exactScorers(match.id); as exact) {
                                            @if (exact.length > 0) {
                                                <div
                                                    class="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2.5 mb-3"
                                                >
                                                    <div class="flex items-center gap-1.5 mb-2">
                                                        <svg
                                                            class="w-4 h-4 text-gold shrink-0"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.95c.3.922-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.784.57-1.838-.196-1.539-1.118l1.286-3.95a1 1 0 00-.363-1.118L2.98 9.377c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z"
                                                            />
                                                        </svg>
                                                        <span class="text-xs font-bold uppercase tracking-wide text-amber-700">
                                                            ¡Resultado exacto! +3
                                                        </span>
                                                    </div>
                                                    <div class="flex flex-wrap gap-1.5">
                                                        @for (s of exact; track s.username) {
                                                            <span
                                                                class="inline-flex items-center gap-1.5 rounded-full bg-white/80 ring-1 ring-gold/40 pl-1 pr-2.5 py-0.5"
                                                            >
                                                                @if (s.avatar_url) {
                                                                    <img
                                                                        [src]="s.avatar_url | avatarThumb: 32"
                                                                        [alt]="s.username || 'Usuario'"
                                                                        class="w-5 h-5 rounded-full object-cover"
                                                                    />
                                                                } @else {
                                                                    <span
                                                                        class="w-5 h-5 rounded-full bg-gold/80 text-white text-[10px] font-bold flex items-center justify-center"
                                                                    >
                                                                        {{ initial(s.username) }}
                                                                    </span>
                                                                }
                                                                <span class="text-xs font-semibold text-gray-900">
                                                                    {{ s.username || 'Usuario' }}
                                                                </span>
                                                            </span>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        }

                                        <!-- Correct-outcome scorers (+1) -->
                                        @if (outcomeScorers(match.id); as outcome) {
                                            @if (outcome.length > 0) {
                                                <p class="text-xs font-medium text-gray-500 mb-2">
                                                    Acertaron el resultado (+1)
                                                </p>
                                                <div class="flex flex-wrap gap-1.5">
                                                    @for (s of outcome; track s.username) {
                                                        <span
                                                            class="inline-flex items-center gap-1.5 rounded-full bg-green-50 ring-1 ring-green-200 pl-1 pr-2.5 py-0.5"
                                                        >
                                                            @if (s.avatar_url) {
                                                                <img
                                                                    [src]="s.avatar_url | avatarThumb: 32"
                                                                    [alt]="s.username || 'Usuario'"
                                                                    class="w-5 h-5 rounded-full object-cover"
                                                                />
                                                            } @else {
                                                                <span
                                                                    class="w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center"
                                                                >
                                                                    {{ initial(s.username) }}
                                                                </span>
                                                            }
                                                            <span class="text-xs font-medium text-gray-700">
                                                                {{ s.username || 'Usuario' }}
                                                            </span>
                                                        </span>
                                                    }
                                                </div>
                                            }
                                        }
                                    </div>
                                }
                            </div>
                        } @empty {
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 class="text-lg font-medium text-gray-900 mb-2">Aún no hay resultados</h3>
                                <p class="text-gray-500">
                                    @if (selectedGroup()) {
                                        Aún no hay partidos completados en el Grupo {{ selectedGroup() }}.
                                    } @else {
                                        Aún no se han completado partidos. ¡Vuelve cuando comiencen los partidos!
                                    }
                                </p>
                            </div>
                        }
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Aún no hay resultados</h3>
                        <p class="text-gray-500">El torneo aún no ha comenzado. ¡Vuelve cuando inicien los partidos!</p>
                    </div>
                }
            }
        </div>
    `,
})
export class ResultsPageComponent {
    matchesService = inject(MatchesService);
    predictionsService = inject(PredictionsService);

    selectedGroup = signal<string | null>(null);

    groups = computed(() => this.matchesService.getGroupLetters());

    completedMatches = computed(() => this.matchesService.getCompletedMatches());

    filteredMatches = computed(() => {
        const group = this.selectedGroup();
        const matches = this.completedMatches();
        if (!group) return matches;
        return matches.filter(m => m.group_letter === group);
    });

    getPrediction(matchId: number): Prediction | null {
        return this.predictionsService.predictionsMap().get(matchId) || null;
    }

    /** All users who earned points on this match (3 pts first, then 1 pt). */
    scorers(matchId: number): MatchScorer[] {
        return this.predictionsService.scorersByMatch().get(matchId) ?? [];
    }

    /** Users who nailed the exact score (+3) on this match. */
    exactScorers(matchId: number): MatchScorer[] {
        return this.scorers(matchId).filter(s => s.points_earned === 3);
    }

    /** Users who got the outcome right but not the exact score (+1). */
    outcomeScorers(matchId: number): MatchScorer[] {
        return this.scorers(matchId).filter(s => s.points_earned === 1);
    }

    initial(username: string | null | undefined): string {
        return username ? username.charAt(0).toUpperCase() : 'U';
    }
}
