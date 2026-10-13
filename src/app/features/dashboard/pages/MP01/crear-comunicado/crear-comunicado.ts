
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Comunicado } from '../../../../../core/services/comunicado';

@Component({
  selector: 'app-crear-comunicado',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-comunicado.html',
  styleUrl: './crear-comunicado.css',
})

export class CrearComunicado {

  // Servicio que permite comunicarnos con AWS
  constructor(private comunicadoService: Comunicado) {}

  // ======================================================
  // 1. FORMULARIO REACTIVO
  // ======================================================

  formularioComunicado = new FormGroup({
    titulo: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    contenido: new FormControl('', Validators.required)
  });

  // ======================================================
  // 2. MENSAJES DEL FORMULARIO
  // ======================================================

  archivoError: string = '';

  // Utilizamos signal para actualizar el mensaje en pantalla
  mensajeExito = signal('');

  // ======================================================
  // 3. VALIDACIÓN DEL ARCHIVO ADJUNTO
  // ======================================================

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
      this.archivoError =
        'Formato no permitido. Solo se permiten JPG, PNG o PDF.';

      input.value = '';
    }
  }

  // ======================================================
  // 4. GUARDAR COMUNICADO EN SQL SERVER MEDIANTE AWS
  // ======================================================

  guardarComunicado(): void {

    // Validamos que los campos estén completos
    if (this.formularioComunicado.invalid) {
      this.formularioComunicado.markAllAsTouched();
      return;
    }

    // Construimos el objeto que recibirá nuestra Lambda
    const nuevoComunicado = {
      titulo: this.formularioComunicado.value.titulo,
      tipo: this.formularioComunicado.value.tipo,
      descripcion: this.formularioComunicado.value.descripcion,
      contenido: this.formularioComunicado.value.contenido
    };

    // Limpiamos el mensaje anterior
    this.mensajeExito.set('');

    // Enviamos los datos mediante POST a API Gateway
    this.comunicadoService.crearComunicado(nuevoComunicado).subscribe({

      next: (response: any) => {

        // Nuestra Lambda devuelve un body en formato JSON
        const resultado = typeof response.body === 'string'
          ? JSON.parse(response.body)
          : response.body;

        // Comprobamos que Lambda haya registrado correctamente
        if (response.statusCode !== 200) {
          console.error('Error al registrar comunicado:', response);
          return;
        }

        console.log('Comunicado registrado desde AWS:', resultado);

        // Mostramos el mensaje de confirmación
        this.mensajeExito.set(
          'Comunicado registrado correctamente. Estado: Pendiente de revisión.'
        );

        // Limpiamos el formulario
        this.formularioComunicado.reset();
      },

      error: (error) => {
        console.error('Error al guardar comunicado en AWS:', error);

        this.mensajeExito.set('');
      }

    });
  }
}


