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

  public listarEstudiantes(): Observable<Estudiante[]> {
    const payload = { accion: 'LISTAR_ESTUDIANTES' };
    
    return this.http.post<{ estudiantes: Estudiante[] }>(this.URL_API, payload).pipe(
      map(response => response.estudiantes)
    );
  }

  public obtenerDetalleEstudiante(idEstudiante: number): Observable<Estudiante> {
    const payload = { 
      accion: 'OBTENER_ESTUDIANTE', 
      idEstudiante: idEstudiante 
    };

    return this.http.post<{ estudiante: Estudiante }>(this.URL_API, payload).pipe(
      map(response => response.estudiante)
    );
  }

  public generarUrlPresignadaFoto(dni: string): Observable<{ urlUpload: string; urlDestinoDB: string }> {
    const payload = { 
      accion: 'GENERAR_URL_FOTO', 
      dni: dni 
    };

    return this.http.post<{ urlUpload: string; urlDestinoDB: string }>(this.URL_API, payload);
  }

  public subirFotoDirectaS3(urlPresignada: string, archivo: File): Observable<any> {
    // Es crítico enviar el archivo puro sin envolverlo en FormData para no corromper la firma digital de AWS
    return this.http.put(urlPresignada, archivo, {
      headers: { 'Content-Type': 'image/jpeg' }
    });
  }

  public registrarEstudiante(estudiante: Estudiante): Observable<any> {
    const payload = {
      accion: 'REGISTRAR_ESTUDIANTE',
      ...estudiante // Esparcimos todas las propiedades del objeto de forma limpia
    };

    return this.http.post(this.URL_API, payload);
  }

  public actualizarEstudiante(estudiante: Estudiante): Observable<any> {
    const payload = {
      accion: 'ACTUALIZAR_ESTUDIANTE',
      ...estudiante
    };

    return this.http.post(this.URL_API, payload);
  }

  public eliminarEstudiante(idEstudiante: number): Observable<any> {
    const payload = {
      accion: 'ELIMINAR_ESTUDIANTE',
      idEstudiante: idEstudiante
    };

    return this.http.post(this.URL_API, payload);
  }
}
