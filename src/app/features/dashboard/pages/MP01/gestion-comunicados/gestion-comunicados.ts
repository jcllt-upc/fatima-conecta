import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Comunicado } from '../../../../../services/comunicado';

@Component({
  selector: 'app-gestion-comunicados',
  imports: [RouterLink],
  templateUrl: './gestion-comunicados.html',
  styleUrl: './gestion-comunicados.css',
})
export class GestionComunicados implements OnInit {

  // Lista de comunicados obtenidos desde SQL Server
  comunicados = signal<any[]>([]);

  // Mensajes de carga o error
  cargando = signal(true);
  error = signal('');

  constructor(private comunicadoService: Comunicado) {}

  // Publicar un comunicado mediante PUT
publicarComunicado(id: number): void {

  this.comunicadoService.actualizarEstado(id, 3).subscribe({

    next: (respuesta: any) => {

      // Nuestra Lambda devuelve el resultado dentro de body
      const resultado = typeof respuesta.body === 'string'
        ? JSON.parse(respuesta.body)
        : (respuesta.body ?? respuesta);

      if (respuesta.statusCode !== 200) {
        alert(resultado.mensaje || 'No se pudo publicar el comunicado.');
        return;
      }

      alert('Comunicado publicado correctamente.');

      // Volver a consultar SQL Server para actualizar la tabla
      this.cargarComunicados();
    },

    error: (error) => {
      console.error('Error al publicar comunicado:', error);
      alert('Ocurrió un error al publicar el comunicado.');
    }

  });

}

  ngOnInit(): void {
    this.cargarComunicados();
  }

  cargarComunicados(): void {

    this.cargando.set(true);
    this.error.set('');

    this.comunicadoService.getComunicados().subscribe({
      next: (respuesta: any) => {

        // Nuestra Lambda devuelve los datos dentro de body
        const datos = typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : (respuesta.body ?? respuesta);

        this.comunicados.set(datos);
        this.cargando.set(false);
      },

      error: (err) => {
        console.error('Error al obtener comunicados:', err);
        this.error.set('No se pudieron cargar los comunicados.');
        this.cargando.set(false);
      }
    });
  }

  
  // DELETE: Eliminar un comunicado de SQL Server
  eliminarComunicado(id: number): void {

    // Confirmar antes de eliminar
    const confirmar = confirm(
      '¿Estás seguro de que deseas eliminar este comunicado?'
    );

    if (!confirmar) {
      return;
    }

    this.comunicadoService.eliminarComunicado(id).subscribe({

      next: (respuesta: any) => {

        // Nuestra Lambda devuelve el resultado dentro de body
        const resultado = typeof respuesta.body === 'string'
          ? JSON.parse(respuesta.body)
          : (respuesta.body ?? respuesta);

        if (respuesta.statusCode !== 200) {
          alert(resultado.mensaje || 'No se pudo eliminar el comunicado.');
          return;
        }

        alert('Comunicado eliminado correctamente.');

        // Actualizar la tabla desde SQL Server
        this.cargarComunicados();
      },

      error: (error) => {
        console.error('Error al eliminar comunicado:', error);
        alert('Ocurrió un error al eliminar el comunicado.');
      }

    });
  }
}
