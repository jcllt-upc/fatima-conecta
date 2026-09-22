import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-evaluacion-progreso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './evaluacion-progreso.html',
  styleUrl: './evaluacion-progreso.css'
})
export class EvaluacionProgresoComponent implements OnInit {

  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  protected readonly conteoLogros = signal<number>(0);
  protected readonly conteoDificultades = signal<number>(0);

  protected readonly mostrarExitoEvaluacion = signal<boolean>(false);

  protected readonly MAX_CARACTERES = 1000;

  protected readonly evaluacionForm = new FormGroup({
    txtLogros: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    }),
    txtDificultades: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    })
  });

  public ngOnInit(): void {
    const fichaId = localStorage.getItem('contexto_ficha_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre');

    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    }
  }

  protected actualizarContadorLogros(): void {
    const longitudText = this.evaluacionForm.controls.txtLogros.value.length;
    this.conteoLogros.set(longitudText);
  }

  protected actualizarContadorDificultades(): void {
    const longitudText = this.evaluacionForm.controls.txtDificultades.value.length;
    this.conteoDificultades.set(longitudText);
  }

  protected onGuardarEvaluacion(): void {
    if (this.evaluacionForm.invalid) {
      this.evaluacionForm.markAllAsTouched();
      return;
    }

    const { txtLogros, txtDificultades } = this.evaluacionForm.getRawValue();

    localStorage.setItem('contexto_evaluacion_logros', txtLogros);
    localStorage.setItem('contexto_evaluacion_dificultades', txtDificultades);

    this.mostrarExitoEvaluacion.set(true);
  }
}
