// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: CONTROLADORES, COMPONENTES REACTIVOS Y SERVICIOS ASÍNCRONOS
// =====================================================================================================================

// Component: Decorador que define que esta clase de TypeScript gobernará y dará lógica a una interfaz HTML.
// signal: Primitiva reactiva nativa para gestionar estados granulares con un rendimiento quirúrgico en la memoria.
// OnInit: Interfaz de ciclo de vida que obliga a implementar el método inicializador al arrancar la pantalla.
// inject: Mecanismo moderno de Angular para realizar Inyección de Dependencias sin constructores acoplados.
import { Component, signal, OnInit, inject } from '@angular/core';

// CommonModule: Módulo estándar que proporciona las directivas base en la vista (como @if y el formateo de datos).
import { CommonModule } from '@angular/common';

// ReactiveFormsModule: Habilita el control rígido de validaciones de formularios asíncronos en el cliente.
// FormGroup, FormControl, Validators: Clases esenciales para construir, rastrear y validar entradas de texto.
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// ContextoEstudianteService: Tu puente de red global creado por consola que se comunica con Amazon API Gateway.
// EstudianteServidor: Contrato estricto (Interfaz) que define cómo viaja un alumno desde el INNER JOIN de Python.
import { ContextoEstudianteService, EstudianteServidor } from '../../../../../core/services/contexto-estudiante/contexto-estudiante.service';

@Component({
  selector: 'app-contexto-estudiante',
  standalone: true,
  // Matriz de dependencias locales requeridas por este componente para validar controles y estructurar la vista
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contexto-estudiante.html',
  styleUrl: './contexto-estudiante.css'
})
export class ContextoEstudianteComponent implements OnInit {

  // INYECCIÓN DE SERVICIOS INTEGRADOS (ARQUITECTURA COMPLETAMENTE DESACOPLADA)
  // Atamos el orquestador de red que creamos en el núcleo del sistema
  private readonly contextoService = inject(ContextoEstudianteService);

  /**
   * CATÁLOGO MEMORIA MAESTRO: Almacena de forma inmutable la nómina completa de estudiantes que devuelve el servidor RDS.
   * Actúa como el caché local de la pantalla para permitir que el algoritmo de filtrado opere al instante sin saturar a AWS.
   */
  private catalogoAlumnosServidor: EstudianteServidor[] = [];

  // =====================================================================================================
  // 🟢 COMPONENTES DE PAGINACIÓN LOCAL (CONTROL DE INTERFAZ FRONTEND)
  // =====================================================================================================
  // Controla de forma reactiva el número de página en el que se encuentra parado el docente (Inicia en 1)
  protected readonly paginaActual = signal<number>(1);
  
  // Define el límite estricto de filas permitidas simultáneamente en la cuadrícula de búsqueda
  protected readonly registrosPorPagina: number = 6;

    /**
   * PROVEEDOR DE REGISTROS PAGINADOS: Aplica un corte matemático .slice() sobre la señal filtrada.
   * Evita renderizar listados masivos en el DOM y se actualiza automáticamente al cambiar de página.
   */
  protected obtenerAlumnosPaginados(): EstudianteServidor[] {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.estudiantesFiltrados().slice(inicio, fin);
  }

  /**
   * CÁLCULO DE TOTAL DE PÁGINAS: Determina cuántos bloques de 6 alumnos se pueden formar.
   */
  protected obtenerTotalPaginas(): number {
    return Math.ceil(this.estudiantesFiltrados().length / this.registrosPorPagina) || 1;
  }


  /**
   * SIGNAL DE RENDERIZADO: Almacena la sub-matriz de estudiantes que coinciden con el criterio de búsqueda del docente.
   * El bucle @for del archivo HTML lee directamente este Signal para pintar las filas en tiempo real.
   */
  protected readonly estudiantesFiltrados = signal<EstudianteServidor[]>([]);

  /**
   * SIGNAL DE CONTEXTO CONGELADO (UI): Almacena el objeto del alumno marcado por el profesor.
   * Si está en null, el HTML ocultará los formularios del periodo y pintará la tarjeta de 'Ficha sin Inicializar'.
   */
  protected readonly estudianteSeleccionado = signal<EstudianteServidor | null>(null);

  /**
   * SIGNAL DE CONTROL DE COMPORTAMIENTO (SPINNER/UX):
   * Se activa en 'true' para congelar el botón y mostrar un indicador visual de carga mientras viaja el HTTP POST por internet.
   */
  protected readonly isLoading = signal<boolean>(false);

  /**
   * SIGNAL DE MENSAJE DE ADVERTENCIA (EXCEPCIONES DE RED / REPETIDOS):
   * Captura en caliente los códigos de error de tu AWS Lambda (como el 409 de registros duplicados) y los pinta en pantalla.
   */
  protected readonly mensajeError = signal<string | null>(null);

  /**
   * SIGNAL DE CONTROL TRANSACCIONAL: Almacena un valor booleano para simular el éxito visual en pantalla.
   * Se pone en 'true' para gatillar el banner verde de confirmación una vez que tu base de datos RDS confirma el INSERT.
   */
  protected readonly fichaAperturadaExitosamente = signal<boolean>(false);

  /**
   * CONTENEDOR REACTIVO (FormGroup): Centraliza el estado lógico y las reglas de validación de la pantalla.
   */
  protected readonly contextoForm = new FormGroup({
    // txtBuscar: Caja de entrada de texto libre. 'nonNullable: true' asegura que si se limpia, retorne un string vacío y no null.
    txtBuscar: new FormControl('', { nonNullable: true }),

    // selBimestre: Selector del periodo escolar. Filtro obligatorio ('Validators.required') para evitar registrar fichas en el aire.
    selBimestre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  /**
   * CICLO DE VIDA INICIAL (OnInit): Carga de Datos Maestra desde la Nube.
   * Se ejecuta una única vez de forma automática en cuanto la pantalla se dibuja en el navegador.
   */
  public ngOnInit(): void {
    this.isLoading.set(true); // Encendemos el estado de carga inicial en la interfaz
    this.mensajeError.set(null); // Limpiamos bloqueos previos

    // CONSUMO EN VIVO DESDE LA NUBE: Ejecutamos el método GET camuflado que habla con API Gateway
    this.contextoService.obtenerCatalogoEstudiantes().subscribe({
      next: (respuestaAws) => {
        this.isLoading.set(false); // Apagamos el spinner al recibir el paquete de red
        // Guardamos los datos reales del INNER JOIN de SQL Server en nuestro caché maestro de memoria
        this.catalogoAlumnosServidor = respuestaAws.alumnos;
        // Poblamos inicialmente la grilla visual inyectando todo el catálogo recibido
        this.estudiantesFiltrados.set(this.catalogoAlumnosServidor);
      },
      error: (errorContexto) => {
        this.isLoading.set(false); // Apagamos el estado de carga para liberar controles
        // Si la red fluctúa o falla la VPC, atrapamos el JSON de excepción y lo exponemos al docente
        const falla = errorContexto.error?.error || 'No se pudo recuperar el listado de estudiantes desde AWS RDS.';
        this.mensajeError.set(falla);
      }
    });
  }

  /**
   * ALGORITMO DE FILTRADO LOCAL (OPTIMIZACIÓN DE PROCESAMIENTO / UX):
   * Escanea en tiempo real el caché de memoria maestro basándose en lo que tipea el docente.
   * Evita realizar llamadas repetitivas por internet a AWS por cada letra presionada, protegiendo tu factura cloud.
   */
  protected ejecutarBusqueda(): void {

    this.paginaActual.set(1); // 🟢 REINICIO: Asegura que el filtro empiece desde la página 1
    // Estandarizamos el texto digitado pasándolo a minúsculas y removiendo espacios fantasmas en las esquinas
    const textoBuscado = this.contextoForm.controls.txtBuscar.value.toLowerCase().trim();

    // Si la caja quedó en blanco, restauramos de inmediato la grilla con todos los alumnos del caché de AWS
    if (!textoBuscado) {
      this.estudiantesFiltrados.set(this.catalogoAlumnosServidor);
      return;
    }

    // Algoritmo multicriterio inmutable: busca coincidencias en DNI, Nombres o Apellidos de forma simultánea
    const coincidencias = this.catalogoAlumnosServidor.filter(alumno =>
      alumno.dni.includes(textoBuscado) ||
      alumno.nombres.toLowerCase().includes(textoBuscado) ||
      alumno.apellidos.toLowerCase().includes(textoBuscado)
    );

    // Actualizamos el Signal. Angular redibujará exclusivamente las filas afectadas de forma instantánea
    this.estudiantesFiltrados.set(coincidencias);
  }

  /**
   * CONFIGURADOR DE CONTEXTO INTERACTIVO:
   * Se ejecuta al hacer un clic sobre la fila de un estudiante en la grilla izquierda.
   */
  protected seleccionarEstudiante(alumno: EstudianteServidor): void {
    this.estudianteSeleccionado.set(alumno); // Congela temporalmente al alumno en la memoria RAM del componente
    this.mensajeError.set(null); // Limpiamos alertas de conflictos de intentos anteriores
    this.fichaAperturadaExitosamente.set(false); // Reiniciamos estados de éxito de ejecuciones previas
  }

  /**
   * CIERRE TRANSACCIONAL EN LA NUBE - APERTURA DE BITÁCORA (HU12):
   * Se activa al presionar el botón azul "Abrir Ficha Escolar". Envía las llaves foráneas requeridas
   * por las restricciones relacionales de tu base de datos de AWS RDS para ejecutar el INSERT.
   */
  protected onRegistrarContexto(): void {
    // Escape de seguridad Frontend: Si el profesor no eligió el bimestre, bloqueamos el proceso
    if (this.contextoForm.controls.selBimestre.invalid) {
      this.contextoForm.controls.selBimestre.markAsTouched(); // Enciende los bordes rojos de alerta en el HTML
      return;
    }

    // Bloqueamos controles visuales y limpiamos la consola de errores previos
    this.isLoading.set(true);
    this.mensajeError.set(null);

    // Recuperamos de forma síncrona el alumno de la Signal y el código del periodo del control reactivo
    const alumnoActual = this.estudianteSeleccionado();
    const bimestreSeleccionado = this.contextoForm.controls.selBimestre.value;

    // Extraemos de forma transparente el ID del docente que inició sesión real en tu Login corporativo
    const idDocenteLogueado = Number(localStorage.getItem('fc_user_id')) || 1;

    // Validación de consistencia de memoria antes de disparar el canal HTTP
    if (alumnoActual && bimestreSeleccionado) {

      // PARSEO DE MAPEO ACADÉMICO: Convertimos el texto del combo a los IDs primarios enteros que espera tu SQL Server
      let idPeriodoMapeado = 1; // Fallback Primer Bimestre por defecto
      if (bimestreSeleccionado === 'Segundo Bimestre') idPeriodoMapeado = 2;
      if (bimestreSeleccionado === 'Tercer Bimestre') idPeriodoMapeado = 3;
      if (bimestreSeleccionado === 'Cuarto Bimestre') idPeriodoMapeado = 4;

      // DISPARO HTTP POST HACIA TU INSTANCIA DE AMAZON API GATEWAY
      this.contextoService.aperturarNuevaBitacora(
        alumnoActual.idEstudiante,
        idPeriodoMapeado,
        idDocenteLogueado
      ).subscribe({

        // CAMINO ÉXITO (NEXT / CÓDIGO HTTP 201 CREATED): Fila insertada exitosamente en el servidor RDS
        next: (respuestaSuccess) => {
          this.isLoading.set(false); // Liberamos el spinner de procesamiento
          this.fichaAperturadaExitosamente.set(true); // Gatilla de inmediato el banner de felicitación verde en el HTML
          // PERSISTENCIA GLOBAL COMPUESTA (PATRÓN CONTEXTO CONGELADO - REGLA DE TESIS):
          // Guardamos las variables físicas en el disco del navegador. Esto habilitará que los siguientes
          // subprocesos independientes (Evidencias y Progreso Cualitativo) lean de forma automática a qué alumno se está evaluando.
          localStorage.setItem('contexto_estudiante_id', alumnoActual.idEstudiante.toString());
          localStorage.setItem('contexto_estudiante_nombre', alumnoActual.nombreCompleto);
          localStorage.setItem('contexto_bimestre_id', idPeriodoMapeado.toString());
          localStorage.setItem('contexto_bimestre_texto', bimestreSeleccionado);
        },
        // CAMINO EXCEPCIÓN (ERROR / CÓDIGO HTTP 409 CONFLICT O 500 TIMEOUT):
        // Atrapa el bloqueo de tu Lambda si el profesor intentó registrar por duplicado al mismo alumno en el mismo periodo
        error: (objetoErrorException) => {
          this.isLoading.set(false); // Apagamos el spinner para permitir que el docente corrija el combo
          // Extraemos el mensaje de conflicto configurado en tu script de Python y lo inyectamos reactivamente en pantalla
          const errorServidor = objetoErrorException.error?.error || 'Error crítico al intentar fundar la Bitácora Pedagógica en AWS.';
          this.mensajeError.set(errorServidor);
        }
      });
    }
  }
  /**
  • MÉTODO AUXILIAR DE RESTAURACIÓN (RESET):
  • Limpia por completo todos los hilos lógicos de la pantalla regresando el componente a su estado neutro inicial.
  */
  protected limpiarFicha(): void {
    this.estudianteSeleccionado.set(null); // Oculta los paneles de escritura del formulario derecho
    this.fichaAperturadaExitosamente.set(false); // Destruye el banner verde de éxito de la pantalla
    this.mensajeError.set(null); // Borra cualquier rastro de alertas rojas
    this.contextoForm.reset(); // Vacía de golpe el input de búsqueda y el menú desplegable de bimestres
    this.estudiantesFiltrados.set(this.catalogoAlumnosServidor); // Sincroniza la tabla izquierda con todo el catálogo de AWS

    this.paginaActual.set(1); // 🟢 REINICIO: Restaura la cuadrícula al bloque inicial de 6 alumnos
  }
  /**
  • CONTROL INTEGRADO DE USABILIDAD (UX):
  • Se ejecuta al presionar la cruz (✖) del input. Limpia el buscador y restaura la tabla al instante.
  */
  protected limpiarBuscador(): void {
    this.contextoForm.controls.txtBuscar.setValue(''); // Inyecta un string vacío reactivo en la caja
    this.ejecutarBusqueda(); // Gatilla el algoritmo de búsqueda para repoblar la lista con todo el caché de RDS
  }


  // =====================================================================================================
  // 🟢 MÉTODOS DE CONTROL DE FLUJO DE PAGINACIÓN (ACCIONES DEL DOCENTE)
  // =====================================================================================================
  
  /**
   * Decrementa el índice de página si el usuario no se encuentra en el primer bloque.
   */
  protected paginaAnterior(): void {
    if (this.paginaActual() > 1) {
      this.paginaActual.update(p => p - 1);
    }
  }

  /**
   * Incrementa el índice de página si existen más registros pendientes por renderizar.
   */
  protected paginaSiguiente(): void {
    if (this.paginaActual() < this.obtenerTotalPaginas()) {
      this.paginaActual.update(p => p + 1);
    }
  }


}