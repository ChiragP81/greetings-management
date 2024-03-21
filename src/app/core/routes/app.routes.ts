import { Routes } from '@angular/router';
import { AuthGuard } from '@guards/auth.guard';
import { LoginGuard } from '@guards/login.guard';

export const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('@routes/auth.routes').then((m) => m.authRoutes),
    canMatch: [LoginGuard]
  },
  {
    path: '',
    loadComponent: () =>
      import('@pages/pages.component').then((m) => m.PagesComponent),
    canMatch: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/auth',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('@routes/admin.routes').then((m) => m.adminRoutes)
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
