import { Injectable, inject } from '@angular/core';
// HttpClient faculta al frontend para interactuar por HTTP tanto con API Gateway como con Amazon S3
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FirmaSubidaResponse {
  urlSubidaFirmada: string;  // La compuerta temporal criptográfica para el método PUT hacia S3
  urlLecturaFinal: string;   // El enlace permanente largo que se almacenará en SQL Server
  nombreArchivoFinal: string; // El nombre sanitizado y único pre-calculado con timestamp en AWS
}

interface RegistroBaseDatosResponse {
  message: string;
}

@Injectable({
  providedIn: 'root' // Instancia única compartida de forma transparente para todo el ciclo de vida de Fátima Conecta
})
export class EvidenciasService {

  // Inyección de dependencias moderna de Angular libre de constructores acoplados
  private readonly http = inject(HttpClient);

  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/evidencias';

  public solicitarFirmaSubidaS3(idBitacora: number, nombreArchivo: string, tipoMime: string): Observable<FirmaSubidaResponse> {
    const payload = {
      accion: 'GENERAR_URL_SUBIDA',
      idBitacora: idBitacora,
      nombreArchivo: nombreArchivo,
      tipoMime: tipoMime
    };
    return this.http.post<FirmaSubidaResponse>(this.API_URL, payload);
  }

  public subirArchivoBinarioDirectoS3(urlSubidaFirmada: string, archivoFisico: File): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': archivoFisico.type
    });

    // Disparamos la petición PUT directa hacia el data center de S3 transmitiendo el binario puro
    return this.http.put(urlSubidaFirmada, archivoFisico, { headers });
  }

  public registrarEvidenciaEnBaseDatos(idBitacora: number, nombreArchivoFinal: string, urlLecturaFinal: string): Observable<RegistroBaseDatosResponse> {
    const payload = {
      accion: 'REGISTRAR_EVIDENCIA',
      idBitacora: idBitacora,
      nombreArchivoFinal: nombreArchivoFinal,
      urlLecturaFinal: urlLecturaFinal
    };
    return this.http.post<RegistroBaseDatosResponse>(this.API_URL, payload);
  }
}
