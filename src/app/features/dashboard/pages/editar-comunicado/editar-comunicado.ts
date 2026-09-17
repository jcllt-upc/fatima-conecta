import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-comunicado',
  imports: [ReactiveFormsModule],
  templateUrl: './editar-comunicado.html',
  styleUrl: './editar-comunicado.css',
})
export class EditarComunicado {

  constructor(private router: Router) {}

  formularioComunicado = new FormGroup({
    titulo: new FormControl(
      'Entrega de reportes de progreso',
      Validators.required
    ),

    tipo: new FormControl(
      'Academico',
      Validators.required
    ),

    descripcion: new FormControl(
      'Información correspondiente al periodo académico.',
      Validators.required
    ),

    contenido: new FormControl(
      'La institución educativa informa a los padres de familia y estudiantes que se realizará la entrega de los reportes de progreso correspondientes al periodo académico.',
      Validators.required
    )
  });

mensajeExito: string = '';

  guardarCambios(): void {

    if (this.formularioComunicado.invalid) {
      this.formularioComunicado.markAllAsTouched();
      return;
    }

    this.mensajeExito = 'Comunicado actualizado correctamente.';

    console.log(this.formularioComunicado.value);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/comunicados']);
  }


}