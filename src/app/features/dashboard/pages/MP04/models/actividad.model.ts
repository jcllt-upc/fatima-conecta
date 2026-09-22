/**
 * MP04 — Gestión de Actividades Institucionales
 * Modelo de datos central del módulo.
 *
 * Todo componente y el servicio importan estas interfaces desde aquí,
 * para que exista una única "fuente de verdad" sobre la forma de una Actividad.
 */

/**
 * Estados posibles de una actividad institucional.
 * Centralizados en un solo tipo para evitar strings sueltos repetidos
 * (y con distinto texto) en cada componente.
 */
export type EstadoActividad =
  | 'PROPUESTA'
  | 'PENDIENTE_REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'PROGRAMADA'
  | 'EN_EJECUCION'
  | 'FINALIZADA'
  | 'CERRADA';

/**
 * Lista ordenada de todos los estados, útil para poblar selects/filtros
 * en la interfaz sin repetir el arreglo de estados en cada componente.
 */
export const ESTADOS_ACTIVIDAD: EstadoActividad[] = [
  'PROPUESTA',
  'PENDIENTE_REVISION',
  'APROBADA',
  'RECHAZADA',
  'PROGRAMADA',
  'EN_EJECUCION',
  'FINALIZADA',
  'CERRADA',
];

/**
 * Una tarea puntual dentro del seguimiento de la actividad (P05.5).
 * Se usa una lista de tareas en vez de un solo campo de texto porque
 * una actividad institucional normalmente involucra varias tareas
 * paralelas (ej. "reservar auditorio", "imprimir diplomas", etc.).
 */
export interface TareaActividad {
  id: number;
  descripcion: string;
  completada: boolean;
}

/**
 * Un avance reportado durante la coordinación y seguimiento (P05.5).
 * Se guarda como historial (lista) y no como un único campo,
 * porque el seguimiento de una actividad ocurre en varios momentos.
 */
export interface AvanceActividad {
  fecha: string; // formato ISO (yyyy-MM-dd), coherente con el resto del modelo
  descripcion: string;
}

/**
 * Una incidencia (problema/riesgo) detectada durante el seguimiento (P05.5).
 * Se modela aparte de "avances" porque conceptualmente son cosas distintas:
 * un avance es progreso, una incidencia es un problema que puede necesitar
 * atención antes de seguir avanzando.
 */
export interface IncidenciaActividad {
  fecha: string;
  descripcion: string;
  resuelta: boolean;
}

/**
 * Una evidencia registrada en el cierre (P05.7).
 * "url" es opcional porque en este prototipo no hay backend ni carga real
 * de archivos: por ahora solo se guarda una referencia/descr. de la evidencia.
 */
export interface EvidenciaActividad {
  descripcion: string;
  url?: string;
}

/**
 * Información de programación / PAT (Plan Anual de Trabajo) de la actividad (P05.3).
 * Se agrupa en un sub-objeto (en vez de campos sueltos en Actividad) porque
 * solo tiene sentido cuando la actividad ya fue aprobada y programada.
 */
export interface ProgramacionActividad {
  fechaProgramada: string;
  detallePAT: string;
}

/**
 * Entidad principal del módulo MP04.
 *
 * Nota de diseño: en vez de crear una interfaz separada por cada subproceso
 * (P05.1...P05.7), se usa UNA sola interfaz Actividad con campos/objetos
 * opcionales que se van completando a medida que la actividad avanza de
 * estado. Esto evita sobreingeniería (no se necesitan 7 modelos ni
 * conversiones entre ellos) y refleja que es la MISMA actividad la que
 * atraviesa todo el ciclo de vida, solo que con más información en cada etapa.
 */
export interface Actividad {
  /** Identificador único. Todas las operaciones del service trabajan por id (RN08). */
  id: number;

  // --- P05.1 Propuesta ---
  /** Nombre corto de la actividad (ej. "Feria Científica 2026"). */
  nombre: string;
  /** Descripción general de en qué consiste la actividad. */
  descripcion: string;
  /** Objetivo institucional que persigue la actividad. */
  objetivo: string;
  /** Fecha propuesta/planificada, formato ISO (yyyy-MM-dd). */
  fecha: string;
  /** Lugar donde se realizará. */
  lugar: string;
  /** Docente/área responsable de la actividad. */
  responsable: string;
  /** Estado actual dentro del flujo P05 (ver EstadoActividad). */
  estado: EstadoActividad;

  // --- P05.2 Revisión y aprobación ---
  /** Observación registrada si la actividad fue RECHAZADA (RN03: se conserva). */
  observacionRechazo?: string;

  // --- P05.3 Programación / PAT ---
  programacion?: ProgramacionActividad;

  // --- P05.4 Asignación de responsables ---
  /** Funciones/rol específico que cumple el responsable en esta actividad. */
  responsableFunciones?: string;

  // --- P05.5 Coordinación y seguimiento ---
  tareas: TareaActividad[];
  avances: AvanceActividad[];
  incidencias: IncidenciaActividad[];

  // --- P05.6 Ejecución ---
  /** Resultado narrado de cómo se ejecutó la actividad. */
  resultado?: string;

  // --- P05.7 Evidencias y cierre ---
  evidencias: EvidenciaActividad[];
  /** Informe final de resultados, redactado al cerrar la actividad. */
  informe?: string;
}

/**
 * Forma de los datos que se piden en el formulario de creación (P05.1).
 * Es un subconjunto de Actividad: al crear, todavía no existen id, estado
 * definitivo, ni las listas de seguimiento/evidencias (se inicializan vacías
 * en el servicio). Separar este tipo evita que el formulario "sepa" de
 * campos que no le corresponden en esta etapa.
 */
export type NuevaActividadDTO = Pick<
  Actividad,
  'nombre' | 'descripcion' | 'objetivo' | 'fecha' | 'lugar' | 'responsable'
>;
