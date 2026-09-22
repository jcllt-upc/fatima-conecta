import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Actividad } from '../models/actividad.model';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla de coordinación y seguimiento (P05.5, HU-MP04-10..14).
 * Ruta: /dashboard/actividades/seguimiento/:id
 *
 * Permite trabajar con tareas, avances, pendientes e incidencias de UNA
 * actividad concreta (la del id de la URL). Además, si la actividad ya
 * está PROGRAMADA, permite iniciar su ejecución (RN05).
 */
@Component({
  selector: 'app-seguimiento-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './seguimiento-actividad.html',
  styleUrl: './seguimiento-actividad.css',
})
export class SeguimientoActividad implements OnInit {
  actividad: Actividad | undefined;
  cargando = true;
  noEncontrada = false;
  mensaje = '';

  nuevaTarea = '';
  nuevoAvance = '';
  nuevaIncidencia = '';

  constructor(
    private route: ActivatedRoute,
    private actividadService: ActividadService
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
    });
  }

  /** HU-MP04-12: pendientes = tareas registradas que aún no están completadas. */
  get tareasPendientes() {
    return this.actividad?.tareas.filter((t) => !t.completada) ?? [];
  }

  iniciarEjecucion(): void {
    if (!this.actividad) return;
    this.actividadService.iniciarEjecucion(this.actividad.id).subscribe({
      next: (actualizada) => {
        this.actividad = actualizada;
        this.mensaje = 'La actividad pasó a estado EN_EJECUCION.';
      },
      error: (err) => (this.mensaje = err.message),
    });
  }

  agregarTarea(): void {
    if (!this.actividad || this.nuevaTarea.trim() === '') return;
    this.actividadService
      .registrarTarea(this.actividad.id, this.nuevaTarea.trim())
      .subscribe((actualizada) => {
        this.actividad = actualizada;
        this.nuevaTarea = '';
      });
  }

  alternarTarea(tareaId: number, completada: boolean): void {
    if (!this.actividad) return;
    this.actividadService
      .cambiarEstadoTarea(this.actividad.id, tareaId, completada)
      .subscribe((actualizada) => (this.actividad = actualizada));
  }

  agregarAvance(): void {
    if (!this.actividad || this.nuevoAvance.trim() === '') return;
    this.actividadService
      .registrarAvance(this.actividad.id, this.nuevoAvance.trim())
      .subscribe((actualizada) => {
        this.actividad = actualizada;
        this.nuevoAvance = '';
      });
  }

  agregarIncidencia(): void {
    if (!this.actividad || this.nuevaIncidencia.trim() === '') return;
    this.actividadService
      .registrarIncidencia(this.actividad.id, this.nuevaIncidencia.trim())
      .subscribe((actualizada) => {
        this.actividad = actualizada;
        this.nuevaIncidencia = '';
      });
  }

  resolverIncidencia(indice: number): void {
    if (!this.actividad) return;
    this.actividadService
      .resolverIncidencia(this.actividad.id, indice)
      .subscribe((actualizada) => (this.actividad = actualizada));
  }
}
