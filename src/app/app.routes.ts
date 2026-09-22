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

// Importamos Modulo Seguimiento

// Importamos la clase oficial de tu primer subproceso refinado en la carpeta mp02
import { ContextoEstudianteComponent } from './features/dashboard/pages/MP02/contexto-estudiante/contexto-estudiante';
import { RegistroEvidenciasComponent } from './features/dashboard/pages/MP02/registro-evidencias/registro-evidencias';
import { EvaluacionProgresoComponent } from './features/dashboard/pages/MP02/evaluacion-progreso/evaluacion-progreso';
import { RetroalimentacionComponent } from './features/dashboard/pages/MP02/retroalimentacion/retroalimentacion';

// ==========================================
  // 1. RUTAS PÚBLICAS (Con diseño PublicLayout)
  // ==========================================


export const routes: Routes = [
  {
    path: '', // la parte de la URL que debe coincidir para activar una ruta
    component: PublicLayoutComponent, // Estructura visual para usuarios no logueados (Nav, Footer, etc.)
    children: [
      {
        path: 'home',
        component: HomeComponent 
      },
      {
        path: 'comunicados/detalle/:id',
        component: ComunicadoDetalle // Ver detalle de un comunicado usando su ID variable
      },
      {
        path: 'comunicados/historico',
        component: HistoricoComunicados // Historial de comunicados públicos
      },
      {
        path: 'comunicados',
        component: Comunicados // Lista general de comunicados públicos
      },
      {
        path: '',
        redirectTo: 'home', // Si entran a la raíz pura (ej: mysite.com), redirige a /home
        pathMatch: 'full'  // Coincidencia exacta de la URL vacía
      }
    ]
  },

  // ==========================================
  // 2. RUTA DE ACCESO (Sin Layout/Pantalla limpia)
  // ==========================================


    {
    path: 'login',
    component: LoginComponent
  },


  // ==========================================
  // 3. RUTAS PRIVADAS (Panel de Administración)
  // ==========================================


  {
    path: 'dashboard',
    component: DashboardLayoutComponent, // Estructura con menú lateral/barra administrativa
    children: [
      {
        path: '',
        children: [
          {
          path: 'comunicados',
          component: GestionComunicados // Panel principal para administrar comunicados
          },
          {
          path: 'comunicados/nuevo',
          component: CrearComunicado  // Formulario para crear un comunicado nuevo
          },
          {
          path: 'comunicados/revisar/:id',
          component: RevisarComunicado // Pantalla para revisar un comunicado específico vía ID
          },
          {
          path: 'comunicados/editar/:id',
          component: EditarComunicado // Formulario para editar un comunicado existente vía ID
          },
          {
          path: '',
          component: WelcomeDashboardComponent  // Vista por defecto al entrar a /dashboard
          },

          // Rutas para el Modulo de Seguimiento
          {
          // Registramos el camino para el subproceso P02.1 Contexto del Estudiante
          path: 'contexto-estudiante',
          component: ContextoEstudianteComponent
          },
          {
          // Registramos el camino para el subproceso P02.2 Registro de Evidencias
           path: 'registro-evidencias',
           component: RegistroEvidenciasComponent
          },
          {
           // Registramos el camino para el subproceso P02.3 Evaluación y Progreso
           path: 'evaluacion-progreso',
           component: EvaluacionProgresoComponent
          },
          {
           // Registramos el camino para el subproceso P02.4 Retroalimentación
           path: 'retroalimentacion',
           component: RetroalimentacionComponent
          }
        ]
      }
    ]
  },

 // ==========================================
  // 4. RUTA COMODÍN (Manejo de errores 404)
  // ==========================================


  {
    path: '**',
    redirectTo: 'home' // Cualquier URL inválida o que no exista redirigirá al Home automáticamente
  }
];
