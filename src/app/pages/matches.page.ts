import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CountdownComponent } from '../components/countdown.component';
import { MatchCardComponent } from '../components/match-card.component';
import {
  Prediction,
  PredictionInput,
} from '../models';
import { MatchesService } from '../services/matches.service';
import { PredictionsService } from '../services/predictions.service';

@Component({
    selector: 'app-matches-page',
    standalone: true,
    imports: [MatchCardComponent, CountdownComponent],
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Partidos Fase de Grupos</h1>
                <p class="text-gray-600">Haz tus predicciones para los 72 partidos de la fase de grupos</p>
            </div>

            <!-- Countdown -->
            @if (predictionsService.isPredictionOpen()) {
                <div class="mb-6">
                    <app-countdown
                        [deadline]="predictionsService.deadlineDate()"
                        title="Tiempo restante para hacer tus predicciones"
                    />
                </div>
            } @else {
                <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p class="text-red-700 font-medium">
                        La fecha límite para predicciones ha pasado. Ya no puedes hacer o editar predicciones.
                    </p>
                </div>
            }

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="card p-4 text-center">
                    <p class="text-2xl font-bold text-primary-600">{{ totalMatches() }}</p>
                    <p class="text-sm text-gray-500">Total Partidos</p>
                </div>
                <div class="card p-4 text-center">
                    <p class="text-2xl font-bold text-green-600">{{ predictedCount() }}</p>
                    <p class="text-sm text-gray-500">Predichos</p>
                </div>
                <div class="card p-4 text-center">
                    <p class="text-2xl font-bold text-yellow-600">{{ pendingCount() }}</p>
                    <p class="text-sm text-gray-500">Pendientes</p>
                </div>
                <div class="card p-4 text-center">
                    <p class="text-2xl font-bold text-gray-600">{{ completedCount() }}</p>
                    <p class="text-sm text-gray-500">Jugados</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-2 mb-6">
                <button
                    (click)="selectedGroup.set(null)"
                    [class]="selectedGroup() === null ? 'btn-primary' : 'btn-secondary'"
                    class="!py-2 !px-4 text-sm"
                >
                    Todos los Grupos
                </button>
                @for (group of groups(); track group) {
                    <button
                        (click)="selectedGroup.set(group)"
                        [class]="selectedGroup() === group ? 'btn-primary' : 'btn-secondary'"
                        class="!py-2 !px-4 text-sm"
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
                <!-- Matches Grid -->
                <div class="grid gap-4 md:grid-cols-2">
                    @for (match of filteredMatches(); track match.id) {
                        <app-match-card
                            [match]="match"
                            [prediction]="getPrediction(match.id)"
                            [canPredict]="predictionsService.isPredictionOpen()"
                            [showPrediction]="true"
                            (savePrediction)="onSavePrediction($event)"
                        />
                    } @empty {
                        <div class="col-span-2 text-center py-12">
                            <p class="text-gray-500">No se encontraron partidos para el filtro seleccionado.</p>
                        </div>
                    }
                </div>
            }
        </div>
    `,
})
export class MatchesPageComponent {
    matchesService = inject(MatchesService);
    predictionsService = inject(PredictionsService);

    selectedGroup = signal<string | null>(null);

    groups = computed(() => this.matchesService.getGroupLetters());

    filteredMatches = computed(() => {
        const group = this.selectedGroup();
        const matches = this.matchesService.matches();
        if (!group) return matches;
        return matches.filter(m => m.group_letter === group);
    });

    totalMatches = computed(() => this.matchesService.matches().length);

    predictedCount = computed(() => {
        const map = this.predictionsService.predictionsMap();
        return this.matchesService.matches().filter(m => map.has(m.id)).length;
    });

    pendingCount = computed(() => {
        const map = this.predictionsService.predictionsMap();
        return this.matchesService.matches().filter(m => !map.has(m.id) && m.status === 'scheduled')
            .length;
    });

    completedCount = computed(() => {
        return this.matchesService.matches().filter(m => m.status === 'completed').length;
    });

    getPrediction(matchId: number): Prediction | null {
        return this.predictionsService.predictionsMap().get(matchId) || null;
    }

    async onSavePrediction(input: PredictionInput): Promise<void> {
        await this.predictionsService.savePrediction(input);
        // Resources reload automatically via reloadTrigger in the service
    }
}
