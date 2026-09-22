import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla de edición de una actividad existente.
 * Ruta: /dashboard/actividades/editar/:id
 *
 * Obtiene el id de la URL, carga la actividad real desde el servicio y
 * PRE-LLENA el formulario con sus datos actuales (patchValue). Al guardar,
 * solo se envían los campos editables al servicio, que internamente
 * conserva el resto de la información (tareas, avances, evidencias, etc.)
 * para cumplir RN07 (no perder datos al editar).
 */
@Component({
  selector: 'app-editar-actividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './editar-actividad.html',
  styleUrl: './editar-actividad.css',
})
export class EditarActividad implements OnInit {
  private id!: number;
  cargando = true;
  noEncontrada = false;
  guardadoExitoso = false;

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    descripcion: new FormControl('', [Validators.required]),
    objetivo: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required]),
    lugar: new FormControl('', [Validators.required]),
    responsable: new FormControl('', [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private actividadService: ActividadService,
    private router: Router
  ) {}

  get campos() {
    return this.formulario.controls;
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.actividadService.obtenerPorId(this.id).subscribe((actividad) => {
      this.cargando = false;

      if (!actividad) {
        this.noEncontrada = true;
        return;
      }

      // Pre-llenamos el formulario con los datos REALES de esta actividad
      // (no valores fijos ni distintos según el id "a mano").
      this.formulario.patchValue({
        nombre: actividad.nombre,
        descripcion: actividad.descripcion,
        objetivo: actividad.objetivo,
        fecha: actividad.fecha,
        lugar: actividad.lugar,
        responsable: actividad.responsable,
      });
    });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    this.actividadService
      .editar(this.id, {
        nombre: valores.nombre!,
        descripcion: valores.descripcion!,
        objetivo: valores.objetivo!,
        fecha: valores.fecha!,
        lugar: valores.lugar!,
        responsable: valores.responsable!,
      })
      .subscribe(() => {
        this.guardadoExitoso = true;
        setTimeout(() => {
          this.router.navigate(['/dashboard/actividades']);
        }, 1000);
      });
  }
}
