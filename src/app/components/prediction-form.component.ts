import {
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  MatchWithTeams,
  Prediction,
  PredictionInput,
} from '../models';
import { TeamFlagComponent } from './team-flag.component';

@Component({
    selector: 'app-prediction-form',
    standalone: true,
    imports: [FormsModule, TeamFlagComponent],
    template: `
        <div class="flex items-center justify-center gap-4">
            <!-- Home Team Score -->
            <div class="flex flex-col items-center gap-2">
                <app-team-flag
                    [flagUrl]="match().home_team.flag_url"
                    [teamName]="match().home_team.name"
                    [teamCode]="match().home_team.code"
                    size="lg"
                />
                <span class="text-sm font-medium text-gray-700">{{ match().home_team.code }}</span>
                <input
                    type="number"
                    [value]="homeScore()"
                    (input)="onHomeScoreChange($event)"
                    [disabled]="!canEdit()"
                    min="0"
                    max="20"
                    class="score-input"
                    [class.border-primary-500]="canEdit()"
                    [class.bg-gray-50]="!canEdit()"
                />
            </div>

            <!-- VS -->
            <div class="flex flex-col items-center">
                <span class="text-gray-400 text-sm font-medium">VS</span>
                @if (hasChanges()) {
                    <button
                        (click)="savePrediction()"
                        [disabled]="isSaving()"
                        class="mt-2 px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        @if (isSaving()) {
                            <svg
                                class="animate-spin h-3.5 w-3.5"
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
                                />
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Guardando...
                        } @else {
                            Guardar
                        }
                    </button>
                }
            </div>

            <!-- Away Team Score -->
            <div class="flex flex-col items-center gap-2">
                <app-team-flag
                    [flagUrl]="match().away_team.flag_url"
                    [teamName]="match().away_team.name"
                    [teamCode]="match().away_team.code"
                    size="lg"
                />
                <span class="text-sm font-medium text-gray-700">{{ match().away_team.code }}</span>
                <input
                    type="number"
                    [value]="awayScore()"
                    (input)="onAwayScoreChange($event)"
                    [disabled]="!canEdit()"
                    min="0"
                    max="20"
                    class="score-input"
                    [class.border-primary-500]="canEdit()"
                    [class.bg-gray-50]="!canEdit()"
                />
            </div>
        </div>

        @if (!canEdit() && prediction()) {
            <div class="mt-3 text-center">
                <span class="text-xs text-gray-500">Tu predicción: </span>
                <span class="text-sm font-semibold">
                    {{ prediction()!.predicted_home_score }} - {{ prediction()!.predicted_away_score }}
                </span>
            </div>
        }
    `,
})
export class PredictionFormComponent {
    // Signal inputs
    match = input.required<MatchWithTeams>();
    prediction = input<Prediction | null>(null);
    canEdit = input<boolean>(true);

    // Signal output
    save = output<PredictionInput>();

    // Internal state — linked to prediction input, locally mutable
    homeScore = linkedSignal<Prediction | null, number>({
        source: this.prediction,
        computation: (pred) => pred?.predicted_home_score ?? 0,
    });
    awayScore = linkedSignal<Prediction | null, number>({
        source: this.prediction,
        computation: (pred) => pred?.predicted_away_score ?? 0,
    });
    isSaving = linkedSignal<Prediction | null, boolean>({
        source: this.prediction,
        computation: () => false,
    });

    // Track if values have been modified from the original prediction
    hasChanges = computed(() => {
        const pred = this.prediction();
        if (!pred) {
            // No existing prediction - show save if scores are set
            return true;
        }
        // Has existing prediction - show save only if changed
        return this.homeScore() !== pred.predicted_home_score || this.awayScore() !== pred.predicted_away_score;
    });

    onHomeScoreChange(event: Event): void {
        const value = Number.parseInt((event.target as HTMLInputElement).value, 10);
        this.homeScore.set(Number.isNaN(value) ? 0 : Math.max(0, Math.min(20, value)));
    }

    onAwayScoreChange(event: Event): void {
        const value = Number.parseInt((event.target as HTMLInputElement).value, 10);
        this.awayScore.set(Number.isNaN(value) ? 0 : Math.max(0, Math.min(20, value)));
    }

    savePrediction(): void {
        this.isSaving.set(true);
        this.save.emit({
            match_id: this.match().id,
            predicted_home_score: this.homeScore(),
            predicted_away_score: this.awayScore(),
        });
        // Note: The parent updates the prediction input, which triggers linkedSignal
        // to re-derive local state, automatically hiding the save button
    }
}
