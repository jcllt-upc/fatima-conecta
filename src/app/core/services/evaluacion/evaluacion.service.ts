import { Injectable, inject } from '@angular/core';
// HttpClient faculta al framework para orquestar y emitir solicitudes REST por internet hacia AWS
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * INTERFAZ ESTÁNDAR: Sella el contrato del mensaje que devuelve la pasarela API Gateway.
 */
interface EvaluacionResponse {
  message: string;
}

@Injectable({
  // Mantiene una instancia única compartida (Singleton) flotando en la memoria RAM del Portal Institucional
  providedIn: 'root'
})
export class EvaluacionService {

  // Inyección de dependencias moderna libre de constructores acoplados
  private readonly http = inject(HttpClient);

  /**
   * 🚀 ENDPOINT OFICIAL DE PRODUCCIÓN EXPUESTO DESDE AMAZON API GATEWAY
   */
  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/evaluacion';

  /**
   * CONEXIÓN ASÍNCRONA: ENVIAR LOGROS Y DIFICULTADES (HU12 - EVALUACIÓN Y PROGRESO)
   * Toma el identificador del alumno junto a las dos redacciones descriptivas, arma el JSON 
   * transaccional parametrizado y lo dispara hacia el cerebro en Python para impactar el SQL Server.
   */
  public guardarEvaluacionCualitativa(idEstudiante: number, logros: string, dificultades: string): Observable<EvaluacionResponse> {
    const payload = {
      accion: 'GUARDAR_EVALUACION',
      idEstudiante: idEstudiante,
      logros: logros,
      dificultades: dificultades
    };
    
    // Disparamos la petición POST por internet esperando la confirmación del cambio de estado
    return this.http.post<EvaluacionResponse>(this.API_URL, payload);
  }
}
