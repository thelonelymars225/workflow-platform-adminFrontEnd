import { Routes } from '@angular/router';
import { WorkspaceShell } from './layout/workspace-shell';

export const routes: Routes = [
  {
    path: 'sign-in',
    title: 'Welcome back · workFlow',
    loadComponent: () => import('./features/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: '',
    component: WorkspaceShell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'start' },
      {
        path: 'start',
        title: 'Start here · workFlow',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'tasks',
        title: 'My tasks · workFlow',
        loadComponent: () => import('./features/tasks/task-list').then((m) => m.TaskList),
      },
      {
        path: 'tasks/:id/setup',
        title: 'Set up your task · workFlow',
        loadComponent: () => import('./features/tasks/task-setup').then((m) => m.TaskSetup),
      },
      {
        path: 'tasks/:id/review',
        title: 'Review your task · workFlow',
        loadComponent: () => import('./features/tasks/task-review').then((m) => m.TaskReview),
      },
      {
        path: 'tasks/:id/complete',
        title: 'Task complete · workFlow',
        loadComponent: () => import('./features/tasks/task-complete').then((m) => m.TaskComplete),
      },
      {
        path: 'connections',
        title: 'Connected apps · workFlow',
        loadComponent: () =>
          import('./features/connections/connections').then((m) => m.Connections),
      },
      {
        path: 'people',
        title: 'People · workFlow',
        loadComponent: () => import('./features/people/people').then((m) => m.People),
      },
      {
        path: 'settings',
        title: 'Settings · workFlow',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'workflows',
        title: 'Saved workflows · workFlow',
        loadComponent: () => import('./features/workflows/workflows').then((m) => m.Workflows),
      },
      {
        path: '**',
        title: 'Page not found · workFlow',
        loadComponent: () => import('./shared/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
