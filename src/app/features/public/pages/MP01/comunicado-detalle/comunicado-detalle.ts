
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Comunicado } from '../../../../../core/services/comunicado';

@Component({
  imports: [RouterLink],
  selector: 'app-comunicado-detalle',
  styleUrl: './comunicado-detalle.css',
  templateUrl: './comunicado-detalle.html',
})
export class ComunicadoDetalle implements OnInit {

  comunicado = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private comunicadoService: Comunicado
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) return;

    this.comunicadoService.getComunicadoPorId(id).subscribe({
      next: (response: any) => {

        const datos = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body;

        if (datos.length > 0) {

          const resultado = datos[0];
          const fecha = new Date(resultado.Fecha_Creacion + 'T00:00:00');

          this.comunicado.set({
            id: resultado.ID_Comunicado,
            dia: fecha.getDate().toString().padStart(2, '0'),
            mes: fecha.toLocaleString('es-PE', { month: 'short' })
              .replace('.', '')
              .toUpperCase(),
            tipo: resultado.Tipo_Comunicado.toUpperCase(),
            titulo: resultado.Titulo,
            descripcion: resultado.Descripcion_Corta,
            contenido: resultado.Contenido_Extendido
          });

          console.log('Detalle desde AWS:', this.comunicado);
        }
      },
      error: (error) => {
        console.error('Error al obtener el comunicado:', error);
      }
    });
  }
}
