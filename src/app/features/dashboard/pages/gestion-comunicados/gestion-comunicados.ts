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

  ngOnInit(): void {
    const estadoGuardado = localStorage.getItem('estado_comunicado_1');

    if (estadoGuardado) {
      this.estadoComunicado1 = estadoGuardado;
    }
  }

  publicarComunicado1(): void {
    this.estadoComunicado1 = 'Publicado';

    localStorage.setItem('estado_comunicado_1', 'Publicado');
  }

}


