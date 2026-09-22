import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActividadService } from '../services/actividad.service';

/**
 * Pantalla de registro de una nueva propuesta de actividad (P05.1, HU-MP04-01).
 *
 * Usa Reactive Forms (FormGroup + FormControl + Validators), igual que MP01,
 * para poder validar campos obligatorios de forma declarativa y mostrar
 * mensajes de error específicos por campo.
 */
@Component({
  selector: 'app-crear-actividad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './crear-actividad.html',
  styleUrl: './crear-actividad.css',
})
export class CrearActividad {
  /** true mientras se muestra el mensaje de éxito tras registrar. */
  registroExitoso = false;

  formulario = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
    descripcion: new FormControl('', [Validators.required]),
    objetivo: new FormControl('', [Validators.required]),
    fecha: new FormControl('', [Validators.required]),
    lugar: new FormControl('', [Validators.required]),
    responsable: new FormControl('', [Validators.required]),
  });

  constructor(
    private actividadService: ActividadService,
    private router: Router
  ) {}

  /** Getter corto para acceder a los controles desde la plantilla. */
  get campos() {
    return this.formulario.controls;
  }

  enviar(): void {
    if (this.formulario.invalid) {
      // Marca todos los campos como "tocados" para que se muestren
      // los mensajes de validación aunque el usuario no los haya
      // enfocado individualmente.
      this.formulario.markAllAsTouched();
      return;
    }

    const valores = this.formulario.getRawValue();

    this.actividadService
      .crear({
        nombre: valores.nombre!,
        descripcion: valores.descripcion!,
        objetivo: valores.objetivo!,
        fecha: valores.fecha!,
        lugar: valores.lugar!,
        responsable: valores.responsable!,
      })
      .subscribe(() => {
        this.registroExitoso = true;
        this.formulario.reset();

        // Después de mostrar el mensaje de éxito un momento,
        // regresamos al listado para que el usuario vea la nueva
        // actividad ya en estado PROPUESTA.
        setTimeout(() => {
          this.router.navigate(['/dashboard/actividades']);
        }, 1200);
      });
  }
}
