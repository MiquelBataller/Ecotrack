import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/llista/llista.component').then(m => m.LlistaComponent)
  },
  {
    path: 'afegir',
    loadComponent: () => import('./pages/formulari/formulari.component').then(m => m.FormulariComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./pages/formulari/formulari.component').then(m => m.FormulariComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];