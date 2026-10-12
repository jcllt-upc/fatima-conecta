// @Component: Metadato esencial de Angular que transforma una clase TypeScript común en un componente visual autónomo con ciclo de vida propio.
//             En la arquitectura moderna 'Standalone', centraliza la inyección de sus propios estilos, plantillas HTML y dependencias sin usar módulos rígidos.
//             Define el selector de etiqueta HTML personalizado con el que el framework identificará y dibujará el lienzo en el navegador web del usuario.
// signal: Patrón moderno de reactividad granular que almacena un estado en memoria y notifica sus cambios de forma síncrona y directa a la interfaz.
//         Elimina la necesidad de usar costosos ciclos globales de detección de cambios en todo el árbol de Angular, optimizando el consumo de RAM.
//         Permite que la vista HTML mute instantáneamente (ej: repintar el menú por rol) al invocar su valor o actualizarlo con el método .set().
// OnInit: Interfaz del core de Angular que obliga a la clase a implementar de forma estricta y segura el método del ciclo de vida 'ngOnInit()'.
//         Se ejecuta automáticamente en milisegundos inmediatamente después de que el componente es inicializado y las propiedades de entrada son procesadas.
//         Es el punto técnico idóneo para realizar tareas críticas de arranque, tales como auditorías de seguridad, lectura de tokens o llamadas asíncronas.
import { Component, signal, OnInit,inject } from '@angular/core';
// Importa las utilidades del enrutador de Angular: RouterOutlet para inyectar subpáginas, RouterLink para enlaces, 
// Router para redirecciones por código y RouterLinkActive para detectar menús activos.
// RouterOutlet: Directiva que actúa como un contenedor dinámico e intercambiable dentro de la estructura visual del componente padre.
//               Funciona como un portal o marcador de posición donde el enrutador de Angular inyecta de forma física el componente hijo correspondiente a la sub-ruta activa.
//               Permite implementar la arquitectura por capas(Layouts), manteniendo fijos elementos como menús laterales mientras se intercambian las pantallas internas.
import { RouterOutlet, RouterLink, Router,RouterLinkActive } from '@angular/router';
// 1. IMPORTACIÓN MANDATORIA: Traemos tu servicio de autenticación central de AWS
import { AuthService } from '../../../core/services/auth/auth.service';



@Component({
  // Define la etiqueta HTML personalizada <app-dashboard-layout> con la que Angular identificará y renderizará este contenedor maestro.
  selector: 'app-dashboard-layout',
  // Declara que es un componente autónomo(Standalone), eliminando la necesidad de registrarlo en un módulo rígido de Angular clásico.
  standalone: true,
  // Importamos RouterOutlet para inyectar las páginas hijas en el centro
  // Importamos RouterLink para permitir dar clic en las opciones del menú lateral
  // Registra las directivas de enrutamiento importadas para que el archivo HTML entienda el intercambio de pantallas, redirecciones 
  // y estilos visuales en el menú.
  imports: [RouterOutlet, RouterLink,RouterLinkActive],
  // Enlaza la lógica de esta clase con su archivo de estilos específico para asegurar la correcta maquetación estética de la intranet.
  styleUrl: './dashboard-layout.css',
  // Acopla este archivo con su respectiva plantilla visual HTML donde se encuentra estructurado el panel de control y el menú lateral dinámico.
  templateUrl: './dashboard-layout.html',
})
// Declara la clase del layout implementando formalmente la interfaz 'OnInit' para obligar al componente a usar el método de arranque 
// seguro ngOnInit.
export class DashboardLayoutComponent implements OnInit {

   // INYECCIÓN DE DEPENDENCIAS MODERNA (EVITA EL USO DE CONSTRUCTORES ACOPLADOS)
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * SIGNAL REACTIVO DEL ROL: Almacena el Rol del usuario logueado en este instante.
   * Nace en vacío (null) y se pintará de forma quirúrgica en el HTML gracias a las directivas @if.
   */
  protected readonly currentUserRole = signal<string | null>(null);

  /**
   * CICLO DE VIDA INICIAL (OnInit): Se ejecuta automáticamente al cargar el Dashboard Privado.
   * Reemplaza de raíz la vieja variable 'user_role' por la variable oficial del servidor 'fc_user_rol'.
   */
  public ngOnInit(): void {
    // CORREGIDO: Leemos la variable unificada de AWS RDS guardada durante el inicio de sesión
    const roleSaved = localStorage.getItem('fc_user_rol');

    if (roleSaved) {
      // Si el rol existe físicamente en el Local Storage, actualizamos la señal reactiva
      // Esto gatillará que el menú lateral dibuje los accesos específicos correspondientes
      this.currentUserRole.set(roleSaved);
    } else {
      // ALERTA DE SEGURIDAD (HU08): Si un usuario intenta saltarse la seguridad del Login
      // escribiendo la URL '/dashboard' a mano en la barra del navegador, lo rebotamos de inmediato.
      this.logout();
    }
  }

  /**
   * MÉTODO DE CIERRE DE SESIÓN CORREGIDO (ESTÁNDAR DE ALTA CIBERSEGURIDAD):
   * Invoca al método global de tu AuthService. Borra masivamente los tokens dinámicos de Amazon,
   * el ID de usuario de RDS, el rol y barrea por completo los contextos congelados del MP02,
   * reduciendo a cero el riesgo de secuestro de sesión (Session Hijacking).
   */
  protected logout(): void {
    // 1. Ejecuta el barrido atómico de variables en el Local Storage y resetea los Signals globales
    this.authService.cerrarSesion();
  }
 
}
