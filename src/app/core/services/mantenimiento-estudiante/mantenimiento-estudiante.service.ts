import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Estudiante } from '../../models/estudiante.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoEstudianteService {
  
  // Inyección funcional y moderna del cliente HTTP (Elimina la necesidad de usar constructores rígidos)
  private readonly http = inject(HttpClient);

  // URL Base pública oficial de tu pasarela desplegada en Amazon API Gateway
  private readonly URL_API = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/estudiantes';

  /**
   * MÉTODO 1: LISTAR TODOS LOS ESTUDIANTES
   * Dispara una petición POST enviando la acción correspondiente.
   * Utiliza operadores RxJS para desempaquetar la respuesta y retornar únicamente el arreglo de alumnos.
   */
  public listarEstudiantes(): Observable<Estudiante[]> {
    const payload = { accion: 'LISTAR_ESTUDIANTES' };
    
    return this.http.post<{ estudiantes: Estudiante[] }>(this.URL_API, payload).pipe(
      map(response => response.estudiantes)
    );
  }

  /**
   * MÉTODO 2: OBTENER DETALLE INDIVIDUAL DE UN ESTUDIANTE
   * Extrae de forma quirúrgica todo el expediente médico, institucional y de contacto de un único alumno.
   * @param idEstudiante Identificador físico correlativo de la tabla SQL Server
   */
  public obtenerDetalleEstudiante(idEstudiante: number): Observable<Estudiante> {
    const payload = { 
      accion: 'OBTENER_ESTUDIANTE', 
      idEstudiante: idEstudiante 
    };

    return this.http.post<{ estudiante: Estudiante }>(this.URL_API, payload).pipe(
      map(response => response.estudiante)
    );
  }

  /**
   * MÉTODO 3: GENERAR URL PRE-FIRMADA DE AWS S3 PARA LA FOTO
   * Solicita al backend una autorización de subida temporal en la nube vinculada estrictamente al DNI.
   * @param dni Documento de identidad del alumno que servirá de nombre para el archivo físico (.jpg)
   * @returns Retorna un objeto con la URL de subida para Post/Put y la URL estática de lectura final
   */
  public generarUrlPresignadaFoto(dni: string): Observable<{ urlUpload: string; urlDestinoDB: string }> {
    const payload = { 
      accion: 'GENERAR_URL_FOTO', 
      dni: dni 
    };

    return this.http.post<{ urlUpload: string; urlDestinoDB: string }>(this.URL_API, payload);
  }

  /**
   * MÉTODO 4: SUBIR IMAGEN DIRECTA A BUCKET S3 (SALTO DE BACKEND)
   * Toma el archivo binario capturado por el input del formulario y lo deposita en S3 mediante la URL pre-firmada.
   * @param urlPresignada Enlace temporal extendido generado por AWS boto3
   * @param archivo Fichero binario puro (.jpg/.jpeg) seleccionado por el usuario
   */
  public subirFotoDirectaS3(urlPresignada: string, archivo: File): Observable<any> {
    // Es crítico enviar el archivo puro sin envolverlo en FormData para no corromper la firma digital de AWS
    return this.http.put(urlPresignada, archivo, {
      headers: { 'Content-Type': 'image/jpeg' }
    });
  }

  /**
   * MÉTODO 5: REGISTRAR UN NUEVO ESTUDIANTE
   * Envía toda la data recolectada del formulario hacia la Lambda para crear en cascada su Usuario y su Expediente.
   * @param estudiante Objeto estructurado conforme al modelo con los datos del nuevo registro
   */
  public registrarEstudiante(estudiante: Estudiante): Observable<any> {
    const payload = {
      accion: 'REGISTRAR_ESTUDIANTE',
      ...estudiante // Esparcimos todas las propiedades del objeto de forma limpia
    };

    return this.http.post(this.URL_API, payload);
  }

  /**
   * MÉTODO 6: ACTUALIZAR EXPEDIENTE ESCOLAR
   * Modifica los datos médicos, personales o la foto de un alumno existente mediante coincidencia por ID.
   * @param estudiante Objeto con la información modificada que impactará el query UPDATE
   */
  public actualizarEstudiante(estudiante: Estudiante): Observable<any> {
    const payload = {
      accion: 'ACTUALIZAR_ESTUDIANTE',
      ...estudiante
    };

    return this.http.post(this.URL_API, payload);
  }

  /**
   * MÉTODO 7: ELIMINAR REGISTRO DE ESTUDIANTE
   * Ejecuta la purga o remoción del alumno de la base de datos de AWS RDS.
   * @param idEstudiante Identificador del alumno a remover
   */
  public eliminarEstudiante(idEstudiante: number): Observable<any> {
    const payload = {
      accion: 'ELIMINAR_ESTUDIANTE',
      idEstudiante: idEstudiante
    };

    return this.http.post(this.URL_API, payload);
  }
}
