import { Injectable, inject } from '@angular/core';
// HttpClient faculta al componente para disparar peticiones REST asíncronas hacia la nube
// El módulo HttpClient dota a la clase de la capacidad de despachar solicitudes HTTP (GET, POST, etc.) 
// de manera asíncrona hacia la nube, comunicando la interfaz del navegador con AWS sin congelar la pantalla.
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * INTERFAZ ESTRICTA DE ENTRADA: Mapea los campos de los estudiantes recuperados
 * mediante el INNER JOIN multitabla de tu AWS Lambda (Acción LISTAR_ALUMNOS).
 * 📋 FUNCIÓN EN EL SISTEMA - INTERFAZ DE TIPADO ESTRICTO DE DATOS DE UN ESTUDIANTE:
 * Actúa como un contrato de tipado en TypeScript. Asegura que cualquier objeto de tipo 'EstudianteServidor'
 * contenga exactamente las mismas propiedades calculadas y enviadas por el script de Python en AWS Lambda.
 * Esto evita errores en tiempo de desarrollo si se intenta acceder a un campo inexistente o mal escrito.
 */
export interface EstudianteServidor {
  idEstudiante: number; // Llave primaria del alumno en la tabla dbo.Estudiantes de SQL Server.
  dni: string; // Documento Nacional de Identidad para auditorías visuales en el frontend.
  nombres: string; // Nombre de pila del alumno.
  apellidos: string; // Apellidos paterno y materno del alumno.
  grado: string; // Año escolar al que pertenece(ej: "5to de Primaria").
  seccion: string; // Letra de asignación del aula (ej: "A").
  nombreCompleto: string; // Formato pre-calculado en Python: "Apellidos, Nombres"
  aulaDetalle: string;    // Formato pre-calculado en Python: "Grado - Sección"
}

/**
 * INTERFAZ DE RESPUESTA PARA EL LISTADO (CÓDIGO HTTP 200 OK)
 * 📋 FUNCIÓN EN EL SISTEMA - INTERFAZ DE CONTRATO PARA EL LISTADO (HTTP 200 OK):
 * Estructura la forma del objeto JSON esperado en el cuerpo de la respuesta cuando la acción
 * en AWS Lambda es exitosa. Le dice a Angular que la respuesta llegará envuelta en un nodo llamado 'alumnos'.
 */
interface ListarAlumnosResponse {
  alumnos: EstudianteServidor[];
}

/**
 * INTERFAZ DE RESPUESTA PARA LA INSERCIÓN FÍSICA (CÓDIGO HTTP 201 CREATED)
 * 📋 FUNCIÓN EN EL SISTEMA - INTERFAZ DE CONTRATO PARA LA CREACIÓN(HTTP 201 CREATED):
 * Mapea la estructura de respuesta cuando se completa un registro en el servidor. Captura el string
 * de confirmación("Bitácora Pedagógica aperturada con éxito") emitido tras el COMMIT físico en RDS.
 */
interface AperturarBitacoraResponse {
  message: string;
}

/**
 * 📋 FUNCIÓN EN EL SISTEMA - DECORADOR DE INYECCIÓN GLOBAL:
 * Declara que esta clase es un servicio inyectable. El parámetro 'providedIn: root' lo define como un
 * Singleton Global; es decir, Angular creará una única instancia en memoria para toda la aplicación,
 * optimizando el rendimiento y permitiendo compartir el estado de este módulo en cualquier pantalla.
 */
@Injectable({
  providedIn: 'root' // Singleton Global: Única instancia viva compartida para todo el ecosistema Fatima Conecta
})
export class ContextoEstudianteService {

  // Inyección moderna de dependencias de Angular sin constructores acoplados
  //📋 FUNCIÓN EN EL SISTEMA - INYECCIÓN MODERNA DE CLIENTE HTTP:
  // Reemplaza el antiguo acoplamiento por constructor de Angular mediante la función nativa 'inject()'.
  // Inicializa la propiedad privada 'http' con el motor de red para procesar las llamadas AJAX hacia AWS.
  private readonly http = inject(HttpClient);

   // 🚀 ENDPOINT MULTI-ACCIÓN PUBLICADO EN PRODUCCIÓN DESDE AMAZON API GATEWAY
   // 📋 FUNCIÓN EN EL SISTEMA - PASARELA DE ENLACE DE PRODUCCIÓN(GATEWAY URL):
   // Almacena de forma inmutable la dirección URL pública provista por Amazon API Gateway. 
   // Es la puerta de acceso única al microservicio Serverless del Módulo de Seguimiento(MP02).
  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/contexto';

  /**
   * ACCIÓN A (LISTAR): Consume el listado de alumnos para el buscador interactivo.
   * Envía la bandera 'LISTAR_ALUMNOS' para que Python ejecute el SELECT en AWS RDS.
   * 🚀 ACCIÓN A (LISTAR): CONSULTA INTERACTIVA DE ESTUDIANTES PARA LA UI
   * --------------------------------------------------------------------------
   * @returns Un flujo Observable que emitirá el listado de alumnos cuando responda la nube.
   * FUNCIÓN EN EL SISTEMA: Es invocada por el componente del buscador en Angular cuando se inicializa la pantalla.
   * Empaqueta el objeto JSON con la bandera clave 'accion: LISTAR_ALUMNOS' para indicarle a la Lambda de Python
   * que debe activar la ruta lógica del SELECT multitabla sobre AWS RDS SQL Server en lugar de insertar datos.
   */
  public obtenerCatalogoEstudiantes(): Observable<ListarAlumnosResponse> {
    // Declaración explícita del payload requerido por el patrón controlador unificado RPC del backend
    const payload = { accion: 'LISTAR_ALUMNOS' };
    // Dispara la solicitud vía POST enviando el payload y tipando la respuesta con la interfaz correspondiente.
    return this.http.post<ListarAlumnosResponse>(this.API_URL, payload);
  }

  /**
   * ACCIÓN B (APERTURAR): Funda físicamente la Bitácora Pedagógica en la base de datos (INSERT INTO).
   * Recibe las llaves foráneas requeridas por las restricciones de integridad relacional de SQL Server.
   * 🚀 ACCIÓN B (APERTURAR): INICIALIZACIÓN FÍSICA DE LA FICHA PEDAGÓGICA (CRUD)
   * --------------------------------------------------------------------------
   * @param idEstudiante Clave foránea del estudiante seleccionado en la interfaz.
   * @param idPeriodo Clave foránea del bimestre escolar activo en el sistema.
   * @param idDocente Clave foránea del profesor que realiza el seguimiento.
   * @returns Un flujo Observable con el mensaje de confirmación del servidor de base de datos.
   * 
   * FUNCIÓN EN EL SISTEMA: Se ejecuta cuando el docente hace clic en el botón para iniciar la bitácora del alumno.
   * Recopila los IDs de la vista y construye el JSON con los nombres exactos de propiedades que mapea el script
   * de Python (idEstudiante, idPeriodo, idDocente) para ejecutar de forma segura el INSERT INTO y fundar el registro.
   */
  public aperturarNuevaBitacora(idEstudiante: number, idPeriodo: number, idDocente: number): Observable<AperturarBitacoraResponse> {
    // El payload contiene los nombres de propiedades exactos mapeados en las líneas 76-78 de tu Lambda en Python
    // Estructuración del cuerpo de datos respetando las restricciones de integridad relacional del backend
    const payload = {
      accion: 'APERTURAR_BITACORA', // Bandera quirúrgica para enrutar el flujo al bloque INSERT de Python
      idEstudiante: idEstudiante,
      idPeriodo: idPeriodo,
      idDocente: idDocente
    };
    
    // Despacha la solicitud POST asíncrona hacia AWS y expone el flujo Observable para que el componente se suscriba.
    return this.http.post<AperturarBitacoraResponse>(this.API_URL, payload);
  }
}
