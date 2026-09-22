import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Actividad, EstadoActividad, ESTADOS_ACTIVIDAD } from '../models/actividad.model';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla principal de MP04: listado de actividades institucionales.
 *
 * Funciones (sección 10 del enunciado):
 * - Muestra listado con nombre, fecha, responsable, estado y acciones.
 * - Búsqueda por texto y filtro por estado.
 * - Enlaces a nueva/revisar/editar/seguimiento/cierre.
 *
 * IMPORTANTE: este componente NO tiene su propio arreglo de actividades.
 * Se suscribe a ActividadService.actividades$ para que, si otra pantalla
 * modifica una actividad (por ejemplo, al aprobarla), esta lista se
 * mantenga sincronizada automáticamente.
 */
@Component({
  selector: 'app-gestion-actividades',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './gestion-actividades.html',
  styleUrl: './gestion-actividades.css',
})
export class GestionActividades implements OnInit {
  /** Lista completa (sin filtrar) recibida del servicio. */
  private todasLasActividades: Actividad[] = [];

  /** Lista que realmente se pinta en pantalla, ya filtrada. */
  actividadesFiltradas: Actividad[] = [];

  /** Texto ingresado en el buscador (HU-MP04-22). */
  terminoBusqueda = '';

  /** Estado seleccionado en el filtro; cadena vacía = "Todos" (HU-MP04-21). */
  estadoSeleccionado: EstadoActividad | '' = '';

  /** Lista de estados disponibles para poblar el <select> del filtro. */
  estadosDisponibles = ESTADOS_ACTIVIDAD;

  constructor(private actividadService: ActividadService) {}

  ngOnInit(): void {
    // Nos suscribimos al observable "en vivo": cada vez que el service
    // emita una lista nueva (porque se creó, aprobó, cerró, etc. una
    // actividad en OTRA pantalla), esta tabla se actualiza sola.
    this.actividadService.actividades$.subscribe((actividades) => {
      this.todasLasActividades = actividades;
      this.aplicarFiltros();
    });

    // Disparamos la carga inicial (la primera vez trae datos del JSON).
    this.actividadService.listar().subscribe();
  }

  /** Se ejecuta cada vez que cambia el texto de búsqueda o el filtro de estado. */
  aplicarFiltros(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    this.actividadesFiltradas = this.todasLasActividades.filter((actividad) => {
      const coincideTexto =
        termino === '' ||
        actividad.nombre.toLowerCase().includes(termino) ||
        actividad.responsable.toLowerCase().includes(termino);

      const coincideEstado =
        this.estadoSeleccionado === '' || actividad.estado === this.estadoSeleccionado;

      return coincideTexto && coincideEstado;
    });
  }

  /** Texto amigable para mostrar el estado en la tabla (en vez del código en mayúsculas). */
  etiquetaEstado(estado: EstadoActividad): string {
    const etiquetas: Record<EstadoActividad, string> = {
      PROPUESTA: 'Propuesta',
      PENDIENTE_REVISION: 'Pendiente de revisión',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      PROGRAMADA: 'Programada',
      EN_EJECUCION: 'En ejecución',
      FINALIZADA: 'Finalizada',
      CERRADA: 'Cerrada',
    };
    return etiquetas[estado];
  }

  /** Clase CSS según el estado, para diferenciarlos visualmente (sección 16). */
  claseEstado(estado: EstadoActividad): string {
    return 'badge badge-' + estado.toLowerCase();
  }
}
