import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-editar-comunicado',
  imports: [ReactiveFormsModule],
  templateUrl: './editar-comunicado.html',
  styleUrl: './editar-comunicado.css',
})
export class EditarComunicado {

  constructor(
  private router: Router,
  private route: ActivatedRoute
) {}

nuevoComunicado: any = null;
esComunicadoNuevo: boolean = false;



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

ngOnInit(): void {
  const id = this.route.snapshot.paramMap.get('id');

  if (id === 'nuevo') {
    const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01');

    if (comunicadoGuardado) {
      this.nuevoComunicado = JSON.parse(comunicadoGuardado);
      this.esComunicadoNuevo = true;

      this.formularioComunicado.patchValue({
        titulo: this.nuevoComunicado.titulo,
        tipo: this.nuevoComunicado.tipo,
        descripcion: this.nuevoComunicado.descripcion,
        contenido: this.nuevoComunicado.contenido
      });
    }
  }
}


mensajeExito: string = '';

  guardarCambios(): void {

    if (this.formularioComunicado.invalid) {
      this.formularioComunicado.markAllAsTouched();
      return;
    }

    if (this.esComunicadoNuevo && this.nuevoComunicado) {

  this.nuevoComunicado.titulo =
    this.formularioComunicado.value.titulo;

  this.nuevoComunicado.tipo =
    this.formularioComunicado.value.tipo;

  this.nuevoComunicado.descripcion =
    this.formularioComunicado.value.descripcion;

  this.nuevoComunicado.contenido =
    this.formularioComunicado.value.contenido;

  localStorage.setItem(
    'nuevo_comunicado_mp01',
    JSON.stringify(this.nuevoComunicado)
  );
}

    this.mensajeExito = 'Comunicado actualizado correctamente.';

    console.log(this.formularioComunicado.value);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard/comunicados']);
  }


}