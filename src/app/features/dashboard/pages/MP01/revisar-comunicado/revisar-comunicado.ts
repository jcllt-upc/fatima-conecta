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
  nuevoComunicado: any = null;

  ngOnInit(): void {
  const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01');

  if (comunicadoGuardado) {
    this.nuevoComunicado = JSON.parse(comunicadoGuardado);
  }
}

  aprobarComunicado(): void {
  if (this.nuevoComunicado) {
    this.nuevoComunicado.estado = 'Aprobado';

    localStorage.setItem(
      'nuevo_comunicado_mp01',
      JSON.stringify(this.nuevoComunicado)
    );

    this.estado = 'Aprobado';
    this.mensaje = 'Comunicado aprobado correctamente.';
    return;
  }

    this.estado = 'Aprobado';
    this.mensaje = 'Comunicado aprobado correctamente.';
    localStorage.setItem('estado_comunicado_1', 'Aprobado');
  }

  rechazarComunicado(): void {
  if (this.nuevoComunicado) {
    this.nuevoComunicado.estado = 'Rechazado';

    localStorage.setItem(
      'nuevo_comunicado_mp01',
      JSON.stringify(this.nuevoComunicado)
    );

    this.estado = 'Rechazado';
    this.mensaje = 'Comunicado rechazado.';
    return;
  }

  this.estado = 'Rechazado';
  this.mensaje = 'Comunicado rechazado.';
  localStorage.setItem('estado_comunicado_1', 'Rechazado');
  }
}
