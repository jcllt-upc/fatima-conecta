import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para gobernar la estructura defensiva del Payload JSON hacia AWS
export interface RetroalimentacionPayload {
  accion: string;
  idEstudiante: number;
  recomendaciones: string;
  compromisos: string;
}

// Interfaz para tipar la respuesta transaccional del API Gateway
export interface RetroalimentacionResponse {
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RetroalimentacionService {
  // Inyección moderna de dependencias de Angular 19 sin constructores tradicionales
  private readonly http = inject(HttpClient);

  // URL del API Gateway que acabamos de desplegar e implementar formalmente en prod
  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/retroalimentacion';

  /**
   * Envía los bloques cualitativos de la fase final de cierre de bitácora escolar a AWS Lambda.
   * @param idEstudiante Código único del alumno en el contexto de memoria.
   * @param recomendaciones Bloque descriptivo redactado por el tutor.
   * @param compromisos Bloque de acuerdos del entorno familiar.
   */
  public registrarRetroalimentacion(
    idEstudiante: number, 
    recomendaciones: string, 
    compromisos: string
  ): Observable<RetroalimentacionResponse> {
    
    const payload: RetroalimentacionPayload = {
      accion: 'PUBLICAR_RETROALIMENTACION',
      idEstudiante,
      recomendaciones,
      compromisos
    };

    // Disparamos la petición POST de forma reactiva hacia la infraestructura cloud
    return this.http.post<RetroalimentacionResponse>(this.API_URL, payload);
  }
}
