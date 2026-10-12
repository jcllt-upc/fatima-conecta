import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


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

interface ListarAlumnosResponse {
  alumnos: EstudianteServidor[];
}


interface AperturarBitacoraResponse {
  message: string;
}

@Injectable({
  providedIn: 'root' // Singleton Global: Única instancia viva compartida para todo el ecosistema Fatima Conecta
})
export class ContextoEstudianteService {

  private readonly http = inject(HttpClient);

  private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/mp02-seguimiento/contexto';

  public obtenerCatalogoEstudiantes(): Observable<ListarAlumnosResponse> {
    // Declaración explícita del payload requerido por el patrón controlador unificado RPC del backend
    const payload = { accion: 'LISTAR_ALUMNOS' };
    // Dispara la solicitud vía POST enviando el payload y tipando la respuesta con la interfaz correspondiente.
    return this.http.post<ListarAlumnosResponse>(this.API_URL, payload);
  }


  public aperturarNuevaBitacora(idEstudiante: number, idPeriodo: number, idDocente: number): Observable<AperturarBitacoraResponse> {
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
