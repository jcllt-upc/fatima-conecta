import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-gestion-comunicados',
  styleUrl: './gestion-comunicados.css',
  templateUrl: './gestion-comunicados.html',
})
export class GestionComunicados {

  estadoComunicado1: string = 'Pendiente';
  nuevoComunicado: any = null;

  ngOnInit(): void {
    const estadoGuardado = localStorage.getItem('estado_comunicado_1');

    if (estadoGuardado) {
      this.estadoComunicado1 = estadoGuardado;
    }

    const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01');

    if (comunicadoGuardado) {
      this.nuevoComunicado = JSON.parse(comunicadoGuardado);
    }
  }

  publicarComunicado1(): void {
    this.estadoComunicado1 = 'Publicado';

    localStorage.setItem('estado_comunicado_1', 'Publicado');
  }

  publicarNuevoComunicado(): void {
  if (!this.nuevoComunicado) {
    return;
  }

  this.nuevoComunicado.estado = 'Publicado';
  this.nuevoComunicado.fechaPublicacion = new Date().toISOString();

  localStorage.setItem(
    'nuevo_comunicado_mp01',
    JSON.stringify(this.nuevoComunicado)
  );
}



}


