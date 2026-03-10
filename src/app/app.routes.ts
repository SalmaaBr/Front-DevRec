import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { FicheComponent } from './pages/fiche/fiche.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import {UsersComponent} from './pages/users/users.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import {AssistanceComponent} from './pages/assistance/assistance.component'

export const routes: Routes = [
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Connexion',
  },

  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },

  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: EcommerceComponent,
        title: 'Tableau de bord',
      },
      {
        path: 'fiches',
        component: FicheComponent,
        title: 'Fiches de poste',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_RH', 'TALENT_ACQUISITION'] },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN_RH'] },
        title: 'Utilisateurs',
      },
      {
        path: 'assistance',
        component: AssistanceComponent,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN_RH', 'CONSULTANT'] },
        title: 'Assistance',
      },
    ],
  },

  // 404
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 | DevoRecruiter',
  },
];