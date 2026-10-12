import { Component, OnInit, signal, inject,ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MantenimientoEstudianteService } from '../../../../../core/services/mantenimiento-estudiante/mantenimiento-estudiante.service';
import { Estudiante } from '../../../../../core/models/estudiante.model';

@Component({
  selector: 'app-mantenimiento-estudiante',
  standalone: true,
  // Importamos módulos nativos necesarios para validaciones y control de flujos
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mantenimiento-estudiante.html',
  styleUrl: './mantenimiento-estudiante.css'
})
export class MantenimientoEstudianteComponent implements OnInit {
  
  // ==========================================================================
  // 1. INYECCIÓN FUNCIONAL DE DEPENDENCIAS (ANGULAR MODERNO)
  // ==========================================================================
  private readonly estudianteService = inject(MantenimientoEstudianteService);
  private readonly fb = inject(FormBuilder);

  private readonly cdr = inject(ChangeDetectorRef);

  // ==========================================================================
  // 2. SEÑALES REACTIVAS (SIGNALS) PARA EL GOBIERNO DE LA VISTA
  // ==========================================================================
  // Controla el estado visual activo en CSS puro: 'LISTA', 'FORMULARIO' o 'DETALLE'
  public vistaActiva = signal<'LISTA' | 'FORMULARIO' | 'DETALLE'>('LISTA');
  
  // Almacena el listado general de alumnos recuperados desde AWS RDS
  public listaEstudiantes = signal<Estudiante[]>([]);

    // =====================================================================================================
  // 🟢 COMPONENTES DE PAGINACIÓN LOCAL (MANTENEDOR GENERAL)
  // =====================================================================================================
  // Controla reactivamente el número de bloque en el listado del Director (Inicia en 1)
  protected readonly paginaActual = signal<number>(1);
  
  // Límite exacto de filas permitidas por grilla en la vista general del mantenedor
  protected readonly registrosPorPagina: number = 7;

    /**
   * SEGMENTADOR DE EXPEDIENTES: Aplica un .slice() local sobre la señal de estudiantes.
   * Provee únicamente las 6 filas activas reduciendo la carga de renderizado en el navegador.
   */
  protected obtenerEstudiantesPaginados(): any[] {
    const inicio = (this.paginaActual() - 1) * this.registrosPorPagina;
    const fin = inicio + this.registrosPorPagina;
    return this.listaEstudiantes().slice(inicio, fin);
  }

  /**
   * CÁLCULO DE BLOQUES: Determina el límite de páginas basándose en el conteo total de SQL Server.
   */
  protected obtenerTotalPaginas(): number {
    return Math.ceil(this.listaEstudiantes().length / this.registrosPorPagina) || 1;
  }

  
  // Almacena el expediente del alumno seleccionado exclusivamente para la ficha de detalle
  public estudianteSeleccionado = signal<Estudiante | null>(null);
  
  // Estado de carga para mostrar un spinner o texto de espera en CSS puro
  public estaCargando = signal<boolean>(false);

  // ==========================================================================
  // 3. FORMULARIOS Y ATRIBUTOS DE ARCHIVOS MULTIMEDIA
  // ==========================================================================
  public estudianteForm!: FormGroup;
  public esEdicion: boolean = false;
  
  // Guarda el archivo físico capturado en el input de la computadora
  private archivoFotoSeleccionado: File | null = null;
  // Guarda una URL en base64 temporal para previsualizar la foto en pantalla antes de ir a S3
 // public previsualizacionFotoUrl: string | null = null;
 public previsualizacionFotoUrl = signal<string | null>(null);

  // ==========================================================================
  // 4. CICLO DE VIDA E INICIALIZACIÓN
  // ==========================================================================
  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarEstudiantesDelServidor();
  }

  /**
   * Configura las reglas estrictas de validación para el registro y edición del alumno.
   */
  private inicializarFormulario(): void {
    this.estudianteForm = this.fb.group({
      idEstudiante: [null],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]], // Estricto: 8 dígitos numéricos
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      idSeccion: [1, [Validators.required]], // Asigna una sección válida por defecto
      edad: [null, [Validators.min(3), Validators.max(20)]],
      fechaNacimiento: [''],
      domicilio: [''],
      fotoUrl: [''],
      codigoMatricula: [''],
      estadoAlumno: ['Activo'],
      grupoSanguineo: [''],
      alergiasMedicas: ['Ninguna'],
      contactoEmergenciaTelf: ['']
    });
  }

  // ==========================================================================
  // 5. FLUJOS ASÍNCRONOS DIRECTOS CONTRA EL BACKEND (MÉTODOS CRUD)
  // ==========================================================================
  
  /**
   * Consume el método Listar del API Gateway e inyecta la respuesta en la señal reactiva.
   */
  public cargarEstudiantesDelServidor(): void {
    this.estaCargando.set(true);
    this.estudianteService.listarEstudiantes().subscribe({
      next: (data) => {
        this.listaEstudiantes.set(data);
        this.estaCargando.set(false);
      },
      error: (err) => {
        console.error('Error al listar alumnos en el frontend:', err);
        this.estaCargando.set(false);
      }
    });
  }

  /**
   * Dispara el flujo del detalle trayendo la data desde AWS RDS mediante coincidencia por ID.
   */
  public verDetalleAlumno(idEstudiante: number): void {
    this.estaCargando.set(true);
    this.estudianteService.obtenerDetalleEstudiante(idEstudiante).subscribe({
      next: (alumno) => {
        this.estudianteSeleccionado.set(alumno);
        this.estaCargando.set(false);
        this.vistaActiva.set('DETALLE'); // Cambia la vista mediante CSS puro
      },
      error: (err) => {
        console.error('Error al recuperar la ficha del alumno:', err);
        this.estaCargando.set(false);
      }
    });
  }

  // ==========================================================================
  // 6. GESTIÓN MULTIMEDIA Y CARGA ASÍNCRONA HACIA AMAZON S3
  // ==========================================================================

  /**
   * Captura el evento del input tipo FILE del HTML y genera la previsualización local.
   */
    /**
   * Captura el evento del input tipo FILE del HTML y gestiona la previsualización local.
   * Se fuerza la detección de cambios para garantizar que se dibuje a la primera selección.
   */
  public onFotoSeleccionada(event: any): void {
    const archivo: File = event.target.files[0]; // Corrección para asegurar la captura del archivo puro
    
    if (archivo) {
      this.archivoFotoSeleccionado = archivo;

      const reader = new FileReader();
      reader.onload = () => {
        // Asignamos la ruta en memoria
        //this.previsualizacionFotoUrl = reader.result as string;
        // 🟢 SOLUCIÓN: Usamos .set() para notificar inmediatamente a la vista
        this.previsualizacionFotoUrl.set(reader.result as string);

        // CRUCIAL: Forzamos a Angular a escanear la propiedad y redibujar el HTML de inmediato
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(archivo);
    } else {
      this.archivoFotoSeleccionado = null;
      //this.previsualizacionFotoUrl = null;
      this.previsualizacionFotoUrl.set(null);
      this.cdr.detectChanges();
    }
  }


    /**
   * CEREBRO DEL ENLACE TRANSACCIONAL: Modifica o registra sincronizando S3 y RDS en cascada.
   */
  public guardarCambiosEstudiante(): void {
    if (this.estudianteForm.invalid) {
      alert('Por favor, complete correctamente todos los campos mandatorios.');
      return;
    }

    this.estaCargando.set(true);
    
    // CORRECCIÓN: Extraemos el valor del formulario asegurando que capture campos ocultos/bloqueados
    const datosFormulario = this.estudianteForm.getRawValue();

    // BLINDAJE EXTRA: Si es edición, nos aseguramos al 100% de que el idEstudiante no viaje nulo
    if (this.esEdicion && !datosFormulario.idEstudiante && this.listaEstudiantes()) {
      // Si por alguna razón el formulario lo limpió, lo rescatamos del DNI que es único en pantalla
      const alumnoOriginal = this.listaEstudiantes().find(a => a.dni === datosFormulario.dni);
      if (alumnoOriginal) {
        datosFormulario.idEstudiante = alumnoOriginal.idEstudiante;
      }
    }

    // ESCENARIO A: Si el Director seleccionó una nueva foto, primero debemos subirla a S3 de forma obligatoria
    if (this.archivoFotoSeleccionado) {
      this.estudianteService.generarUrlPresignadaFoto(datosFormulario.dni).subscribe({
        next: (enlacesS3) => {
          // Subida en caliente directa al contenedor de Amazon S3 (Sin pasar por la Lambda)
          this.estudianteService.subirFotoDirectaS3(enlacesS3.urlUpload, this.archivoFotoSeleccionado!).subscribe({
            next: () => {
              // Asignamos la URL estática limpia devuelta por AWS a la propiedad del formulario
              datosFormulario.fotoUrl = enlacesS3.urlDestinoDB;
              this.ejecutarPersistenciaRDS(datosFormulario);
            },
            error: (errS3) => {
              console.error('Fallo crítico al depositar el binario en Amazon S3:', errS3);
              this.estaCargando.set(false);
            }
          });
        },
        error: (errSign) => {
          console.error('Fallo al recuperar firma digital de AWS:', errSign);
          this.estaCargando.set(false);
        }
      });
    } else {
      // ESCENARIO B: Si no se alteró la foto o se edita manteniendo la anterior, pasa directo a la base de datos
      this.ejecutarPersistenciaRDS(datosFormulario);
    }
  }


  /**
   * Consume las acciones de escritura de tu Lambda única de estudiantes según corresponda.
   */
  private ejecutarPersistenciaRDS(estudianteData: Estudiante): void {
    const peticion$ = this.esEdicion 
      ? this.estudianteService.actualizarEstudiante(estudianteData)
      : this.estudianteService.registrarEstudiante(estudianteData);

    peticion$.subscribe({
      next: () => {
        alert(this.esEdicion ? 'Expediente actualizado con éxito.' : 'Estudiante registrado correctamente.');
        this.regresarALista();
        this.cargarEstudiantesDelServidor(); // Refresca la tabla principal con los nuevos datos
      },
      error: (err) => {
        console.error('Error de persistencia relacional en Lambda/RDS:', err);
        this.estaCargando.set(false);
      }
    });
  }

  /**
   * Remueve físicamente el registro escolar solicitándolo a la Lambda única.
   */
  public eliminarAlumnoDelEcosistema(idEstudiante: number): void {
    if (confirm('¿Está totalmente seguro de remover a este estudiante de los registros institucionales?')) {
      this.estaCargando.set(true);
      this.estudianteService.eliminarEstudiante(idEstudiante).subscribe({
        next: () => {
          alert('Estudiante removido de forma conforme.');
          this.cargarEstudiantesDelServidor();
        },
        error: (err) => {
          console.error('Error al eliminar registro:', err);
          this.estaCargando.set(false);
        }
      });
    }
  }

  // ==========================================================================
  // 7. NAVEGACIÓN Y LIMPIEZA DE FLUJOS EN CALIENTE
  // ==========================================================================
  
  public irAFormularioCrear(): void {
    this.esEdicion = false;
    this.estudianteForm.reset({ estadoAlumno: 'Activo', alergiasMedicas: 'Ninguna', idSeccion: 1 });
    this.archivoFotoSeleccionado = null;
    //this.previsualizacionFotoUrl = null;
    this.previsualizacionFotoUrl.set(null); // Actualizado con .set()
    this.vistaActiva.set('FORMULARIO');
  }

  public irAFormularioEditar(alumno: Estudiante): void {
    this.esEdicion = true;
    this.archivoFotoSeleccionado = null;
    // Si ya cuenta con foto en S3, la cargamos directamente como previsualización
    //this.previsualizacionFotoUrl = alumno.fotoUrl || null;
    this.previsualizacionFotoUrl.set(alumno.fotoUrl || null); // Actualizado con .set()
    this.estudianteForm.patchValue(alumno);
    this.vistaActiva.set('FORMULARIO');
  }

  public regresarALista(): void {
    this.vistaActiva.set('LISTA');
    this.estudianteSeleccionado.set(null);
    this.paginaActual.set(1); // 🟢 REINICIO: Restaura la grilla siempre en el primer bloque de 7
  }

    /**
   * Decrementa el bloque visual regresando al set de alumnos anterior.
   */
  protected paginaAnterior(): void {
    if (this.paginaActual() > 1) {
      this.paginaActual.update(p => p - 1);
    }
  }

  /**
   * Avanza al siguiente set de 6 expedientes si existen registros en el búfer.
   */
  protected paginaSiguiente(): void {
    if (this.paginaActual() < this.obtenerTotalPaginas()) {
      this.paginaActual.update(p => p + 1);
    }
  }

}
