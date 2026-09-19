import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout';
import { HomeComponent } from './features/public/pages/home/home';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout';
import { WelcomeDashboardComponent } from './features/dashboard/pages/welcome-dashboard/welcome-dashboard';
import { Comunicados } from './features/public/pages/MP01/comunicados/comunicados';
import { ComunicadoDetalle } from './features/public/pages/MP01/comunicado-detalle/comunicado-detalle';
import { HistoricoComunicados } from './features/public/pages/MP01/historico-comunicados/historico-comunicados';
import { GestionComunicados } from './features/dashboard/pages/MP01/gestion-comunicados/gestion-comunicados';
import { CrearComunicado } from './features/dashboard/pages/MP01/crear-comunicado/crear-comunicado';
import { RevisarComunicado } from './features/dashboard/pages/MP01/revisar-comunicado/revisar-comunicado';
import { EditarComunicado } from './features/dashboard/pages/MP01/editar-comunicado/editar-comunicado';

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
        path: 'comunicados/detalle/:id',
        component: ComunicadoDetalle
      },
      {
        path: 'comunicados/historico',
        component: HistoricoComunicados
      },
      {
        path: 'comunicados',
        component: Comunicados
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
        children: [
          {
          path: 'comunicados',
          component: GestionComunicados
          },
          {
          path: 'comunicados/nuevo',
          component: CrearComunicado
          },
          {
          path: 'comunicados/revisar/:id',
          component: RevisarComunicado
          },
          {
          path: 'comunicados/editar/:id',
          component: EditarComunicado
          },
          {
          path: '',
          component: WelcomeDashboardComponent
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
