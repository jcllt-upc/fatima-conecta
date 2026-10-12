
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Comunicado {

  constructor(private http: HttpClient) {}

  // GET: Obtener todos los comunicados
  getComunicados() {
    return this.http.get<any>(
      'https://vnbulculbj.execute-api.us-east-1.amazonaws.com/v1/comunicados',
      { responseType: 'json' }
    );
  }

  // GET: Obtener un comunicado por su ID
  getComunicadoPorId(id: string) {
    return this.http.get<any>(
      `https://vnbulculbj.execute-api.us-east-1.amazonaws.com/v1/comunicado?id_comunicado=${id}`,
      { responseType: 'json' }
    );
  }

  // POST: Crear un nuevo comunicado
  crearComunicado(datos: any) {
    return this.http.post<any>(
      'https://vnbulculbj.execute-api.us-east-1.amazonaws.com/v1/comunicado',
      datos,
      { responseType: 'json' }
    );
  }

  // PUT: Actualizar el estado de un comunicado
  actualizarEstado(id_comunicado: number, id_estado: number) {
    return this.http.put<any>(
      'https://vnbulculbj.execute-api.us-east-1.amazonaws.com/v1/comunicado',
      {
        id_comunicado: id_comunicado,
        id_estado: id_estado
      },
      { responseType: 'json' }
    );
  }

  // DELETE: Eliminar un comunicado
  eliminarComunicado(id_comunicado: number) {
    return this.http.request<any>(
      'DELETE',
      'https://vnbulculbj.execute-api.us-east-1.amazonaws.com/v1/comunicado',
      {
        body: {
          id_comunicado: id_comunicado
        },
        responseType: 'json'
      }
    );
  }

}
