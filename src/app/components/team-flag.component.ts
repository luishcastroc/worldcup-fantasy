import {
  Component,
  input,
} from '@angular/core';

@Component({
    selector: 'app-team-flag',
    standalone: true,
    template: `
        @if (flagUrl()) {
            <img
                [src]="flagUrl()"
                [alt]="teamName() + ' flag'"
                [class]="sizeClass()"
                class="object-cover rounded shadow-sm"
                loading="lazy"
            />
        } @else {
            <div
                [class]="sizeClass()"
                class="bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs font-medium"
            >
                {{ teamCode() }}
            </div>
        }
    `,
})
export class TeamFlagComponent {
    flagUrl = input<string | null>(null);
    teamName = input<string>('');
    teamCode = input<string>('');
    size = input<'sm' | 'md' | 'lg'>('md');

    sizeClass = () => {
        switch (this.size()) {
            case 'sm':
                return 'w-6 h-4';
            case 'lg':
                return 'w-12 h-8';
            default:
                return 'w-8 h-6';
        }
    };
}
