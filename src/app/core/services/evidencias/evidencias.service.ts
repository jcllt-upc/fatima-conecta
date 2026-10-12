import { Injectable, inject } from '@angular/core';
// HttpClient faculta al frontend para interactuar por HTTP tanto con API Gateway como con Amazon S3
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * INTERFAZ: Define la respuesta estructural de AWS al solicitar un pase de subida.
 * Devuelve la URL firmada temporal de 5 minutos y las rutas finales de guardado.
 */
export interface FirmaSubidaResponse {
  urlSubidaFirmada: string;  // La compuerta temporal criptográfica para el método PUT hacia S3
  urlLecturaFinal: string;   // El enlace permanente largo que se almacenará en SQL Server
  nombreArchivoFinal: string; // El nombre sanitizado y único pre-calculado con timestamp en AWS
}

/**
 * INTERFAZ: Define el mensaje estándar de éxito al inyectar metadatos en RDS.
 */
interface RegistroBaseDatosResponse {
  message: string;
}

@Injectable({
  providedIn: 'root' // Instancia única compartida de forma transparente para todo el ciclo de vida de Fátima Conecta
})
export class EvidenciasService {

  // Inyección de dependencias moderna de Angular libre de constructores acoplados
  private readonly http = inject(HttpClient);

  /**
   * 🚀 ENDPOINT MULTI-ACCIÓN PUBLICADO EN PRODUCCIÓN DESDE AMAZON API GATEWAY
   */
  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/evidencias';

  /**
   * ACCIÓN 1: SOLICITAR LLAVE DIGITAL DE SUBIDA (API GATEWAY -> AWS LAMBDA)
   * Envía la bandera 'GENERAR_URL_SUBIDA' junto a los metadatos básicos del archivo.
   * AWS validará la solicitud y firmará un pase criptográfico válido por 5 minutos exactos.
   */
  public solicitarFirmaSubidaS3(idBitacora: number, nombreArchivo: string, tipoMime: string): Observable<FirmaSubidaResponse> {
    const payload = {
      accion: 'GENERAR_URL_SUBIDA',
      idBitacora: idBitacora,
      nombreArchivo: nombreArchivo,
      tipoMime: tipoMime
    };
    return this.http.post<FirmaSubidaResponse>(this.API_URL, payload);
  }

  /**
   * ACCIÓN 2: TRANSFERENCIA BINARIA DIRECTA AL CONTENEDOR (HTTP PUT -> AMAZON S3)
   * Toma el archivo físico puro que el profesor arrastró en la Dropzone y lo inyecta
   * de forma asíncrona directamente en S3 usando la URL pre-firmada criptográfica.
   * Evita saturar el backend transmitiendo los bytes de forma aislada y ultra rápida.
   */
  public subirArchivoBinarioDirectoS3(urlSubidaFirmada: string, archivoFisico: File): Observable<any> {
    // S3 exige de forma obligatoria que la cabecera Content-Type coincida milimétricamente
    // con el tipo MIME que se utilizó al momento de calcular la firma criptográfica en Python
    const headers = new HttpHeaders({
      'Content-Type': archivoFisico.type
    });

    // Disparamos la petición PUT directa hacia el data center de S3 transmitiendo el binario puro
    return this.http.put(urlSubidaFirmada, archivoFisico, { headers });
  }

  /**
   * ACCIÓN 3: CONSOLIDAR EL RASTRO LÓGICO EN EL SISTEMA (API GATEWAY -> AWS LAMBDA -> AWS RDS)
   * Una vez que S3 confirma el guardado físico, enviamos este payload de texto ligero para realizar
   * el INSERT INTO en la tabla hija dbo.Evidencias_Multimedia amarrándolo de forma legal a la bitácora padre.
   */
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
