import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout';
import { HomeComponent } from './features/public/pages/home/home';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout';
import { WelcomeDashboardComponent } from './features/dashboard/pages/welcome-dashboard/welcome-dashboard';
import { RepositorioComponent } from './features/dashboard/pages/repositorio/repositorio.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: WelcomeDashboardComponent
      },
      {
        path: 'repositorio',
        component: RepositorioComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];