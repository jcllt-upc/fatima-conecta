// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: DECORADORES, ENRUTADORES, SERVICIOS ASÍNCRONOS Y PRIMITIVAS REACTIVAS
// =====================================================================================================================

// Component, signal, OnInit, inject: Núcleo estructural de Angular 19 para controlar la vista y estados reactivos.
import { Component, signal, OnInit, inject } from '@angular/core';
// CommonModule: Habilita el renderizado condicional (@if) y el dinamismo de clases en tu plantilla HTML.
import { CommonModule } from '@angular/common';
// RouterLink: Permite enlazar transiciones fluidas de navegación hacia el siguiente paso del portal institucional.
import { RouterLink } from '@angular/router';
// ReactiveFormsModule, FormGroup, FormControl, Validators: Clases esenciales para el control defensivo del formulario.
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
// EvaluacionService: El orquestador de red global que interactúa con tu API Gateway y dispara la AWS Lambda en Python.
import { EvaluacionService } from '../../../../../core/services/evaluacion/evaluacion.service';

@Component({
  selector: 'app-evaluacion-progreso',
  standalone: true,
  // Matriz de dependencias locales necesarias para la validación reactiva de texto y navegación de subprocesos
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './evaluacion-progreso.html',
  styleUrl: './evaluacion-progreso.css'
})
export class EvaluacionProgresoComponent implements OnInit {

  // INYECCIÓN MODERNA DE INFRAESTRUCTURA (DESACOPLADA Y SIN CONSTRUCTORES TRADICIONALES)
  // Conectamos el puente de red oficial que dispara el método POST hacia Amazon API Gateway
  private readonly evaluacionService = inject(EvaluacionService);

  /**
   * SIGNALS DE CONTEXTO CONGELADO (REGLA DE TESIS):
   * Recuperan y memorizan la identidad exacta establecida en el subproceso P02.1 para mantener la secuencia.
   */
  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  /**
   * SIGNALS DE USABILIDAD (CONTADORES VIVOS):
   * Almacenan en la RAM del cliente la longitud exacta del texto. Angular actualiza la UI de forma quirúrgica.
   */
  protected readonly conteoLogros = signal<number>(0);
  protected readonly conteoDificultades = signal<number>(0);

  /**
   * SIGNAL DE BLOQUEO DE CONTROLES (SPINNER CLOUD):
   * Cambia a 'true' para inhabilitar botones mientras los párrafos viajan por internet hacia AWS Lambda.
   */
  protected readonly isLoading = signal<boolean>(false);

  /**
   * SIGNAL DE NOTIFICACIÓN DE EXCEPCIONES EN PANTALLA:
   * Captura en caliente si falla la VPC de AWS, si hay timeout o si SQL Server rechaza los textos.
   */
  protected readonly mensajeError = signal<string | null>(null);

  /**
   * SIGNAL DE CONTROL TRANSACCIONAL (UX):
   * Cambia a 'true' para ocultar de inmediato el formulario y desplegar el éxito permanente en pantalla.
   */
  protected readonly mostrarExitoEvaluacion = signal<boolean>(false);

  /**
   * REGLAS DE NEGOCIO INSTITUCIONALES PENSADAS PARA TU SUSTENTACIÓN:
   * Límite físico máximo coincidente con el varchar mapeado en tu base de datos relacional de SQL Server.
   */
  protected readonly MAX_CARACTERES = 1000;

  /**
   * FORMULARIO REACTIVO (FormGroup): Centraliza el estado lógico y las reglas defensivas de la redacción.
   */
  protected readonly evaluacionForm = new FormGroup({
    // txtLogros: Redacción obligatoria que no debe exceder bajo ninguna circunstancia los 1000 caracteres
    txtLogros: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    }),
    // txtDificultades: Caja de texto descriptivo para capturar los puntos de mejora detectados
    txtDificultades: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    })
  });

  /**
   * CICLO DE VIDA INICIALIZADOR (OnInit):
   * Corrige el bug de contexto leyendo las llaves físicas reales grabadas en el almacenamiento del navegador.
   */
  public ngOnInit(): void {
    // Sincronizamos milimétricamente las variables con las del componente P02.1 y P02.2
    const fichaId = localStorage.getItem('contexto_estudiante_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre_texto');

    // Si el flujo es íntegro y consistente, poblamos los Signals para pintar el banner superior de la UI
    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    } else {
      // Bloqueo preventivo de interfaz si el profesor saltó directamente al link sin elegir un alumno
      this.mensajeError.set('No se ha detectado ninguna ficha escolar activa en el contexto. Regrese al módulo inicial.');
    }
  }

  /**
   * MÉTODO DE USABILIDAD: Escucha activamente cada pulsación en 'Logros' y sincroniza la longitud en la Signal.
   */
  protected actualizarContadorLogros(): void {
    const longitudText = this.evaluacionForm.controls.txtLogros.value.length;
    this.conteoLogros.set(longitudText);
  }

  /**
   * MÉTODO DE USABILIDAD: Escucha activamente cada pulsación en 'Dificultades' para actualizar el contador en vivo.
   */
  protected actualizarContadorDificultades(): void {
    const longitudText = this.evaluacionForm.controls.txtDificultades.value.length;
    this.conteoDificultades.set(longitudText);
  }

  /**
   * ===================================================================================================================
   * 🚀 MOTOR TRANSACCIONAL DE CIERRE EVALUATIVO - CONEXIÓN CON AWS LAMBDA & RDS (HU14)
   * ===================================================================================================================
   * Este método consume tu servicio inyectado y transmite los textos cualitativos recolectados. El cerebro en
   * Python procesará el payload y ejecutará un comando UPDATE transicionando el estado de la ficha a 'Evaluado'.
   */
  protected onGuardarEvaluacion(): void {
    // Escape de seguridad Frontend: Si el profesor omitió campos o superó los 1000 caracteres, bloqueamos el hilo
    if (this.evaluacionForm.invalid || !this.idFichaContexto()) {
      this.evaluacionForm.markAllAsTouched(); // Gatilla el encendido de bordes rojos en las cajas mediante CSS
      return;
    }

    // Congelamos controles de la pantalla y limpiamos cualquier alerta residual de intentos erróneos
    this.isLoading.set(true);
    this.mensajeError.set(null);

    // Extraemos de forma transparente los textos del formulario y la FK del alumno congelado
    const idEstudianteNumerico = Number(this.idFichaContexto());
    const logrosRedactados = this.evaluacionForm.controls.txtLogros.value;
    const dificultadesRedactadas = this.evaluacionForm.controls.txtDificultades.value;

    // DISPARO HTTP POST HACIA TU INSTANCIA DE AMAZON API GATEWAY (ACCION: GUARDAR_EVALUACION)
    this.evaluacionService.guardarEvaluacionCualitativa(
      idEstudianteNumerico,
      logrosRedactados,
      dificultadesRedactadas
    ).subscribe({

      // CAMINO ÉXITO (NEXT / CÓDIGO HTTP 200 OK): Columnas actualizadas correctamente en AWS RDS SQL Server
      next: (respuestaAwsSuccess) => {
        this.isLoading.set(false); // Liberamos los controles visuales
        this.mostrarExitoEvaluacion.set(true); // Oculta el formulario reactivo y renderiza la pantalla de confirmación

        // PERSISTENCIA LOCAL COMPUESTA: Almacenamos temporalmente los textos cualitativos por si otros módulos los leen
        localStorage.setItem('contexto_evaluacion_logros', logrosRedactados);
        localStorage.setItem('contexto_evaluacion_dificultades', dificultadesRedactadas);
      },

      // CAMINO EXCEPCIÓN (ERROR / CÓDIGO HTTP 400 U OTRAS CONTROLADAS EN PYTHON):
      // Atrapa cualquier rechazo de base de datos o caída de red e inyecta la traza en la UI de forma quirúrgica
      error: (objetoErrorException) => {
        this.isLoading.set(false); // Apagamos el estado de carga para permitir que el docente intente reenviar
        const errorServidor = objetoErrorException.error?.error || 'Fallo crítico al conectar con el servidor AWS Lambda de evaluación.';
        this.mensajeError.set(errorServidor);
      }
    });
  }
}
