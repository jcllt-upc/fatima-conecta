import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-comunicados',
  styleUrl: './comunicados.css',
  templateUrl: './comunicados.html',
})
export class Comunicados {

  comunicados = [
    {
      id: 1,
      dia: '15',
      mes: 'SEP',
      tipo: 'INSTITUCIONAL',
      titulo: 'Reunión general de padres de familia',
      descripcion: 'Se comunica a los padres de familia sobre la próxima reunión general de nuestra institución educativa.'
    },
    {
      id: 2,
      dia: '10',
      mes: 'SEP',
      tipo: 'ACADÉMICO',
      titulo: 'Entrega de reportes de progreso',
      descripcion: 'Se informa a la comunidad educativa sobre la entrega de los reportes de progreso correspondientes al periodo académico.'
    },
    {
      id: 3,
      dia: '05',
      mes: 'SEP',
      tipo: 'ACTIVIDADES',
      titulo: 'Jornada deportiva institucional',
      descripcion: 'Se invita a los estudiantes a participar en la jornada deportiva organizada por nuestra institución educativa.'
  }
  ];

  ngOnInit(): void {
  const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01');

  if (comunicadoGuardado) {
    const nuevoComunicado = JSON.parse(comunicadoGuardado);

    if (nuevoComunicado.estado === 'Publicado') {
      const fecha = nuevoComunicado.fechaPublicacion
        ? new Date(nuevoComunicado.fechaPublicacion)
        : new Date();

      this.comunicados.unshift({
        id: nuevoComunicado.id,
        dia: fecha.getDate().toString().padStart(2, '0'),
        mes: fecha
          .toLocaleString('es-PE', { month: 'short' })
          .replace('.', '')
          .toUpperCase(),
        tipo: nuevoComunicado.tipo.toUpperCase(),
        titulo: nuevoComunicado.titulo,
        descripcion: nuevoComunicado.descripcion
      });
    }
  }
}

}
