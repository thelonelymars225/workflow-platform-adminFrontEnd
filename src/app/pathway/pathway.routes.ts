import { Routes } from '@angular/router';
import { PathwayShell } from './layout/pathway-shell/pathway-shell';

/** V3 Pathway screens, alongside the Atlas v2 routes. */
export const pathwayRoutes: Routes = [
  {
    path: 'sign-in',
    title: 'Welcome back · workFlow',
    loadComponent: () => import('./pages/pw-sign-in/pw-sign-in').then((m) => m.PwSignIn),
  },
  {
    path: '',
    component: PathwayShell,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Home · workFlow',
        loadComponent: () => import('./pages/pw-home/pw-home').then((m) => m.PwHome),
      },
      {
        path: 'jobs/:id/set-up',
        title: 'Set up · workFlow',
        loadComponent: () => import('./pages/pw-set-up/pw-set-up').then((m) => m.PwSetUp),
      },
      {
        path: 'jobs/:id/check',
        title: 'Check · workFlow',
        loadComponent: () => import('./pages/pw-check/pw-check').then((m) => m.PwCheck),
      },
      {
        path: 'jobs/:id/done',
        title: 'Done · workFlow',
        loadComponent: () => import('./pages/pw-done/pw-done').then((m) => m.PwDone),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
