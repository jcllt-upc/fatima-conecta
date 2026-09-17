import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-revisar-comunicado',
  styleUrl: './revisar-comunicado.css',
  templateUrl: './revisar-comunicado.html',
})
export class RevisarComunicado {
  estado: string = 'Pendiente de revisión';
  mensaje: string = '';

  aprobarComunicado(): void {
    this.estado = 'Aprobado';
    this.mensaje = 'Comunicado aprobado correctamente.';

    localStorage.setItem('estado_comunicado_1', 'Aprobado');
  }

  rechazarComunicado(): void {
    this.estado = 'Rechazado';
    this.mensaje = 'Comunicado rechazado.';

    localStorage.setItem('estado_comunicado_1', 'Rechazado');
  }
}
