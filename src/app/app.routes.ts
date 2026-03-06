import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { EcommerceComponent } from './pages/dashboard/ecommerce/ecommerce.component';
import { FicheComponent } from './pages/fiche/fiche.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AuthCallbackComponent } from './pages/auth-callback/auth-callback.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Page de login
  {
    path: 'signin',
    component: SignInComponent,
    title: 'Connexion | DevoRecruiter',
  },

  // Callback Google OAuth → reçoit le token
  {
    path: 'auth/callback',
    component: AuthCallbackComponent,
  },

  // Routes protégées
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ADMIN_RH + TALENT_ACQUISITION
      {
        path: '',
        component: EcommerceComponent,
        title: 'Tableau de bord',
      },
      // ADMIN_RH + TALENT_ACQUISITION
      {
        path: 'fiches',
        component: FicheComponent,
        title: 'Fiches de poste',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN_RH', 'TALENT_ACQUISITION'] },
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