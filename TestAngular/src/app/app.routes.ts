import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./auth/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        canActivate: [guestGuard],
        loadComponent: () =>
            import('./auth/registro/registro').then(m => m.Registro)
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./layout/authenticated-layout').then(m => m.AuthenticatedLayout),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'home' },
            {
                path: 'home',
                loadComponent: () => import('./home/home').then(m => m.Home)
            },
            {
                path: 'dashboardA',
                loadComponent: () => import('./dashboard-a/dashboard-a').then(m => m.DashboardA)
            },
            {
                path: 'dashboardB',
                loadComponent: () => import('./dashboard-b/dashboard-b').then(m => m.DashboardB)
            },
            {
                path: 'dashboardC',
                canActivate: [roleGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./dashboard-c/dashboard-c').then(m => m.DashboardC)
            }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
