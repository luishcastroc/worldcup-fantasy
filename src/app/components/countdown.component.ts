import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

@Component({
    selector: 'app-countdown',
    standalone: true,
    imports: [DatePipe],
    template: `
        <div class="bg-linear-to-r from-fifa-dark to-primary-900 text-white rounded-xl p-4 sm:p-6">
            <div class="text-center">
                <h3 class="text-sm sm:text-base font-medium text-fifa-gold mb-2">
                    {{ title() }}
                </h3>

                @if (isExpired()) {
                    <p class="text-lg font-semibold text-red-400">Deadline has passed!</p>
                } @else {
                    <div class="flex justify-center gap-2 sm:gap-4">
                        @for (unit of timeUnits(); track unit.label) {
                            <div class="flex flex-col items-center">
                                <div
                                    class="bg-white/10 backdrop-blur rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-15 sm:min-w-20"
                                >
                                    <span class="text-2xl sm:text-4xl font-bold">{{ unit.value }}</span>
                                </div>
                                <span class="text-xs sm:text-sm text-gray-300 mt-1">{{ unit.label }}</span>
                            </div>
                        }
                    </div>

                    <p class="text-xs text-gray-400 mt-3">Deadline: {{ deadline() | date: 'MMM d, yyyy h:mm a' }}</p>
                }
            </div>
        </div>
    `,
})
export class CountdownComponent implements OnInit, OnDestroy {
    // Signal inputs
    deadline = input.required<Date>();
    title = input<string>('Prediction Deadline');

    private intervalId: ReturnType<typeof setInterval> | null = null;

    days = signal(0);
    hours = signal(0);
    minutes = signal(0);
    seconds = signal(0);
    isExpired = signal(false);

    timeUnits = computed(() => [
        { value: this.pad(this.days()), label: 'Days' },
        { value: this.pad(this.hours()), label: 'Hours' },
        { value: this.pad(this.minutes()), label: 'Minutes' },
        { value: this.pad(this.seconds()), label: 'Seconds' },
    ]);

    ngOnInit(): void {
        this.updateCountdown();
        this.intervalId = setInterval(() => this.updateCountdown(), 1000);
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private updateCountdown(): void {
        const now = Date.now();
        const target = this.deadline().getTime();
        const diff = target - now;

        if (diff <= 0) {
            this.isExpired.set(true);
            this.days.set(0);
            this.hours.set(0);
            this.minutes.set(0);
            this.seconds.set(0);
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }
            return;
        }

        this.days.set(Math.floor(diff / (1000 * 60 * 60 * 24)));
        this.hours.set(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        this.minutes.set(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
        this.seconds.set(Math.floor((diff % (1000 * 60)) / 1000));
    }

    private pad(value: number): string {
        return value.toString().padStart(2, '0');
    }
}
