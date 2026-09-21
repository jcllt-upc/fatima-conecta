// Importa Component desde Angular.
// Component permite definir esta clase como un componente de Angular.

import { Component } from '@angular/core';

// Importamos las herramientas necesarias para trabajar con formularios reactivos de Angular.
//
// ReactiveFormsModule = habilita los formularios reactivos.
// FormControl = representa/controla un campo individual.
// FormGroup = agrupa varios FormControl en un formulario.
// Validators = permite aplicar reglas de validación.


import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({ // @Component configura las características del componente.

// Nombre con el que este componente podría utilizarse
  // como una etiqueta HTML: <app-crear-comunicado>

  selector: 'app-crear-comunicado', 

  // Habilita ReactiveFormsModule dentro de este componente
  // para poder utilizar el formulario reactivo en el HTML.

  imports: [ReactiveFormsModule], // Importante para que funcionen los formularios reactivos en el HTML

  templateUrl: './crear-comunicado.html', // Archivo HTML que contiene la interfaz del componente.
  styleUrl: './crear-comunicado.css', // Archivo CSS que contiene los estilos del componente.
})

// Clase principal del componente.
// Contiene los datos y la lógica de Crear Comunicado.

export class CrearComunicado {

// Creamos el formulario reactivo.
  // FormGroup agrupa todos los campos del formulario.

  formularioComunicado = new FormGroup({

     // FormControl controla individualmente cada campo.
    // '' significa que inicialmente el campo está vacío.
    // Validators.required indica que el campo es obligatorio.


    titulo: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    contenido: new FormControl('', Validators.required)
  });

    // Variable donde guardaremos un mensaje si existe
  // un problema con el archivo seleccionado.
  // : string indica que esta variable almacena texto.
  archivoError: string = '';

  // Variable utilizada para mostrar el mensaje de éxito
  // después de registrar correctamente un comunicado.
  mensajeExito: string = '';


  // Función que valida el archivo seleccionado por el usuario.
  //
  // event: Event = recibe información del evento ocurrido.
  // : void = la función no devuelve ningún valor.
validarArchivo(event: Event): void {

      // event.target representa el elemento HTML que produjo el evento.
    // "as HTMLInputElement" le indica a TypeScript que ese elemento
    // es específicamente un input de HTML.
  const input = event.target as HTMLInputElement;

  // Obtiene el primer archivo seleccionado por el usuario.
    // ?. evita un error si no existe ningún archivo.
    // [0] significa el primer archivo.
  const archivo = input.files?.[0];

  this.archivoError = ''; // Limpiamos cualquier mensaje de error anterior.


  // Si no existe ningún archivo seleccionado,
    // terminamos la función.
  if (!archivo) {
    return;
  }


 // Lista de tipos de archivos permitidos.
  const formatosPermitidos = [
    'image/jpeg',
    'image/png',
    'application/pdf'
  ];


  // Verifica si el tipo del archivo NO se encuentra
    // dentro de los formatos permitidos.
  if (!formatosPermitidos.includes(archivo.type)) {
    this.archivoError = 'Formato no permitido. Solo se permiten JPG, PNG o PDF.';  // Guardamos el mensaje de error.
    input.value = ''; // Limpia el input para eliminar el archivo inválido.
  }
}

  guardarComunicado(): void {   // Función que se ejecuta cuando queremos guardar el nuevo comunicado. // : void significa que la función no retorna ningún valor.

  if (this.formularioComunicado.invalid) { // Comprueba si el formulario contiene algún campo // que no cumple las validaciones.
    this.formularioComunicado.markAllAsTouched(); // Fuerza a Angular a activar visualmente los errores en rojo en la interfaz (HTML)
    return; // Frena la función de golpe para evitar que se guarde información incompleta
  }

// =========================================================================
// CONSTRUCCIÓN DEL OBJETO: Agrupamos los datos para la base de datos
// =========================================================================

  const nuevoComunicado = { // Genera un número único de identificación usando los milisegundos de la fecha actual
    id: Date.now(),
    titulo: this.formularioComunicado.value.titulo,  // Extrae el texto que el usuario escribió en el campo "titulo" del formulario
    tipo: this.formularioComunicado.value.tipo,   // Extrae el tipo seleccionado (ej: Informativo, Urgente, Evento, etc.)
    descripcion: this.formularioComunicado.value.descripcion, // Extrae la descripción breve introducida por el usuario
    contenido: this.formularioComunicado.value.contenido,  // Extrae el desarrollo o cuerpo completo del comunicado
    estado: 'Pendiente', // Asigna por defecto el estado inicial "Pendiente" hasta que un Director lo apruebe
    fechaCreacion: new Date().toISOString()   // Registra el momento exacto de la creación en formato estándar internacional (ISO)
  };


// =========================================================================
// PERSISTENCIA LOCAL: Guardamos el comunicado en la memoria del navegador
// =========================================================================

  localStorage.setItem( // 1. La "llave" o nombre con el que registraremos este dato
    'nuevo_comunicado_mp01',
    JSON.stringify(nuevoComunicado) // 2. Convertimos el objeto a texto plano (String) para poder guardarlo (EL OBJETO: const nuevoComunicado = { )
  );

  console.log(nuevoComunicado); // Imprime los datos del objeto en la consola del navegador para que el desarrollador pueda revisarlos (fines de depuración)

  this.mensajeExito = // Asigna un texto de confirmación que el HTML usará para mostrarle una alerta verde de éxito al usuario en la pantalla
    'Comunicado registrado correctamente. Estado: Pendiente de revisión.';
}

}

