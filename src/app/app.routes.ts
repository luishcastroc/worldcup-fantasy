import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'matches',
        pathMatch: 'full',
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/login.page').then(m => m.LoginPageComponent),
    },
    {
        path: 'auth/callback',
        loadComponent: () => import('./pages/auth/callback.page').then(m => m.AuthCallbackPageComponent),
    },
    {
        path: 'matches',
        loadComponent: () => import('./pages/matches.page').then(m => m.MatchesPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'my-predictions',
        loadComponent: () => import('./pages/my-predictions.page').then(m => m.MyPredictionsPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'results',
        loadComponent: () => import('./pages/results.page').then(m => m.ResultsPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'rankings',
        loadComponent: () => import('./pages/rankings.page').then(m => m.RankingsPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'user/:userId/predictions',
        loadComponent: () => import('./pages/user-predictions.page').then(m => m.UserPredictionsPageComponent),
        canActivate: [authGuard],
    },
    {
        path: 'profile',
        loadComponent: () => import('./pages/profile.page').then(m => m.ProfilePageComponent),
        canActivate: [authGuard],
    },
    {
        path: '**',
        redirectTo: 'matches',
    },
];
