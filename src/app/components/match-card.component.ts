import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { MatchWithTeams, Prediction, PredictionInput } from '../models';
import { PredictionFormComponent } from './prediction-form.component';
import { TeamFlagComponent } from './team-flag.component';

type MatchDisplayStatus = 'upcoming' | 'in_progress' | 'completed' | 'pending_result';

@Component({
    selector: 'app-match-card',
    standalone: true,
    imports: [DatePipe, TeamFlagComponent, PredictionFormComponent],
    template: `
        <div
            class="card-hover p-4"
            [class.border-l-4]="true"
            [class.border-l-green-500]="hasPrediction()"
            [class.border-l-yellow-500]="!hasPrediction() && canPredict()"
            [class.border-l-gray-300]="!hasPrediction() && !canPredict()"
        >
            <!-- Match Header -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                    <span class="badge badge-info">Grupo {{ match().group_letter }}</span>
                    @switch (displayStatus()) {
                        @case ('completed') {
                            <span class="badge badge-success">Finalizado</span>
                        }
                        @case ('in_progress') {
                            <span class="badge badge-warning animate-pulse-slow">En Vivo</span>
                        }
                        @case ('pending_result') {
                            <span class="badge bg-gray-200 text-gray-600">Sin Resultado</span>
                        }
                        @case ('upcoming') {
                            <span class="badge bg-blue-100 text-blue-700">Próximamente</span>
                        }
                    }
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-700">
                        {{ match().match_date | date: 'd MMM, yyyy' }}
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ match().match_date | date: 'HH:mm' }}
                    </p>
                </div>
            </div>

            <!-- Match Teams -->
            <div class="flex items-center justify-between mb-4">
                <!-- Home Team -->
                <div class="flex-1 flex items-center gap-3">
                    <app-team-flag
                        [flagUrl]="match().home_team.flag_url"
                        [teamName]="match().home_team.name"
                        [teamCode]="match().home_team.code"
                        size="lg"
                    />
                    <div>
                        <p class="font-semibold text-gray-900">{{ match().home_team.name }}</p>
                        <p class="text-xs text-gray-500">{{ match().home_team.code }}</p>
                    </div>
                </div>

                <!-- Score / VS -->
                <div class="px-4 text-center">
                    @if (hasResult()) {
                        <div class="flex items-center gap-2">
                            <span class="text-3xl font-bold text-gray-900">{{ match().home_score }}</span>
                            <span class="text-gray-400">-</span>
                            <span class="text-3xl font-bold text-gray-900">{{ match().away_score }}</span>
                        </div>
                    } @else {
                        <span class="text-lg font-medium text-gray-400">VS</span>
                    }
                </div>

                <!-- Away Team -->
                <div class="flex-1 flex items-center justify-end gap-3">
                    <div class="text-right">
                        <p class="font-semibold text-gray-900">{{ match().away_team.name }}</p>
                        <p class="text-xs text-gray-500">{{ match().away_team.code }}</p>
                    </div>
                    <app-team-flag
                        [flagUrl]="match().away_team.flag_url"
                        [teamName]="match().away_team.name"
                        [teamCode]="match().away_team.code"
                        size="lg"
                    />
                </div>
            </div>

            <!-- Venue -->
            @if (match().venue) {
                <div class="text-center text-xs text-gray-500 mb-4">
                    <svg class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    {{ match().venue }}, {{ match().city }}
                </div>
            }

            <!-- Prediction Section -->
            @if (showPrediction()) {
                <div class="border-t pt-4 mt-4">
                    <h4 class="text-sm font-medium text-gray-700 text-center mb-3">
                        @if (canPredict()) {
                            Tu Predicción
                        } @else if (hasPrediction()) {
                            Tu Predicción (Bloqueada)
                        } @else {
                            Sin Predicción
                        }
                    </h4>

                    @if (canPredict() || hasPrediction()) {
                        <app-prediction-form
                            [match]="match()"
                            [prediction]="prediction()"
                            [canEdit]="canPredict()"
                            (save)="onSavePrediction($event)"
                        />
                    }

                    <!-- Points earned -->
                    @if (displayStatus() === 'completed' && hasPrediction()) {
                        <div class="mt-4 text-center">
                            <div
                                class="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                                [class.bg-green-100]="prediction()!.points_earned > 0"
                                [class.bg-red-100]="prediction()!.points_earned === 0"
                            >
                                @if (prediction()!.points_earned === 3) {
                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <span class="font-semibold text-green-700">¡Exacto! +3 puntos</span>
                                } @else if (prediction()!.points_earned === 1) {
                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <span class="font-semibold text-green-700">¡Resultado correcto! +1 punto</span>
                                } @else {
                                    <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clip-rule="evenodd"
                                        />
                                    </svg>
                                    <span class="font-semibold text-red-700">Predicción incorrecta</span>
                                }
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    `,
})
export class MatchCardComponent {
    // Signal inputs
    match = input.required<MatchWithTeams>();
    prediction = input<Prediction | null>(null);
    canPredict = input<boolean>(true);
    showPrediction = input<boolean>(true);

    // Signal output
    savePrediction = output<PredictionInput>();

    // Computed
    hasPrediction = computed(() => this.prediction() !== null);
    
    hasResult = computed(() => {
        const m = this.match();
        return m.home_score !== null && m.away_score !== null;
    });

    displayStatus = computed((): MatchDisplayStatus => {
        const m = this.match();
        const now = new Date();
        const matchDate = new Date(m.match_date);
        
        // If status is explicitly set to completed or in_progress, use that
        if (m.status === 'completed') return 'completed';
        if (m.status === 'in_progress') return 'in_progress';
        
        // If we have scores, it's completed
        if (m.home_score !== null && m.away_score !== null) return 'completed';
        
        // If match date is in the future, it's upcoming
        if (matchDate > now) return 'upcoming';
        
        // Match date has passed but no result yet
        return 'pending_result';
    });

    onSavePrediction(input: PredictionInput): void {
        this.savePrediction.emit(input);
    }
}
