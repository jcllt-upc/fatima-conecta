// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES OFICIALES DEL FRAMEWORK ANGULAR Y CAPAS DEL SISTEMA
// =====================================================================================================================

// Component: Decorador que define que esta clase de TypeScript gobernará una vista visual HTML.
// inject: Función moderna de Angular(v16+) para realizar Inyección de Dependencias sin usar constructores acoplados.
// signal: Primitiva reactiva nativa de alto rendimiento que encapsula estados y redibuja la pantalla quirúrgicamente.
import { Component, inject, signal } from '@angular/core';

// Router: Servicio nativo que faculta la redirección programática entre pantallas del sistema web.
// RouterLink: Directiva que permite enlazar rutas fijas directamente en las etiquetas del archivo HTML.
import { Router, RouterLink } from '@angular/router';

// ReactiveFormsModule: Módulo global necesario para construir y controlar formularios estructurados reactivos.
// FormGroup: Clase que agrupa y centraliza una colección de cajas de texto (controles) bajo un mismo contenedor lógico.
// FormControl: Clase individual que gestiona el estado, valor y validez de una caja de texto específica en la vista.
// Validators: Colección de reglas de validación predefinidas (como campos obligatorios o formatos específicos de e-mail).
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// CommonModule: Módulo estándar que proporciona las directivas estructurales básicas(como @if y @for) en el HTML.
import { CommonModule } from '@angular/common';

// AuthService: Tu puente de datos asíncrono que creamos por comandos de consola. Conecta este componente con AWS.
import { AuthService } from '../../../../core/services/auth/auth.service';

// =====================================================================================================================
// 2. DECORADOR @COMPONENT: CONFIGURACIÓN METADATA DE LA INTERFAZ DE USUARIO (UI)
// =====================================================================================================================
@Component({
  selector: 'app-login', // Nombre de la etiqueta HTML personalizada para renderizar este componente (<app-login>)
  standalone: true,      // Define que el componente es auto-contenido y gestiona sus propias dependencias de forma moderna
  // Matriz de importaciones locales requeridas exclusivamente por este componente para pintar y validar la interfaz
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html', // Enlace físico hacia el archivo de diseño estructurado de la vista pública
  styleUrl: './login.css'       // Enlace físico hacia la hoja de estilos en cascada CSS de esta pantalla
})

// =====================================================================================================================
// 3. CLASE CONTROLADORA PRINCIPAL DE LA AUTENTICACIÓN INSTITUTIONAL
// =====================================================================================================================
export class LoginComponent {

  // INYECCIÓN DE SERVICIOS INDEPENDIENTES (REGLA DE ARQUITECTURA DESACOPLADA)
  // Atamos el AuthService real para conectarnos a API Gateway y el Router para los viajes de pantalla
  // authService: Instancia del servicio core que sabe cómo empaquetar datos por internet hacia Amazon API Gateway.
  // Usar inject evita heredar acoplamientos rígidos que perjudiquen las pruebas unitarias.
  private readonly authService = inject(AuthService);
  // router: Instancia del motor de rutas de Angular. Se encarga de cambiar la pantalla de forma fluida y sin recargar la página.
  private readonly router = inject(Router);

  // SIGNALS REACTIVOS DE CONTROL DE INTERFAZ DE USUARIO (USABILIDAD UX)
  
  // isPasswordVisible: Cambia dinámicamente el atributo type de 'password' a 'text' para revelar la clave en pantalla.
  // isPasswordVisible: Bandera reactiva booleana. Si es false, el HTML renderiza type="password" (oculto); 
  // si cambia a true, transforma el campo en type="text" para revelar la contraseña en pantalla.
  protected readonly isPasswordVisible = signal<boolean>(false);

  // isLoading: Al ponerse en 'true', bloquea el botón de envío y activa un spinner visual para evitar clics dobles del usuario.
  // isLoading: Control preventivo anti-duplicidad. Al ponerse en 'true', el HTML inactiva(disabled) el botón de envío
  // y muestra una animación de carga, evitando que un usuario impaciente dispare múltiples llamadas repetidas a AWS.
  protected readonly isLoading = signal<boolean>(false);

  // mensajeError: Almacena el hilo de texto del error(ej. "Clave incorrecta") capturado desde tu base de datos de AWS RDS.
  // mensajeError: Contenedor reactivo de excepciones. Guarda los mensajes negativos del servidor de AWS(ej: "Clave incorrecta")
  // para inyectarlos dinámicamente en una franja roja dentro del HTML en cuanto la autenticación falle.
  protected readonly mensajeError = signal<string | null>(null);

  // ==========================================================================
  // FORMULARIO REACTIVO COMPUESTO (CONTRATO LÓGICO DE CAPTURA DE DATOS)
  // ==========================================================================
  
  // Centraliza las reglas de negocio iniciales antes de malgastar recursos disparando peticiones a la nube de AWS
  // loginForm: Estructura que gobierna el formulario. Centraliza las reglas de validación en el cliente, 
  // impidiendo que se malgasten solicitudes de red innecesarias hacia AWS si las cajas están vacías o mal formateadas.
   protected readonly loginForm = new FormGroup({
    
    // Control email: Representa la caja del correo. Valida obligatoriedad y formato estricto de e-mail corporativo.
    // Control email: Controla el cuadro de texto del correo.
    // nonNullable: true -> Si el formulario se limpia, la propiedad vuelve a un string vacío ('') y nunca se rompe en null.
    // Validators.required -> Campo obligatorio.
    // Validators.email -> Expresión regular que valida que la cadena tenga una estructura legal de correo(ejemplo@dominio.com).
    email: new FormControl('', {
      nonNullable: true, // Si el formulario se resetea, el valor regresa a un string vacío ('') en lugar de romperse en 'null'
      validators: [Validators.required, Validators.email] // Filtros estrictos de validación en tiempo real de Angular
    }),
    
    // Control password: Representa la caja de la contraseña. Solo valida obligatoriedad para delegar el cifrado a AWS RDS.
    // Control password: Controla la caja de texto de la contraseña de acceso institucional.
    // Solo exige obligatoriedad de llenado en el cliente para delegar la verificación matemática a la Lambda de AWS.
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  // ==========================================================================
  // MÉTODOS DE COMPORTAMIENTO INTERACTIVO Y TRANSACCIONAL
  // ==========================================================================

  /**
   * ACCIÓN DE USABILIDAD (UI): Alterna de forma segura el ojo visual para mostrar u ocultar la clave.
   * Utiliza el método nativo '.update()' de los Signals para invertir el valor booleano actual en memoria RAM.
   */
  // togglePasswordVisibility(): Método de accesibilidad visual gatillado al pulsar el icono del ojo en la interfaz.
  // Utiliza el método nativo '.update()' de los Signals para leer el valor booleano en la RAM e invertirlo al instante 
  // (de true a false o viceversa), redibujando exclusivamente el cuadro de la contraseña de manera quirúrgica.
  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update(visible => !visible);
  }

  /**
   * MÉTODO NÚCLEO TRANSACCIONAL (HU01 - AUTENTICACIÓN):
   * Se ejecuta automáticamente al presionar el botón de tipo submit dentro de tu archivo de vista HTML.
   * Destruye de forma definitiva las simulaciones estáticas antiguas para conectarse al ecosistema real de Amazon S3 y RDS.
   */
   // onSubmit(): Método transaccional central de la pantalla(Gatillado por la historia de usuario HU01 - Autenticación).
   // Se activa automáticamente en cuanto el docente o apoderado presiona el botón "Iniciar Sesión" de tipo submit.
   // Ejecuta el protocolo de validación local y gestiona el flujo asíncrono hacia los servicios cloud de AWS.
  protected onSubmit(): void {
    
    // VALIDACIÓN DE ESCAPE DE SEGURIDAD (FRONTEND):
    // Si el usuario intentó saltarse el diseño e ingresar datos inválidos, forzamos el encendido de los bordes rojos
    // 🛡️ PASO 1: COMPUERTA DE ESCAPE DE SEGURIDAD(FRONTEND)
    // Si el usuario manipuló el HTML o intentó enviar campos vacíos, Angular frena el proceso de inmediato.
    if (this.loginForm.invalid) {
      // Recorre todas las cajas del formulario y las marca como manipuladas ("touched").
      // Esto gatilla que Angular inyecte las clases invalid-touched en el CSS, pintando los bordes rojos de alerta.
      this.loginForm.markAllAsTouched(); // Enciende de golpe los estados de error invalid-touched de Angular en el CSS
      // Detiene el método por completo. Impide que viaje una petición inútil a AWS, cuidando tu cuota de nube.
      return; // Detiene la ejecución e impide que la petición viaje a AWS Gateway, cuidando la cuota de la nube
    }

    // ⚡ PASO 2: INICIALIZACIÓN DEL ESTADO ASÍNCRONO
    // FLUJO DE INICIO DE PROCESAMIENTO ASÍNCRONO
    // Cambia el Signal a true para congelar los botones y mostrar el spinner visual.
    this.isLoading.set(true);      // Encendemos el estado de carga para bloquear interacciones físicas
    // Resetea y limpia banners de advertencias rojas generados en intentos fallidos anteriores.
    this.mensajeError.set(null);   // Limpiamos cualquier franja o banner de advertencia rojo del intento anterior

    // 📦 PASO 3: DESESTRUCTURACIÓN Y EXTRACCIÓN DE DATOS LIMPIOS
    // DESESTRUCTURACIÓN DE VARIABLES LIMPIAS
    // Extraemos las cadenas de texto ingresadas de forma segura desde el FormGroup reactivo
    // getRawValue extrae los valores actuales en formato de texto plano string directamente desde el FormGroup.
    const { email, password } = this.loginForm.getRawValue();

    // 🌐 PASO 4: DISPARO DE COMUNICACIÓN REMOTA (CONEXIÓN EN VIVO A AMAZON API GATEWAY)
    // COMUNICACIÓN ASÍNCRONA HTTP HACIA AMAZON API GATEWAY (CONEXIÓN REAL)
    // Nos suscribimos al Observable del servicio para escuchar las compuertas de respuesta en tiempo real
    // Invocamos el método del servicio pasándole las credenciales digitadas por el usuario.
    // Nos suscribimos(.subscribe) al canal Observable para ponernos en modo "escucha" esperando la respuesta de AWS.
    this.authService.loginPorServidor(email, password).subscribe({
      
      // CAMINO A (NEXT / EXITO 200 OK): Las credenciales coincidieron perfectamente en tu SQL Server en RDS.
      // CAMINO A: ÉXITO ABSOLUTO (Flujo "Next" - Código HTTP 200 OK)
      // Significa que la Lambda validó el correo y la contraseña coincidió perfectamente en tu base de datos SQL Server.
      // Se gatilla exclusivamente si el correo existe en la tabla dbo.Usuarios y la contraseña coincide exactamente.
      next: (respuestaSuccess) => {
        // En este punto el token dinámico ya fue memorizado de forma física por el tap de tu servicio en el localStorage.
        // 1. APAGADO DEL SPINNER (UX):
        // Cambiamos el estado del Signal reactivo a 'false'. Esto le avisa al archivo login.html que debe reactivar
        // físicamente los botones y ocultar la animación de carga, devolviéndole el control total al usuario.
        this.isLoading.set(false); // Apagamos el spinner visual de carga liberando la pantalla
        // 2. ENRUTAMIENTO TRANSACCIONAL (NAVEGACIÓN SEGURA):
        // Invocamos al método '.navigate()' del servicio Router nativo de Angular. Al haber validado las credenciales
        // contra tu SQL Server, el framework destruye la pantalla de Login y redibuja en milisegundos las vistas 
        // privadas del Dashboard Escolar sin necesidad de recargar la página web por completo.
        this.router.navigate(['/dashboard']); // Redirigimos instantáneamente al docente o padre hacia el Dashboard Privado
      },
      
      // CAMINO B (ERROR / EXCEPCIÓN HTTP 401, 403, 500): Las credenciales fallaron o se perdió el internet.
      // Se gatilla si la clave no empareja, el correo no está registrado o la VPC de AWS no responde por timeout.
      error: (objetoErrorException) => {
        // 1. LIBERACIÓN DEL FORMULARIO:
        // Apagamos de inmediato el spinner visual de carga pasándolo a 'false'. Hacemos esto para que las cajas de 
        // texto de la pantalla se desbloqueen y el profesor pueda reescribir o corregir su contraseña de inmediato.
        this.isLoading.set(false); // Apagamos el spinner para permitir que el docente vuelva a intentar reescribir
        
        // INTERCEPCIÓN QUIRÚRGICA DEL ERROR DE TU AWS LAMBDA:
        // Captura el objeto '.error' enviado desde tu return de Python (Línea 65, 78 u 125 de tu Lambda)
        // Si el servidor de AWS RDS no responde por timeout, cae en el fallback por defecto de la derecha
        // 2. EXTRACCIÓN QUIRÚRGICA DEL PAYLOAD DE EXCEPCIÓN DE TU AWS LAMBDA:
        // 'objetoErrorException' contiene todo el paquete de error que rebota de internet. Usamos el operador de 
        // navegación segura (?.error) para escarbar dentro del JSON enviado desde el comando return de tu script de Python.
        // Si la Lambda envió por ejemplo: "Contraseña incorrecta", la variable 'errorServidor' capturará ese texto exacto.
        // Si el internet falló por completo y AWS ni siquiera respondió, se activa el texto de fallback de la derecha.
        const errorServidor = objetoErrorException.error?.error || 'Error crítico de comunicación con el servidor de AWS.';
        
        // Inyectamos el texto del error en el Signal reactivo. Esto gatillará que el HTML lo pinte al instante
        // 3. PROPAGACIÓN REACTIVA DEL ERROR EN PANTALLA (RENDERIZADO INMEDIATO):
        // Inyectamos el string de error extraído directamente dentro del Signal reactivo 'mensajeError'. 
        // Como los Signals están conectados quirúrgicamente a la vista, Angular detectará el cambio de estado en la RAM
        // y hará que el archivo login.html dibuje inmediatamente tu banner de advertencia rojo con el mensaje exacto.
        this.mensajeError.set(errorServidor);
      }
      
    });
  }
}
