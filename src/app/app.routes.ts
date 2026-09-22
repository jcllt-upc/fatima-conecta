import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout';
import { CierreActividad } from './features/dashboard/pages/MP04/cierre-actividad/cierre-actividad';
import { CrearActividad } from './features/dashboard/pages/MP04/crear-actividad/crear-actividad';
import { EditarActividad } from './features/dashboard/pages/MP04/editar-actividad/editar-actividad';
import { GestionActividades } from './features/dashboard/pages/MP04/gestion-actividades/gestion-actividades';
import { RevisarActividad } from './features/dashboard/pages/MP04/revisar-actividad/revisar-actividad';
import { SeguimientoActividad } from './features/dashboard/pages/MP04/seguimiento-actividad/seguimiento-actividad';
import { WelcomeDashboardComponent } from './features/dashboard/pages/welcome-dashboard/welcome-dashboard';
import { HomeComponent } from './features/public/pages/home/home';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout';


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

      // MP04 - Gestión de Actividades
      {
        path: 'actividades',
        component: GestionActividades
      },
      {
        path: 'actividades/crear',
        component: CrearActividad
      },
      {
        path: 'actividades/revisar/:id',
        component: RevisarActividad
      },
      {
        path: 'actividades/editar/:id',
        component: EditarActividad
      },
      {
        path: 'actividades/seguimiento/:id',
        component: SeguimientoActividad
      },
      {
        path: 'actividades/cierre/:id',
        component: CierreActividad
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'home'
  }
];