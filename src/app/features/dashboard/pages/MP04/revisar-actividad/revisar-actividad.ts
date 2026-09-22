import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Actividad } from '../models/actividad.model';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla de revisión y aprobación (P05.2, HU-MP04-03/04/05).
 * Ruta: /dashboard/actividades/revisar/:id
 *
 * Obtiene el id desde la URL con ActivatedRoute y carga LA actividad
 * correspondiente desde el servicio (nunca desde un único registro
 * global fijo), para que cada id muestre sus propios datos reales.
 */
@Component({
  selector: 'app-revisar-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './revisar-actividad.html',
  styleUrl: './revisar-actividad.css',
})
export class RevisarActividad implements OnInit {
  actividad: Actividad | undefined;
  cargando = true;
  noEncontrada = false;

  /** Observación que se escribe al rechazar (HU-MP04-05 / RN03). */
  observacionRechazo = '';

  /** Controla si se muestra el bloque para escribir la observación. */
  mostrandoFormularioRechazo = false;

  mensaje = '';

  constructor(
    private route: ActivatedRoute,
    private actividadService: ActividadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.actividadService.obtenerPorId(id).subscribe((actividad) => {
      this.cargando = false;
      if (!actividad) {
        this.noEncontrada = true;
        return;
      }
      this.actividad = actividad;

      // Si la propuesta todavía no ha sido vista, la pasamos
      // automáticamente a PENDIENTE_REVISION al abrir esta pantalla,
      // reflejando que "está siendo revisada" (RN02).
      if (actividad.estado === 'PROPUESTA') {
        this.actividadService.enviarARevision(id).subscribe((actualizada) => {
          this.actividad = actualizada;
        });
      }
    });
  }

  aprobar(): void {
    if (!this.actividad) return;

    this.actividadService.aprobar(this.actividad.id).subscribe({
      next: (actualizada) => {
        this.actividad = actualizada;
        this.mensaje = 'Actividad aprobada correctamente.';
      },
      error: (err) => (this.mensaje = err.message),
    });
  }

  mostrarFormularioRechazo(): void {
    this.mostrandoFormularioRechazo = true;
  }

  confirmarRechazo(): void {
    if (!this.actividad || this.observacionRechazo.trim() === '') {
      this.mensaje = 'Debes indicar una observación para rechazar la actividad.';
      return;
    }

    this.actividadService
      .rechazar(this.actividad.id, this.observacionRechazo.trim())
      .subscribe((actualizada) => {
        this.actividad = actualizada;
        this.mostrandoFormularioRechazo = false;
        this.mensaje = 'Actividad rechazada. Se registró la observación.';
      });
  }

  volverAlListado(): void {
    this.router.navigate(['/dashboard/actividades']);
  }
}
