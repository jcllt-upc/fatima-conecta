
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    correo: string;
    rol: string; // 'Docente' o 'Padre de Familia'
  };
}

@Injectable({
  providedIn: 'root' // Patrón Singleton: Única instancia lógica viva para toda la aplicación
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

   private readonly API_URL = 'https://fw6paaoszj.execute-api.us-east-1.amazonaws.com/prod/auth/login';

  public readonly rolUsuarioActual = signal<string | null>(localStorage.getItem('fc_user_rol'));

  public loginPorServidor(correo: string, passwordPlano: string): Observable<LoginResponse> {
    
    const payloadCredenciales = { correo, password: passwordPlano };

    return this.http.post<LoginResponse>(this.API_URL, payloadCredenciales).pipe(
      
      tap((respuestaAws) => {
        if (respuestaAws && respuestaAws.token) {
          localStorage.setItem('fc_auth_token', respuestaAws.token);
          localStorage.setItem('fc_user_rol', respuestaAws.user.rol);
          localStorage.setItem('fc_user_id', respuestaAws.user.id.toString());

          this.rolUsuarioActual.set(respuestaAws.user.rol);
        }
      })
    );
  }

  public cerrarSesion(): void {
    localStorage.removeItem('fc_auth_token');
    localStorage.removeItem('fc_user_rol');
    localStorage.removeItem('fc_user_id');
    localStorage.clear(); // Garantiza la limpieza absoluta de los contextos congelados del MP02
    this.rolUsuarioActual.set(null);

    this.router.navigate(['/login']);
  }
}
