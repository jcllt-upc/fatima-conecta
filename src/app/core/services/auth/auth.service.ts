// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: MOTOR INTERACTIVO DE CONECTIVIDAD CLOUD Y OPERADORES REACTIVOS
// =====================================================================================================================

// Injectable: Decorador imperativo que le avisa a Angular que esta clase puede ser inyectada en cualquier componente.
// inject: Mecanismo moderno para adquirir dependencias globales sin sobrecargar el constructor de la clase.
// signal: Primitiva nativa que almacena de forma reactiva el rol del usuario en la memoria RAM del navegador.
import { Injectable, inject, signal } from '@angular/core';
// HttpClient: Cliente HTTP robusto basado en XMLHttpRequest encargado de estructurar y emitir peticiones por internet.
// HttpClient es el motor oficial para disparar peticiones REST asíncronas por internet
import { HttpClient } from '@angular/common/http';
// Router: Orquestador de rutas para realizar saltos de pantalla (ej. mandar al usuario al Login al cerrar sesión).
import { Router } from '@angular/router';
// Observable: Contrato de flujo asíncrono(Stream) que mantendrá el canal de red abierto esperando la respuesta de AWS.
// tap: Operador reactivo de "efecto secundario"(Side-effect). Permite husmear e interceptar el flujo exitoso para realizar 
// acciones paralelas(como guardar en LocalStorage) sin alterar ni modificar la estructura original del JSON que viaja.
// El operador tap intercepta los flujos exitosos para mutar variables sin alterar la respuesta
import { Observable, tap } from 'rxjs';


/**
 * =====================================================================================================================
 * CONTRATO DE INTERFAZ RÍGIDA DE ENTRADA (MAPPING DTO)
 * =====================================================================================================================
 * Define de manera estricta la estructura matemática exacta del JSON que responde tu AWS Lambda en Python.
 * Si el backend de Amazon altera una sola letra de estas propiedades, el tipado fuerte de TypeScript alertará en caliente.
 */
 // INTERFAZ ESTRICTA: Mapea de forma exacta la respuesta estructurada de tu AWS Lambda.
interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    rol: string; // 'Docente' o 'Padre de Familia'
  };
}

@Injectable({
  // 'root' declara este servicio como un Singleton Global. Significa que existirá una ÚNICA instancia lógica viva
  // compartida de forma transparente para todo el ecosistema de Fátima Conecta, optimizando la memoria RAM de la máquina.
  providedIn: 'root' // Patrón Singleton: Única instancia lógica viva para toda la aplicación
})
export class AuthService {

  // Inyección moderna de dependencias sin constructores acoplados
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

   // 🚀 ENDPOINT CERTIFICADO EN POSTMAN (TU URL HTTPS PÚBLICA DE AMAZON API GATEWAY)
   // 🚀 PASARELA DE INVOCACIÓN (ENDPOINT DE PRODUCCIÓN EN AMAZON API GATEWAY)
   // Dirección HTTPS pública y segura expuesta por tu API Gateway para canalizar el Login hacia el script de Python.
   private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/auth/login';

   // SIGNAL DE TRÁFICO Y CONTROL DE ACCESOS (SEGURIDAD PERMANENTE EN RAM):
   // Almacena el rol del usuario logueado en tiempo de ejecución. Al arrancar el sistema, lee de forma síncrona
   // el LocalStorage para verificar si hay una sesión previa. Este Signal gobernará la visibilidad de los botones del Sidebar.
   // SIGNAL GLOBAL DE ROL: Almacena en la memoria RAM el rol del usuario autenticado.
   // Evita fugas de estado leyendo el almacenamiento físico al inicializar el portal.
  public readonly rolUsuarioActual = signal<string | null>(localStorage.getItem('fc_user_rol'));

  /**
   * ===================================================================================================================
   * 🧪 CONEXIÓN ASÍNCRONA HTTP POST (HU01 - VALIDACIÓN TRANSACCIONAL EN LA NUBE)
   * ===================================================================================================================
   * CONEXIÓN ASÍNCRONA HACIA AWS (HU01): Dispara las credenciales en formato JSON.
   * Este método toma el correo y contraseña digitados por el docente/papá, arma un payload ligero en formato JSON 
   * y lo dispara por internet hacia la infraestructura serverless de AWS.
   */
  public loginPorServidor(correo: string, passwordPlano: string): Observable<LoginResponse> {
    
    // CONSTRUCCIÓN DEL PAYLOAD EXCLUSIVO PARA EL BACKEND:
    // Los nombres de las propiedades ('correo' y 'password') están mapeados idénticamente a las líneas de tu Lambda en Python.
    // Los nombres de las propiedades 'correo' y 'password' calzan idéntico con tu script de Python
    const payloadCredenciales = { correo, password: passwordPlano };

    // DISPARO ASÍNCRONO DEL CLIENTE HTTP:
    // Emitimos una petición HTTP POST indicándole a Angular que la respuesta empaquetada calzará con la interfaz 'LoginResponse'.
    return this.http.post<LoginResponse>(this.API_URL, payloadCredenciales).pipe(
      
      // EL OPERADOR TAP (INTERCEPCIÓN INTELIGENTE ANTES DE ENTREGAR EL PAQUETE AL COMPONENTE):
      // Si las credenciales fueron correctas y tu AWS RDS devolvió un Código 200 OK con el Token, el bloque 'tap' se activa.
      tap((respuestaAws) => {
        if (respuestaAws && respuestaAws.token) {
          // ─── BLOQUE DE PERSISTENCIA FÍSICA EN DISCO (LOCAL STORAGE DEL NAVEGADOR) ───
          // Almacenamos el token de seguridad y las variables de perfil en las celdas físicas del navegador web.
          // Esto blinda el sistema para que si la pestaña se refresca (F5), el usuario no pierda su sesión real.
          // Memorizamos las llaves de seguridad físicas de la sesión en el navegador de la máquina
          localStorage.setItem('fc_auth_token', respuestaAws.token);
          localStorage.setItem('fc_user_rol', respuestaAws.user.rol);
          localStorage.setItem('fc_user_id', respuestaAws.user.id.toString());

          // Tu antiguo código usaba 'user_role' para los mocks, mantenemos la llave por compatibilidad
          // localStorage.setItem('user_role', respuestaAws.user.rol);

          // ─── SINCRONIZACIÓN REACTIVA GRANULAR (MUTACIÓN DE ESTADO EN RAM) ───
          // Invocamos al método '.set()' de la propiedad reactiva. Al inyectarle el rol ('Docente' o 'Padre de Familia')
          // de forma directa en el Signal, Angular despierta y redibuja quirúrgicamente las opciones permitidas del Sidebar.
          // Mutamos la señal reactiva para despertar dinámicamente las directivas del Sidebar fijo
          this.rolUsuarioActual.set(respuestaAws.user.rol);
        }
      })
    );
  }

  /**
   * ===================================================================================================================
   * 🧹 MÉTODO DE DESTRUCCIÓN DE CONTEXTOS Y CIERRE DE SESIÓN (LOGOUT)
   * ===================================================================================================================
   * Se activa cuando el usuario decide salir del portal escolar. Su rol es purgar de forma absoluta cualquier rastro
   * lógico o físico de credenciales y bitácoras para salvaguardar la privacidad de la información escolar.
   * MÉTODO DE CIERRE DE SESIÓN: Destruye las credenciales y limpia los contextos pedagógicos.
   */
  public cerrarSesion(): void {

    // 1. PURGA ABSOLUTA DE CREDENCIALES DE ACCESO (SEGURIDAD DE SESIÓN)
    localStorage.removeItem('fc_auth_token');
    localStorage.removeItem('fc_user_rol');
    localStorage.removeItem('fc_user_id');
   // localStorage.removeItem('user_role');
    // 2. LIMPIEZA TOTAL EN CADENA (DESTRUCCIÓN DEL CONTEXTO CONGELADO):
    // Limpia de golpe todas las variables del disco de la máquina (`localStorage.clear()`). Esto es de vital importancia 
    // en tu proyecto de tesis porque destruye los residuos del subproceso MP02 (`contexto_estudiante_id`, `contexto_bimestre_texto`),
    // garantizando que si otro profesor inicia sesión en la misma máquina, no encuentre datos cruzados del alumno anterior.
    localStorage.clear(); // Garantiza la limpieza absoluta de los contextos congelados del MP02

    // 3. REINICIO DE ESTADO REACTIVO EN RAM:
    // Seteamos el Signal en 'null' para indicarle al Sidebar o barra de navegación superior que se oculte por completo.
    this.rolUsuarioActual.set(null);
    // 4. REDIRECCIÓN PROGRAMÁTICA CONTROLADA:
    // Expulsamos al usuario de las zonas privadas del Dashboard y lo mandamos de regreso a la vista pública de autenticación.
    this.router.navigate(['/login']);
  }
}
