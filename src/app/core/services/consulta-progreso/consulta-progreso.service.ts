import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Estructura de la evidencia adjunta almacenada en S3
export interface EvidenciaAdjunta {
  nombre: string;
  url: string;
  tipo: 'pdf' | 'image';
}

// Contrato estricto del JSON de respuesta que acabamos de validar en Postman
export interface ProgresoPadreResponse {
  idFicha?: number;
  nombreAlumno?: string;
  bimestreDesc?: string;
  estadoFicha: string; // 'Publicado' o 'En Proceso'
  observacionesLogros?: string;
  observacionesDificultades?: string;
  recomendacionesTutor?: string;
  compromisosFamilia?: string;
  evidenciasAdjuntas?: EvidenciaAdjunta[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultaProgresoService {
  // Inyección moderna de dependencias de Angular 19
  private readonly http = inject(HttpClient);

  // URL del API Gateway productivo en AWS
  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/consulta-progreso';

  /**
   * Consulta el expediente pedagógico completo de los hijos asociados al idUsuario del Padre.
   * @param idUsuario Código único del apoderado autenticado en la sesión.
   */
  public obtenerProgresoHijo(idUsuario: number): Observable<ProgresoPadreResponse> {
    const payload = {
      accion: 'OBTENER_PROGRESO_PADRE',
      idUsuario
    };

    return this.http.post<ProgresoPadreResponse>(this.API_URL, payload);
  }
}
