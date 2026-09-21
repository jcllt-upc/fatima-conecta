import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-comunicado-detalle',
  styleUrl: './comunicado-detalle.css',
  templateUrl: './comunicado-detalle.html',
})
export class ComunicadoDetalle {

  id: string | null = null;

  comunicado: any = null;

  comunicados = [
    {
      id: 1,
      dia: '15',
      mes: 'SEP',
      tipo: 'INSTITUCIONAL',
      titulo: 'Reunión general de padres de familia',
      descripcion: 'Se comunica a los padres de familia sobre la próxima reunión general de nuestra institución educativa.',
      contenido: 'La Dirección de la I.E. N.° 20395 Nuestra Señora de Fátima comunica a los padres de familia que se realizará una reunión general con la finalidad de informar sobre las actividades académicas e institucionales del presente periodo. Se solicita la participación puntual de los padres y apoderados para garantizar una adecuada coordinación con la comunidad educativa.'
    },
    {
      id: 2,
      dia: '10',
      mes: 'SEP',
      tipo: 'ACADÉMICO',
      titulo: 'Entrega de reportes de progreso',
      descripcion: 'Se informa a la comunidad educativa sobre la entrega de los reportes de progreso correspondientes al periodo académico.',
      contenido: 'La institución educativa informa a los padres de familia y estudiantes que se realizará la entrega de los reportes de progreso correspondientes al periodo académico. Estos documentos permitirán conocer el avance de los estudiantes y facilitar el seguimiento de su desempeño académico.'
    },
    {
      id: 3,
      dia: '05',
      mes: 'SEP',
      tipo: 'ACTIVIDADES',
      titulo: 'Jornada deportiva institucional',
      descripcion: 'Se invita a los estudiantes a participar en la jornada deportiva organizada por nuestra institución educativa.',
      contenido: 'La I.E. N.° 20395 Nuestra Señora de Fátima invita a los estudiantes a participar en la jornada deportiva institucional, actividad orientada a promover la integración, la participación y la práctica deportiva entre los miembros de la comunidad educativa.'
    }
  ];


  constructor(private route: ActivatedRoute) {
  this.id = this.route.snapshot.paramMap.get('id');

  this.comunicado = this.comunicados.find(
    comunicado => comunicado.id === Number(this.id)
  );

  if (!this.comunicado) {
    const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01');

    if (comunicadoGuardado) {
      const nuevoComunicado = JSON.parse(comunicadoGuardado);

      if (
        nuevoComunicado.estado === 'Publicado' &&
        nuevoComunicado.id === Number(this.id)
      ) {
        const fecha = nuevoComunicado.fechaPublicacion
          ? new Date(nuevoComunicado.fechaPublicacion)
          : new Date();

        this.comunicado = {
          id: nuevoComunicado.id,
          dia: fecha.getDate().toString().padStart(2, '0'),
          mes: fecha
            .toLocaleString('es-PE', { month: 'short' })
            .replace('.', '')
            .toUpperCase(),
          tipo: nuevoComunicado.tipo.toUpperCase(),
          titulo: nuevoComunicado.titulo,
          descripcion: nuevoComunicado.descripcion,
          contenido: nuevoComunicado.contenido
        };
      }
    }
  }
}

}
