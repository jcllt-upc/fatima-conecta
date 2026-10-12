import { Component, signal, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { ContextoEstudianteService, EstudianteServidor } from '../../../../../core/services/contexto-estudiante/contexto-estudiante.service';

@Component({
  selector: 'app-contexto-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contexto-estudiante.html',
  styleUrl: './contexto-estudiante.css'
})
export class ContextoEstudianteComponent implements OnInit {

  private readonly contextoService = inject(ContextoEstudianteService);

  private catalogoAlumnosServidor: EstudianteServidor[] = [];

  protected readonly paginaActual = signal<number>(1);
  
  // Define el límite estricto de filas permitidas simultáneamente en la cuadrícula de búsqueda
  protected readonly registrosPorPagina: number = 6;

  protected obtenerAlumnosPaginados(): EstudianteServidor[] {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.estudiantesFiltrados().slice(inicio, fin);
  }

  protected obtenerTotalPaginas(): number {
    return Math.ceil(this.estudiantesFiltrados().length / this.registrosPorPagina) || 1;
  }


  protected readonly estudiantesFiltrados = signal<EstudianteServidor[]>([]);

  protected readonly estudianteSeleccionado = signal<EstudianteServidor | null>(null);

  protected readonly isLoading = signal<boolean>(false);

  protected readonly mensajeError = signal<string | null>(null);

  protected readonly fichaAperturadaExitosamente = signal<boolean>(false);

  protected readonly contextoForm = new FormGroup({
    // txtBuscar: Caja de entrada de texto libre. 'nonNullable: true' asegura que si se limpia, retorne un string vacío y no null.
    txtBuscar: new FormControl('', { nonNullable: true }),

    // selBimestre: Selector del periodo escolar. Filtro obligatorio ('Validators.required') para evitar registrar fichas en el aire.
    selBimestre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });


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
        const falla = errorContexto.error?.error || 'No se pudo recuperar el listado de estudiantes desde AWS RDS.';
        this.mensajeError.set(falla);
      }
    });
  }

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

  protected seleccionarEstudiante(alumno: EstudianteServidor): void {
    this.estudianteSeleccionado.set(alumno); // Congela temporalmente al alumno en la memoria RAM del componente
    this.mensajeError.set(null); // Limpiamos alertas de conflictos de intentos anteriores
    this.fichaAperturadaExitosamente.set(false); // Reiniciamos estados de éxito de ejecuciones previas
  }

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
          this.fichaAperturadaExitosamente.set(true);
          localStorage.setItem('contexto_estudiante_id', alumnoActual.idEstudiante.toString());
          localStorage.setItem('contexto_estudiante_nombre', alumnoActual.nombreCompleto);
          localStorage.setItem('contexto_bimestre_id', idPeriodoMapeado.toString());
          localStorage.setItem('contexto_bimestre_texto', bimestreSeleccionado);
        },
        error: (objetoErrorException) => {
          this.isLoading.set(false); // Apagamos el spinner para permitir que el docente corrija el combo
          // Extraemos el mensaje de conflicto configurado en tu script de Python y lo inyectamos reactivamente en pantalla
          const errorServidor = objetoErrorException.error?.error || 'Error crítico al intentar fundar la Bitácora Pedagógica en AWS.';
          this.mensajeError.set(errorServidor);
        }
      });
    }
  }

  protected limpiarFicha(): void {
    this.estudianteSeleccionado.set(null); // Oculta los paneles de escritura del formulario derecho
    this.fichaAperturadaExitosamente.set(false); // Destruye el banner verde de éxito de la pantalla
    this.mensajeError.set(null); // Borra cualquier rastro de alertas rojas
    this.contextoForm.reset(); // Vacía de golpe el input de búsqueda y el menú desplegable de bimestres
    this.estudiantesFiltrados.set(this.catalogoAlumnosServidor); // Sincroniza la tabla izquierda con todo el catálogo de AWS

    this.paginaActual.set(1); // 🟢 REINICIO: Restaura la cuadrícula al bloque inicial de 6 alumnos
  }

  protected limpiarBuscador(): void {
    this.contextoForm.controls.txtBuscar.setValue(''); // Inyecta un string vacío reactivo en la caja
    this.ejecutarBusqueda(); // Gatilla el algoritmo de búsqueda para repoblar la lista con todo el caché de RDS
  }



  protected paginaAnterior(): void {
    if (this.paginaActual() > 1) {
      this.paginaActual.update(p => p - 1);
    }
  }

  protected paginaSiguiente(): void {
    if (this.paginaActual() < this.obtenerTotalPaginas()) {
      this.paginaActual.update(p => p + 1);
    }
  }


}