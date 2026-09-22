import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Actividad } from '../models/actividad.model';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla de evidencias y cierre (P05.7, HU-MP04-17..20).
 * Ruta: /dashboard/actividades/cierre/:id
 *
 * Permite registrar evidencias, el informe de resultados, y finalmente
 * cambiar el estado a CERRADA.
 *
 * RN06 se aplica en dos capas:
 * 1. Aquí en la interfaz: el botón "Cerrar actividad" solo se habilita
 *    cuando hay al menos una evidencia y el informe no está vacío, y
 *    solo si el estado actual es FINALIZADA (para no confundir al
 *    usuario con un botón que sabemos que fallará).
 * 2. En el servicio (ActividadService.cerrar): la validación real y
 *    definitiva, que es la que de verdad protege los datos aunque la
 *    interfaz tuviera un error (regla de negocio, no solo de UI).
 */
@Component({
  selector: 'app-cierre-actividad',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cierre-actividad.html',
  styleUrl: './cierre-actividad.css',
})
export class CierreActividad implements OnInit {
  actividad: Actividad | undefined;
  cargando = true;
  noEncontrada = false;
  mensaje = '';
  cierreCompletado = false;

  nuevaEvidenciaDescripcion = '';
  nuevaEvidenciaUrl = '';
  resultadoTexto = '';
  informeTexto = '';

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
      this.informeTexto = actividad.informe ?? '';
    });
  }

  /** Habilita el botón de cierre solo cuando se cumplen las condiciones de RN06. */
  get puedeCerrar(): boolean {
    return (
      !!this.actividad &&
      this.actividad.estado === 'FINALIZADA' &&
      this.actividad.evidencias.length > 0 &&
      !!this.actividad.informe &&
      this.actividad.informe.trim() !== ''
    );
  }

  registrarResultadoYFinalizar(): void {
    if (!this.actividad || this.resultadoTexto.trim() === '') return;

    this.actividadService
      .registrarResultado(this.actividad.id, this.resultadoTexto.trim())
      .subscribe({
        next: (actualizada) => {
          this.actividad = actualizada;
          this.mensaje = 'Resultado registrado. La actividad ahora está FINALIZADA.';
        },
        error: (err) => (this.mensaje = err.message),
      });
  }

  agregarEvidencia(): void {
    if (!this.actividad || this.nuevaEvidenciaDescripcion.trim() === '') return;

    this.actividadService
      .registrarEvidencia(
        this.actividad.id,
        this.nuevaEvidenciaDescripcion.trim(),
        this.nuevaEvidenciaUrl.trim() || undefined
      )
      .subscribe((actualizada) => {
        this.actividad = actualizada;
        this.nuevaEvidenciaDescripcion = '';
        this.nuevaEvidenciaUrl = '';
      });
  }

  guardarInforme(): void {
    if (!this.actividad) return;
    this.actividadService
      .registrarInforme(this.actividad.id, this.informeTexto)
      .subscribe((actualizada) => (this.actividad = actualizada));
  }

  cerrarActividad(): void {
    if (!this.actividad) return;

    this.actividadService.cerrar(this.actividad.id).subscribe({
      next: (actualizada) => {
        this.actividad = actualizada;
        this.cierreCompletado = true;
        this.mensaje = 'La actividad fue cerrada correctamente.';
      },
      error: (err) => (this.mensaje = err.message),
    });
  }
}
