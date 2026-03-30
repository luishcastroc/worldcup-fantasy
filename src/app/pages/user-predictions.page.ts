import { DatePipe } from '@angular/common';
import {
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { TeamFlagComponent } from '../components/team-flag.component';
import { PredictionsService } from '../services/predictions.service';
import { SupabaseService } from '../services/supabase.service';
import { PredictionWithMatch, UserRanking } from '../models';

@Component({
    selector: 'app-user-predictions-page',
    standalone: true,
    imports: [DatePipe, TeamFlagComponent, RouterLink],
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6">
            <!-- Back link -->
            <a routerLink="/rankings" class="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-4 text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Volver al Ranking
            </a>

            <!-- Loading -->
            @if (isLoading()) {
                <div class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            } @else if (errorMsg()) {
                <div class="card p-12 text-center">
                    <p class="text-red-500">{{ errorMsg() }}</p>
                </div>
            } @else {
                <!-- Header with user info -->
                <div class="mb-6">
                    <div class="flex items-center gap-3 mb-2">
                        @if (userRanking()?.avatar_url) {
                            <img
                                [src]="userRanking()!.avatar_url"
                                [alt]="userRanking()!.username"
                                class="w-12 h-12 rounded-full"
                            />
                        } @else {
                            <div class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
                                {{ getInitial(userRanking()?.username) }}
                            </div>
                        }
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">
                                Predicciones de {{ userRanking()?.username || 'Usuario' }}
                            </h1>
                            @if (userRanking(); as ranking) {
                                <p class="text-gray-600">
                                    Posición #{{ ranking.rank }}
                                </p>
                            }
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div class="card p-4 text-center">
                        <p class="text-3xl font-bold text-primary-600">{{ totalPoints() }}</p>
                        <p class="text-sm text-gray-500">Puntos Totales</p>
                    </div>
                    <div class="card p-4 text-center">
                        <p class="text-3xl font-bold text-green-600">{{ exactPredictions() }}</p>
                        <p class="text-sm text-gray-500">Exactos</p>
                    </div>
                    <div class="card p-4 text-center">
                        <p class="text-3xl font-bold text-blue-600">{{ correctOutcomes() }}</p>
                        <p class="text-sm text-gray-500">Solo Resultado</p>
                    </div>
                    <div class="card p-4 text-center">
                        <p class="text-3xl font-bold text-red-600">{{ wrongPredictions() }}</p>
                        <p class="text-sm text-gray-500">Fallados</p>
                    </div>
                    <div class="card p-4 text-center">
                        <p class="text-3xl font-bold text-gray-600">{{ totalPredictions() }}</p>
                        <p class="text-sm text-gray-500">Total Hechas</p>
                    </div>
                </div>

                <!-- Predictions Table -->
                @if (predictions().length > 0) {
                    <div class="card overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Partido
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Predicción
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                        Resultado Real
                                    </th>
                                    <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Puntos
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @for (prediction of predictions(); track prediction.id) {
                                    <tr class="hover:bg-gray-50">
                                        <!-- Match -->
                                        <td class="px-4 py-4">
                                            <div class="flex items-center gap-2">
                                                <app-team-flag
                                                    [flagUrl]="prediction.match.home_team.flag_url"
                                                    [teamCode]="prediction.match.home_team.code"
                                                    size="sm"
                                                />
                                                <span class="text-sm font-medium">{{ prediction.match.home_team.code }}</span>
                                                <span class="text-gray-400">-</span>
                                                <span class="text-sm font-medium">{{ prediction.match.away_team.code }}</span>
                                                <app-team-flag
                                                    [flagUrl]="prediction.match.away_team.flag_url"
                                                    [teamCode]="prediction.match.away_team.code"
                                                    size="sm"
                                                />
                                            </div>
                                            <div class="text-xs text-gray-500 mt-1">
                                                {{ prediction.match.match_date | date: 'd MMM, h:mm a' }}
                                                · Grupo {{ prediction.match.group_letter }}
                                            </div>
                                        </td>

                                        <!-- Prediction -->
                                        <td class="px-4 py-4 text-center">
                                            <span class="text-lg font-bold">
                                                {{ prediction.predicted_home_score }} - {{ prediction.predicted_away_score }}
                                            </span>
                                        </td>

                                        <!-- Actual Result -->
                                        <td class="px-4 py-4 text-center hidden sm:table-cell">
                                            @if (prediction.match.status === 'completed') {
                                                <span class="text-lg font-bold text-gray-900">
                                                    {{ prediction.match.home_score }} - {{ prediction.match.away_score }}
                                                </span>
                                            } @else if (prediction.match.status === 'in_progress') {
                                                <span class="badge badge-warning">En Vivo</span>
                                            } @else {
                                                <span class="text-gray-400">-</span>
                                            }
                                        </td>

                                        <!-- Points -->
                                        <td class="px-4 py-4 text-center">
                                            @if (prediction.match.status === 'completed') {
                                                <span
                                                    class="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold"
                                                    [class.bg-green-100]="prediction.points_earned > 0"
                                                    [class.text-green-700]="prediction.points_earned > 0"
                                                    [class.bg-red-100]="prediction.points_earned === 0"
                                                    [class.text-red-700]="prediction.points_earned === 0"
                                                >
                                                    @if (prediction.points_earned === 3) {
                                                        +3
                                                    } @else if (prediction.points_earned === 1) {
                                                        +1
                                                    } @else {
                                                        0
                                                    }
                                                </span>
                                            } @else {
                                                <span class="text-gray-400">-</span>
                                            }
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                } @else {
                    <div class="card p-12 text-center">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Sin predicciones</h3>
                        <p class="text-gray-500">Este usuario aún no ha hecho predicciones.</p>
                    </div>
                }
            }
        </div>
    `,
})
export class UserPredictionsPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private predictionsService = inject(PredictionsService);
    private supabase = inject(SupabaseService);

    predictions = signal<PredictionWithMatch[]>([]);
    userRanking = signal<UserRanking | null>(null);
    isLoading = signal(true);
    errorMsg = signal<string | null>(null);

    totalPoints = computed(() => this.predictions().reduce((sum, p) => sum + p.points_earned, 0));
    exactPredictions = computed(() => this.predictions().filter(p => p.points_earned === 3).length);
    correctOutcomes = computed(() => this.predictions().filter(p => p.points_earned === 1).length);
    wrongPredictions = computed(() =>
        this.predictions().filter(p => p.match?.status === 'completed' && p.points_earned === 0).length
    );
    totalPredictions = computed(() => this.predictions().length);

    ngOnInit(): void {
        this.loadUserPredictions();
    }

    private async loadUserPredictions(): Promise<void> {
        const userId = this.route.snapshot.paramMap.get('userId');
        if (!userId) {
            this.errorMsg.set('Usuario no encontrado');
            this.isLoading.set(false);
            return;
        }

        try {
            // Fetch the user's ranking info (for username, avatar, rank) and predictions in parallel
            const [rankingResult, predictions] = await Promise.all([
                this.supabase.client
                    .from('user_rankings')
                    .select('*')
                    .eq('user_id', userId)
                    .single(),
                this.predictionsService.fetchPredictionsByUserId(userId),
            ]);

            if (rankingResult.error && rankingResult.error.code !== 'PGRST116') {
                throw rankingResult.error;
            }

            this.userRanking.set(rankingResult.data as UserRanking | null);
            this.predictions.set(predictions);
        } catch (err: any) {
            console.error('Error loading user predictions:', err);
            this.errorMsg.set('Error al cargar las predicciones');
        } finally {
            this.isLoading.set(false);
        }
    }

    getInitial(username: string | null | undefined): string {
        return username ? username.charAt(0).toUpperCase() : 'U';
    }
}
