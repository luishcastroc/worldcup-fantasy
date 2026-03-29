import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-page',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    template: `
        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-1">Administración</h1>
                <p class="text-gray-600">Gestiona usuarios y códigos de invitación</p>
            </div>

            <!-- Tab navigation -->
            <div class="flex gap-1 mb-6 border-b border-gray-200">
                <a
                    routerLink="users"
                    routerLinkActive="border-b-2 border-primary-600 text-primary-600 font-medium"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors -mb-px"
                >
                    Usuarios
                </a>
                <a
                    routerLink="invites"
                    routerLinkActive="border-b-2 border-primary-600 text-primary-600 font-medium"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors -mb-px"
                >
                    Invitaciones
                </a>
            </div>

            <router-outlet />
        </div>
    `,
})
export class AdminPageComponent {}
