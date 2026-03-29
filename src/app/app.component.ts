import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    template: `
        <div class="min-h-screen flex flex-col">
            <app-navbar />
            <main class="flex-1">
                <router-outlet />
            </main>
            <footer class="bg-fifa-dark text-white py-6">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-gray-400">Quiniela Mundial 2026 - ¡Predice y Gana!</p>
                    <p class="text-sm text-gray-500 mt-2">
                        No afiliado con FIFA. Si pierdes, no nos eches la culpa... nosotros también perdimos 🤷‍♂️⚽
                    </p>
                </div>
            </footer>
        </div>
    `,
})
export class AppComponent {}
