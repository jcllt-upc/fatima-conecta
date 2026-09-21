import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InnovacionService } from '../../services/innovacion.service';

@Component({
  selector: 'app-registro-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contenedor-formulario">
      <h2>Registro de Proyecto de Innovación (P04.1)</h2>
      <form [formGroup]="registroForm" (ngSubmit)="onSubmit()">
        <div class="campo">
          <label>Título del Proyecto:</label>
          <input type="text" formControlName="titulo">
        </div>
        <div class="campo">
          <label>Área o Especialidad:</label>
          <input type="text" formControlName="area">
        </div>
        <div class="campo">
          <label>Descripción:</label>
          <textarea formControlName="descripcion" rows="4"></textarea>
        </div>
        <button type="submit" [disabled]="registroForm.invalid">Registrar Proyecto</button>
      </form>
      @if (mensajeExito) { <p class="exito">{{ mensajeExito }}</p> }
    </div>
  `,
  styles: [`
    .contenedor-formulario { max-width: 600px; margin: 2rem auto; font-family: sans-serif; }
    .campo { margin-bottom: 1rem; display: flex; flex-direction: column; }
    input, textarea { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    button { padding: 0.5rem 1rem; background-color: #0056b3; color: white; border: none; cursor: pointer; }
    button:disabled { background-color: #aaa; }
    .exito { color: green; font-weight: bold; margin-top: 1rem; }
  `]
})
export class RegistroProyectoComponent {
  private fb = inject(FormBuilder);
  private innovacionService = inject(InnovacionService);

  registroForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    area: ['', Validators.required],
    descripcion: ['', Validators.required],
    autorId: ['docente-123']
  });
  mensajeExito = '';

  onSubmit() {
    if (this.registroForm.valid) {
      this.innovacionService.registrarProyecto(this.registroForm.value).subscribe({
        next: () => {
          this.mensajeExito = 'Proyecto registrado exitosamente.';
          this.registroForm.reset();
        }
      });
    }
  }
}