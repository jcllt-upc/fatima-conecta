import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comunicado } from '../../../../../core/services/comunicado';

@Component({
  selector: 'app-comunicados',
  imports: [RouterLink],
  templateUrl: './comunicados.html',
  styleUrl: './comunicados.css',
})
export class Comunicados implements OnInit {

  // Lista reactiva de comunicados que utilizará el HTML
  comunicados = signal<any[]>([]);

  // Inyectamos el servicio que se comunica con API Gateway
  constructor(private comunicadoService: Comunicado) {}

  // Se ejecuta automáticamente al ingresar al componente
  ngOnInit(): void {

    this.comunicadoService.getComunicados().subscribe({

      next: (response: any) => {

        // La respuesta de Lambda contiene los registros dentro de "body"
        const datos = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body;

        // Solo mostramos los comunicados que están PUBLICADOS
        const comunicadosPublicados = datos
          .filter((comunicado: any) =>
            comunicado.Nombre_Estado === 'Publicado'
          )
          .map((comunicado: any) => {

            const fecha = new Date(comunicado.Fecha_Creacion);

            return {
              id: comunicado.ID_Comunicado,

              dia: fecha
                .getDate()
                .toString()
                .padStart(2, '0'),

              mes: fecha
                .toLocaleString('es-PE', { month: 'short' })
                .replace('.', '')
                .toUpperCase(),

              tipo: comunicado.Tipo_Comunicado.toUpperCase(),

              titulo: comunicado.Titulo,

              descripcion: comunicado.Descripcion_Corta
            };
          });

        // Actualizamos el signal
        this.comunicados.set(comunicadosPublicados);

        console.log(
          'Comunicados desde AWS:',
          this.comunicados()
        );
      },

      error: (error) => {
        console.error(
          'Error al obtener comunicados:',
          error
        );
      }

    });
  }
}