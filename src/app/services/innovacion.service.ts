import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InnovacionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/innovacion'; 

  registrarProyecto(proyecto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, proyecto);
  }

  subirEvidencia(proyectoId: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/${proyectoId}/evidencias`, formData);
  }

  validarProyecto(proyectoId: string, estado: string, observaciones: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${proyectoId}/validacion`, { estado, observaciones });
  }

  publicarProyecto(proyectoId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${proyectoId}/publicacion`, {});
  }

  consultarProyectosPublicos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo`);
  }
}