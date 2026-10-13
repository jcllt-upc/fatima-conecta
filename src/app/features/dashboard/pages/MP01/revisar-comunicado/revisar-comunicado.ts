
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Comunicado } from '../../../../../core/services/comunicado';

@Component({
  imports: [],
  selector: 'app-revisar-comunicado',
  styleUrl: './revisar-comunicado.css',
  templateUrl: './revisar-comunicado.html',
})
export class RevisarComunicado implements OnInit {

  estado: string = 'Pendiente de revisión';
  mensaje: string = '';
  nuevoComunicado: any = null;

  idComunicado: number = 0;
  cargando: boolean = true;
  procesando: boolean = false;

  constructor(
  private comunicadoService: Comunicado,
  private route: ActivatedRoute,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {

    // Obtener el ID del comunicado desde la URL
    this.idComunicado = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.idComunicado) {
      this.mensaje = 'ID de comunicado no válido.';
      this.cargando = false;
      return;
    }

    // Consultar el comunicado desde SQL Server
    this.comunicadoService
      .getComunicadoPorId(String(this.idComunicado))
      .subscribe({

        next: (respuesta: any) => {

          const datos = typeof respuesta.body === 'string'
            ? JSON.parse(respuesta.body)
            : (respuesta.body ?? respuesta);

          // Nuestro GET devuelve un arreglo
          this.nuevoComunicado = Array.isArray(datos)
            ? datos[0]
            : datos;

          if (!this.nuevoComunicado) {
            this.mensaje = 'Comunicado no encontrado.';
          }

          this.cargando = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al consultar comunicado:', error);
          this.mensaje = 'No se pudo cargar el comunicado.';
          this.cargando = false;
          this.cdr.detectChanges();
        }

      });
  }

  // Aprobar comunicado mediante PUT
  aprobarComunicado(): void {

    if (!this.nuevoComunicado || this.procesando) {
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    this.comunicadoService
      .actualizarEstado(this.idComunicado, 2)
      .subscribe({

        next: (respuesta: any) => {

          const resultado = typeof respuesta.body === 'string'
            ? JSON.parse(respuesta.body)
            : (respuesta.body ?? respuesta);

          if (respuesta.statusCode !== 200) {
            this.mensaje = resultado.mensaje || 'No se pudo aprobar.';
            this.procesando = false;
            return;
          }

          this.estado = 'Aprobado';
          this.mensaje = 'Comunicado aprobado correctamente.';
          this.procesando = false;

          // Regresar a Gestión de Comunicados
          this.router.navigate(['/dashboard/comunicados']);
        },

        error: (error) => {
          console.error('Error al aprobar comunicado:', error);
          this.mensaje = 'Ocurrió un error al aprobar el comunicado.';
          this.procesando = false;
        }

      });
  }

  // El rechazo todavía no está implementado en SQL Server
  rechazarComunicado(): void {
    this.mensaje = 'La función Rechazar todavía no está implementada.';
  }

}

