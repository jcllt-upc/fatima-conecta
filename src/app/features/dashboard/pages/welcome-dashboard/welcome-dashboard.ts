// Importa las herramientas esenciales del núcleo de Angular: Component para definir el componente, signal para reactividad óptima 
// y OnInit para el ciclo de vida.
import { Component, signal, OnInit } from '@angular/core';
// Importa la directiva RouterLink desde el enrutador para permitir que las tarjetas del panel de bienvenida redirijan a los 
// subprocesos sin recargar el navegador.
import { RouterLink} from '@angular/router';

@Component({
   // Especifica el selector de etiqueta personalizado <app-welcome-dashboard> que Angular usará para identificar y renderizar esta pantalla interna.
  selector: 'app-welcome-dashboard',
  // Declara que el componente es autónomo(Standalone), dándole la capacidad de gestionar de forma directa e independiente sus propias importaciones.
  standalone: true,
  // Inyecta la directiva RouterLink de forma local, volviéndola disponible de inmediato para enlazar las tarjetas del archivo HTML con las
  // sub-rutas privadas.
  imports: [RouterLink],
  // Conecta este archivo lógico con su respectiva plantilla visual de HTML, donde se maquetarán las grillas de accesos rápidos por rol.
  templateUrl: './welcome-dashboard.html',
  // Vincula el componente con su hoja de estilos CSS dedicada para asegurar la correcta distribución visual y diseño estético del dashboard interno.
  styleUrl: './welcome-dashboard.css'
})
// Declara la clase WelcomeDashboardComponent implementando formalmente la interfaz 'OnInit' para forzar la declaración segura del ciclo de 
// vida del componente.
export class WelcomeDashboardComponent implements OnInit {

  /**
   * SIGNAL: Almacena de forma reactiva el rol del usuario que está visualizando la bienvenida.
   * Permite que la vista HTML renderice tarjetas informativas personalizadas.
   */
  // SIGNAL(Señal Reactiva): Variable protegida de lectura exclusiva(no se podra modificar) que aloja de forma dinámica el rol actual del usuario 
  // autenticado (ej: 'Docente').
  // Al nacer con un string vacío (''), Angular creará un canal de comunicación reactivo síncrono que repintará las tarjetas del HTML 
  // al instante cuando el valor mute.
  protected readonly currentRole = signal<string>('');

  /**
   * Ciclo de vida inicial: Recupera el rol de la sesión actual al cargar el componente.
   */
  // CICLO DE VIDA INICIAL: Método del núcleo que se ejecuta de forma automática en milisegundos en cuanto la pantalla de bienvenida se
  //                        carga en el navegador.
  public ngOnInit(): void {
    // Accede a la memoria interna física del navegador(localStorage) para extraer el texto del rol de sesión bajo la clave única 'user_role'.
    const roleSaved = localStorage.getItem('fc_user_rol');
    // CONTROL DE SEGURIDAD INTERNO: Evalúa si existe alguna credencial o cadena de texto de rol válida almacenada previamente en el disco local.
    if (roleSaved) {
      // Seteamos la señal de forma inmediata para activar la reactividad de la vista
      // FLUJO AUTORIZADO: Si el rol es detectado con éxito en la memoria, actualiza el estado de la señal reactiva utilizando el método de 
      // mutación estricto .set().
      // Esto gatilla instantáneamente el motor de plantillas en el HTML, compilando y dibujando únicamente las tarjetas correspondientes a 
      // ese perfil de usuario.
      this.currentRole.set(roleSaved);
      // MONITOR DE DESARROLLO: Expone en la consola técnica de inspección web el string del rol procesado, sirviendo como traza de depuración rápida.
      console.log('El Rol es : ' + roleSaved)
    }
  }
}
