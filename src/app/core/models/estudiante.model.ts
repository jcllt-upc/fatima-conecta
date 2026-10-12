
export interface Estudiante {
  // Campos base obligatorios que ya utiliza el sistema
  idEstudiante: number;
  dni: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  idSeccion: number;
  grado: string;
  seccion: string;
  aulaDetalle: string;

  edad?: number | null;
  fechaNacimiento?: string | null;
  domicilio?: string | null;
  fotoUrl?: string | null;            // Almacenará la URL final apuntando a Amazon S3
  codigoMatricula?: string | null;
  estadoAlumno?: string;              // 'Activo', 'Inactivo', etc.
  grupoSanguineo?: string | null;
  alergiasMedicas?: string;           // Inicializado por defecto en 'Ninguna'
  contactoEmergenciaTelf?: string | null;
  correoInstitucional?: string;      // Resuelto en la consulta desde la tabla Usuarios
}
