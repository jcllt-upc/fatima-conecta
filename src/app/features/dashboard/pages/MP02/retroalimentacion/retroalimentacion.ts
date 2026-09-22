import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-retroalimentacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './retroalimentacion.html',
  styleUrl: './retroalimentacion.css'
})
export class RetroalimentacionComponent implements OnInit {

  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  protected readonly conteoRecomendaciones = signal<number>(0);
  protected readonly conteoCompromisos = signal<number>(0);

  protected readonly mostrarExitoPublicacion = signal<boolean>(false);

  protected readonly MAX_CARACTERES = 1000;

  protected readonly retroalimentacionForm = new FormGroup({
    txtRecomendaciones: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    }),
    txtCompromisos: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    })
  });

  public ngOnInit(): void {
    const { totalEvidencias } = this.verificarEvidenciasPrevias();
    const fichaId = localStorage.getItem('contexto_ficha_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre');

    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    }
  }

  private verificarEvidenciasPrevias(): { totalEvidencias: string } {
    const count = localStorage.getItem('contexto_evidencias_count') || '0';
    return { totalEvidencias: count };
  }

  protected actualizarContadorRecomendaciones(): void {
    const longitudText = this.retroalimentacionForm.controls.txtRecomendaciones.value.length;
    this.conteoRecomendaciones.set(longitudText);
  }

  protected actualizarContadorCompromisos(): void {
    const longitudText = this.retroalimentacionForm.controls.txtCompromisos.value.length;
    this.conteoCompromisos.set(longitudText);
  }

  protected onFinalizarPublicacion(): void {
    if (this.retroalimentacionForm.invalid) {
      this.retroalimentacionForm.markAllAsTouched();
      return;
    }

    const { txtRecomendaciones, txtCompromisos } = this.retroalimentacionForm.getRawValue();

    localStorage.setItem('contexto_retro_recomendaciones', txtRecomendaciones);
    localStorage.setItem('contexto_retro_compromisos', txtCompromisos);
    
    localStorage.setItem('contexto_ficha_estado', 'Publicado');

    this.mostrarExitoPublicacion.set(true);
  }
}
