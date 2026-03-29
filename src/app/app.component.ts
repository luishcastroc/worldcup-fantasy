import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    template: `
        <div class="h-screen flex flex-col overflow-hidden">
            <app-navbar class="flex-shrink-0" />
            <main class="flex-1 overflow-y-auto">
                <router-outlet />
            </main>
            <footer class="flex-shrink-0 bg-fifa-dark text-white py-4">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-gray-400 text-sm">Quiniela Mundial 2026 - ¡Predice y Gana!</p>
                    <p class="text-xs text-gray-500 mt-1">
                        No afiliado con FIFA. Si pierdes, no nos eches la culpa... nosotros también perdimos 🤷‍♂️⚽
                    </p>
                </div>
            </footer>
        </div>
    `,
})
export class AppComponent {}
