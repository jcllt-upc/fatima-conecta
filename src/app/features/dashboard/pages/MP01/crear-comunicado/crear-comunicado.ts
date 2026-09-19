import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-crear-comunicado',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-comunicado.html',
  styleUrl: './crear-comunicado.css',
})
export class CrearComunicado {

  formularioComunicado = new FormGroup({
    titulo: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    contenido: new FormControl('', Validators.required)
  });

  archivoError: string = '';
  mensajeExito: string = '';

validarArchivo(event: Event): void {
  const input = event.target as HTMLInputElement;
  const archivo = input.files?.[0];

  this.archivoError = '';

  if (!archivo) {
    return;
  }

  const formatosPermitidos = [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ];

  if (!formatosPermitidos.includes(archivo.type)) {
    this.archivoError = 'Formato no permitido. Solo se permiten JPG, PNG o PDF.';
    input.value = '';
  }
}

  guardarComunicado(): void {

  if (this.formularioComunicado.invalid) {
    this.formularioComunicado.markAllAsTouched();
    return;
  }

  const nuevoComunicado = {
    id: Date.now(),
    titulo: this.formularioComunicado.value.titulo,
    tipo: this.formularioComunicado.value.tipo,
    descripcion: this.formularioComunicado.value.descripcion,
    contenido: this.formularioComunicado.value.contenido,
    estado: 'Pendiente',
    fechaCreacion: new Date().toISOString()
  };

  localStorage.setItem(
    'nuevo_comunicado_mp01',
    JSON.stringify(nuevoComunicado)
  );

  console.log(nuevoComunicado);

  this.mensajeExito =
    'Comunicado registrado correctamente. Estado: Pendiente de revisión.';
}

}

