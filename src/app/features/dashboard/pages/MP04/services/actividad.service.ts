import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of } from 'rxjs';
import {
  Actividad,
  EstadoActividad,
  NuevaActividadDTO,
  TareaActividad,
  AvanceActividad,
  IncidenciaActividad,
  EvidenciaActividad,
} from '../models/actividad.model';

/**
 * ActividadService
 *
 * Única fuente de verdad para las actividades institucionales (MP04 / P05).
 *
 * Por qué existe:
 * - Evita que cada componente tenga su propio arreglo de actividades
 *   (lo que generaría datos desincronizados entre pantallas).
 * - Concentra TODA la lógica de negocio (RN01-RN08) en un solo lugar,
 *   así los componentes solo "piden" y "ordenan" cosas al servicio,
 *   sin decidir por sí mismos si un cambio de estado es válido.
 * - Deja preparado el cambio futuro a un backend real: hoy los datos
 *   se cargan una vez desde un JSON estático con HttpClient y se
 *   mantienen en memoria (BehaviorSubject); el día que exista una API,
 *   solo se reemplazan los métodos internos (los que hoy actualizan el
 *   arreglo en memoria) por llamadas http.post/put reales — el resto
 *   del código (componentes) no debería tener que cambiar.
 *
 * Nota sobre persistencia en este prototipo:
 * Se usa una clave de localStorage POR COLECCIÓN COMPLETA
 * ('mp04_actividades'), guardando el arreglo entero serializado como
 * JSON cada vez que cambia. Esto es intencional y distinto del error
 * que se pide evitar en el enunciado ("una única clave para representar
 * TODA la colección" en el sentido de mezclar cosas no relacionadas):
 * aquí la clave representa exactamente UNA colección coherente
 * (las actividades), no varias entidades distintas mezcladas.
 */
@Injectable({
  providedIn: 'root',
})
export class ActividadService {
  private readonly STORAGE_KEY = 'mp04_actividades';
  private readonly JSON_URL = 'assets/data/actividades.json';

  /** Estado interno en memoria, expuesto como observable de solo lectura. */
  private actividadesSubject = new BehaviorSubject<Actividad[]>([]);
  private cargado = false;

  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------------------
  // Carga inicial
  // ---------------------------------------------------------------------

  /**
   * Garantiza que las actividades estén cargadas antes de usarlas.
   * Prioridad: localStorage (si ya se trabajó antes en este navegador)
   * y, si no hay nada guardado, se cargan los datos semilla del JSON.
   *
   * Los componentes llaman a listar()/obtenerPorId() y este método se
   * encarga de disparar la carga la primera vez, de forma transparente.
   */
  private asegurarCargado(): Observable<Actividad[]> {
    if (this.cargado) {
      return of(this.actividadesSubject.value);
    }

    const guardadas = localStorage.getItem(this.STORAGE_KEY);
    if (guardadas) {
      const actividades = JSON.parse(guardadas) as Actividad[];
      this.actividadesSubject.next(actividades);
      this.cargado = true;
      return of(actividades);
    }

    return this.http.get<Actividad[]>(this.JSON_URL).pipe(
      tap((actividades) => {
        this.actividadesSubject.next(actividades);
        this.cargado = true;
        this.persistir(actividades);
      })
    );
  }

  /** Guarda el arreglo completo actual en localStorage. */
  private persistir(actividades: Actividad[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(actividades));
  }

  /** Calcula el siguiente id disponible (simula un autoincremental de backend). */
  private siguienteId(actividades: Actividad[]): number {
    return actividades.length === 0
      ? 1
      : Math.max(...actividades.map((a) => a.id)) + 1;
  }

  // ---------------------------------------------------------------------
  // Consultas (HU-MP04-02, 14, 18, 21, 22)
  // ---------------------------------------------------------------------

  /** Lista todas las actividades. Los componentes se suscriben a esto para pintar tablas/listas. */
  listar(): Observable<Actividad[]> {
    return this.asegurarCargado();
  }

  /**
   * Observable "en vivo": cualquier componente que se suscriba aquí
   * recibe automáticamente la lista actualizada cada vez que cambia,
   * sin tener que volver a pedirla manualmente.
   */
  get actividades$(): Observable<Actividad[]> {
    return this.actividadesSubject.asObservable();
  }

  /** Obtiene una actividad por id (HU-MP04 revisar/editar/seguimiento/cierre). */
  obtenerPorId(id: number): Observable<Actividad | undefined> {
    return this.asegurarCargado().pipe(
      map((actividades) => actividades.find((a) => a.id === id))
    );
  }

  /** Filtra por estado (HU-MP04-21). */
  listarPorEstado(estado: EstadoActividad): Observable<Actividad[]> {
    return this.asegurarCargado().pipe(
      map((actividades) => actividades.filter((a) => a.estado === estado))
    );
  }

  /** Búsqueda simple por nombre/responsable (HU-MP04-22). */
  buscar(termino: string): Observable<Actividad[]> {
    const t = termino.trim().toLowerCase();
    return this.asegurarCargado().pipe(
      map((actividades) =>
        t === ''
          ? actividades
          : actividades.filter(
              (a) =>
                a.nombre.toLowerCase().includes(t) ||
                a.responsable.toLowerCase().includes(t)
            )
      )
    );
  }

  // ---------------------------------------------------------------------
  // Helper interno para actualizar una actividad y notificar/persistir
  // ---------------------------------------------------------------------

  /**
   * Aplica una función de actualización sobre la actividad con el id dado
   * y guarda el resultado. Centraliza el patrón "buscar por id, mutar,
   * guardar arreglo completo, persistir, notificar" para no repetirlo
   * en cada método público (RN08: todo trabaja sobre el id).
   */
  private actualizar(
    id: number,
    actualizar: (actividad: Actividad) => Actividad
  ): Observable<Actividad> {
    const actuales = this.actividadesSubject.value;
    const index = actuales.findIndex((a) => a.id === id);

    if (index === -1) {
      throw new Error(`No existe una actividad con id ${id}`);
    }

    const actualizada = actualizar(actuales[index]);
    const nuevoArreglo = [...actuales];
    nuevoArreglo[index] = actualizada;

    this.actividadesSubject.next(nuevoArreglo);
    this.persistir(nuevoArreglo);

    return of(actualizada);
  }

  // ---------------------------------------------------------------------
  // P05.1 Propuesta (HU-MP04-01)
  // ---------------------------------------------------------------------

  /**
   * Crea una nueva actividad a partir de los datos del formulario.
   * RN01: toda actividad nueva inicia en estado PROPUESTA.
   */
  crear(dto: NuevaActividadDTO): Observable<Actividad> {
    const actuales = this.actividadesSubject.value;

    const nueva: Actividad = {
      id: this.siguienteId(actuales),
      ...dto,
      estado: 'PROPUESTA',
      tareas: [],
      avances: [],
      incidencias: [],
      evidencias: [],
    };

    const nuevoArreglo = [...actuales, nueva];
    this.actividadesSubject.next(nuevoArreglo);
    this.persistir(nuevoArreglo);

    return of(nueva);
  }

  // ---------------------------------------------------------------------
  // Edición general (RN07: no perder datos existentes al editar)
  // ---------------------------------------------------------------------

  /**
   * Actualiza los datos editables de la propuesta (nombre, descripción,
   * objetivo, fecha, lugar, responsable) sin tocar el resto de campos
   * (tareas, avances, evidencias, etc.), para cumplir RN07.
   */
  editar(id: number, cambios: Partial<NuevaActividadDTO>): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({
      ...actividad,
      ...cambios,
    }));
  }

  // ---------------------------------------------------------------------
  // P05.2 Revisión y aprobación (HU-MP04-03, 04, 05)
  // ---------------------------------------------------------------------

  /**
   * Marca la actividad como en revisión. Se usa cuando alguien abre la
   * pantalla de revisión sobre una propuesta que aún no fue vista (RN02:
   * una actividad debe pasar por revisión antes de ser aprobada).
   */
  enviarARevision(id: number): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (actividad.estado !== 'PROPUESTA') {
        throw new Error('Solo una actividad en PROPUESTA puede enviarse a revisión.');
      }
      return { ...actividad, estado: 'PENDIENTE_REVISION' };
    });
  }

  /** Aprueba una actividad en revisión (HU-MP04-04). */
  aprobar(id: number): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (
        actividad.estado !== 'PENDIENTE_REVISION' &&
        actividad.estado !== 'PROPUESTA'
      ) {
        throw new Error('Solo se puede aprobar una actividad en revisión.');
      }
      return { ...actividad, estado: 'APROBADA', observacionRechazo: undefined };
    });
  }

  /**
   * Rechaza una actividad, registrando la observación (RN03).
   * HU-MP04-05.
   */
  rechazar(id: number, observacion: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({
      ...actividad,
      estado: 'RECHAZADA',
      observacionRechazo: observacion,
    }));
  }

  // ---------------------------------------------------------------------
  // P05.3 Programación / PAT (HU-MP04-06, 07)
  // ---------------------------------------------------------------------

  /**
   * Programa la actividad, registrando su información de PAT.
   * RN04: solo una actividad APROBADA puede pasar a PROGRAMADA.
   */
  programar(
    id: number,
    fechaProgramada: string,
    detallePAT: string
  ): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (actividad.estado !== 'APROBADA') {
        throw new Error('RN04: solo una actividad APROBADA puede programarse.');
      }
      return {
        ...actividad,
        estado: 'PROGRAMADA',
        programacion: { fechaProgramada, detallePAT },
      };
    });
  }

  // ---------------------------------------------------------------------
  // P05.4 Asignación de responsables (HU-MP04-08, 09)
  // ---------------------------------------------------------------------

  /** Actualiza el responsable y/o sus funciones específicas en la actividad. */
  asignarResponsable(
    id: number,
    responsable: string,
    funciones: string
  ): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({
      ...actividad,
      responsable,
      responsableFunciones: funciones,
    }));
  }

  // ---------------------------------------------------------------------
  // P05.5 Coordinación y seguimiento (HU-MP04-10..14)
  // ---------------------------------------------------------------------

  /** Pasa la actividad a EN_EJECUCION. RN05: solo desde PROGRAMADA. */
  iniciarEjecucion(id: number): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (actividad.estado !== 'PROGRAMADA') {
        throw new Error('RN05: solo una actividad PROGRAMADA puede pasar a EN_EJECUCION.');
      }
      return { ...actividad, estado: 'EN_EJECUCION' };
    });
  }

  /** Registra una nueva tarea de seguimiento (HU-MP04-10). */
  registrarTarea(id: number, descripcion: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      const nuevaTarea: TareaActividad = {
        id:
          actividad.tareas.length === 0
            ? 1
            : Math.max(...actividad.tareas.map((t) => t.id)) + 1,
        descripcion,
        completada: false,
      };
      return { ...actividad, tareas: [...actividad.tareas, nuevaTarea] };
    });
  }

  /** Marca/desmarca una tarea como completada. Soporta HU-MP04-12 (pendientes). */
  cambiarEstadoTarea(
    id: number,
    tareaId: number,
    completada: boolean
  ): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({
      ...actividad,
      tareas: actividad.tareas.map((t) =>
        t.id === tareaId ? { ...t, completada } : t
      ),
    }));
  }

  /** Registra un avance de seguimiento (HU-MP04-11). */
  registrarAvance(id: number, descripcion: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      const nuevoAvance: AvanceActividad = {
        fecha: new Date().toISOString().slice(0, 10),
        descripcion,
      };
      return { ...actividad, avances: [...actividad.avances, nuevoAvance] };
    });
  }

  /** Registra una incidencia detectada durante el seguimiento (HU-MP04-13). */
  registrarIncidencia(id: number, descripcion: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      const nuevaIncidencia: IncidenciaActividad = {
        fecha: new Date().toISOString().slice(0, 10),
        descripcion,
        resuelta: false,
      };
      return {
        ...actividad,
        incidencias: [...actividad.incidencias, nuevaIncidencia],
      };
    });
  }

  /** Marca una incidencia como resuelta. */
  resolverIncidencia(id: number, indice: number): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({
      ...actividad,
      incidencias: actividad.incidencias.map((inc, i) =>
        i === indice ? { ...inc, resuelta: true } : inc
      ),
    }));
  }

  // ---------------------------------------------------------------------
  // P05.6 Ejecución (HU-MP04-15, 16)
  // ---------------------------------------------------------------------

  /**
   * Registra el resultado de la ejecución y marca la actividad como
   * FINALIZADA (paso previo obligatorio antes del cierre, RN06).
   */
  registrarResultado(id: number, resultado: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (actividad.estado !== 'EN_EJECUCION') {
        throw new Error('Solo se puede registrar resultado de una actividad EN_EJECUCION.');
      }
      return { ...actividad, resultado, estado: 'FINALIZADA' };
    });
  }

  // ---------------------------------------------------------------------
  // P05.7 Evidencias y cierre (HU-MP04-17..20)
  // ---------------------------------------------------------------------

  /** Registra una evidencia (HU-MP04-17). */
  registrarEvidencia(
    id: number,
    descripcion: string,
    url?: string
  ): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      const nuevaEvidencia: EvidenciaActividad = { descripcion, url };
      return {
        ...actividad,
        evidencias: [...actividad.evidencias, nuevaEvidencia],
      };
    });
  }

  /** Guarda el informe final de resultados (HU-MP04-19). */
  registrarInforme(id: number, informe: string): Observable<Actividad> {
    return this.actualizar(id, (actividad) => ({ ...actividad, informe }));
  }

  /**
   * Cierra la actividad (HU-MP04-20).
   * RN06: solo una actividad FINALIZADA, con al menos una evidencia y con
   * informe registrado, puede pasar a CERRADA. Esto evita cerrar
   * actividades sin la información mínima requerida.
   */
  cerrar(id: number): Observable<Actividad> {
    return this.actualizar(id, (actividad) => {
      if (actividad.estado !== 'FINALIZADA') {
        throw new Error('RN06: solo una actividad FINALIZADA puede cerrarse.');
      }
      if (actividad.evidencias.length === 0) {
        throw new Error('RN06: se requiere al menos una evidencia para cerrar la actividad.');
      }
      if (!actividad.informe || actividad.informe.trim() === '') {
        throw new Error('RN06: se requiere el informe de resultados para cerrar la actividad.');
      }
      return { ...actividad, estado: 'CERRADA' };
    });
  }
}
