/**
 * INTERFAZ DE MODELO (CONTRATO DE DATOS GLOBAL): Define la estructura estricta de un Alumno.
 * Centralizado en la capa 'Core' para que pueda ser consumido por cualquier componente o Macroproceso del sistema.
 */
export interface Estudiante {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  gradoSeccion: string;
}
