import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './features/public/public-layout/public-layout';
// Importamos el componente de la página de inicio que acabas de crear
import { HomeComponent } from './features/public/pages/home/home';
// Importamos la clase de tu nuevo componente de inicio de sesión
import { LoginComponent } from './features/auth/pages/login/login.component';
// Importamos tu nuevo contenedor maestro de entorno privado
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout';
// Importamos la nueva página de bienvenida del entorno privado
import { WelcomeDashboardComponent } from './features/dashboard/pages/welcome-dashboard/welcome-dashboard';
// Importamos la clase oficial de tu primer subproceso refinado en la carpeta mp02
import { ContextoEstudianteComponent } from './features/dashboard/pages/mp02/contexto-estudiante/contexto-estudiante';
// Importamos la clase oficial de tu segundo subproceso multimedia
import { RegistroEvidenciasComponent } from './features/dashboard/pages/mp02/registro-evidencias/registro-evidencias';
// Importamos la clase oficial de tu tercer subproceso cualitativo
import { EvaluacionProgresoComponent } from './features/dashboard/pages/mp02/evaluacion-progreso/evaluacion-progreso';
// Importamos la clase oficial de tu cuarto subproceso de compromisos cualitativos
import { RetroalimentacionComponent } from './features/dashboard/pages/mp02/retroalimentacion/retroalimentacion';
// Importamos la clase oficial de tu quinto y último subproceso de consulta
import { ConsultaProgresoComponent } from './features/dashboard/pages/mp02/consulta-progreso/consulta-progreso';
// 🟢 IMPORTACIÓN DEL NUEVO COMPONENTE MANTENEDOR (CRUD DEL ESTUDIANTE)
// Nota: Una vez ejecutes el comando de creación del componente, esta ruta quedará 100% activa
import { MantenimientoEstudianteComponent } from './features/dashboard/pages/mantenimiento/mantenimiento-estudiante/mantenimiento-estudiante';


/**
 * Matriz de configuración de rutas principales para el ecosistema "Fátima Conecta".
 * Define las reglas de enrutamiento y la carga de componentes según la URL del navegador.
 */
export const routes: Routes = [
  {
    // Cuando la URL esté en la raíz o en un camino público, carga el Layout Maestro
    path: '',
    component: PublicLayoutComponent,
    // La matriz 'children' define las páginas que se inyectarán dentro del <router-outlet> del Layout
    children: [
      {
        // Vinculamos el camino 'home' con tu nuevo componente de la página de inicio
        path: 'home',
        component: HomeComponent
      },
      {
        // Si el usuario entra a la raíz vacía, redirige de forma interna a '/home'
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    // RUTA INDEPENDIENTE (Lienzo Limpio): Carga el Login de borde a borde en la pantalla
    // Al estar fuera de PublicLayoutComponent, el menú y el pie de página públicos desaparecen por completo
    path: 'login',
    component: LoginComponent
  },
  {
    // RUTA COMPUESTA (Layout Privado): Centraliza los paneles de control del ecosistema
    // Al estar fuera de PublicLayoutComponent, el menú y footer públicos desaparecen por completo
    path: 'dashboard',
    component: DashboardLayoutComponent,
    // La matriz 'children' alojará las páginas internas de los subprocesos específicos
    children: [
      {
        // Por el momento la raíz de dashboard la dejamos vacía o lista para recibir
        // la primera pantalla interna del Profesor que crearemos a continuación
        path: '',
        children: 
        [
          {
          // Cuando la URL sea exactamente '/dashboard', inyecta la página de bienvenida en el centro
          path: '',
          component: WelcomeDashboardComponent
          },
         /* ==========================================================================
            MÓDULO DE GESTIÓN ACADÉMICA Y SEGUIMIENTO (TU ALCANCE EXCLUSIVO MP02)
           ========================================================================== */
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
          },
          {
           // Registramos el camino para el subproceso P02.5 Consulta del Progreso
           path: 'consulta-progreso',
            component: ConsultaProgresoComponent
          },
          /* ==========================================================================
             MÓDULO DE MANTENIMIENTO CORPORATIVO (EXCLUSIVO PARA EL ROL DIRECTOR)
             ========================================================================== */
          {
            path: 'mantenimiento-estudiantes',
            component: MantenimientoEstudianteComponent
          }
        ]
      }
    ]
  },
  {
    // Ruta comodín (Wildcard): se activa si el usuario escribe una URL manual que no existe
    path: '**',
    redirectTo: 'home'
  }
];
