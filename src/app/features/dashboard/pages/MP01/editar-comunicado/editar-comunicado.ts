import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms'; // Importa las herramientas necesarias para trabajar con formularios reactivos
import { ActivatedRoute, Router } from '@angular/router'; // ActivatedRoute permite leer parámetros de la URL // Router permite navegar hacia otra ruta desde el TypeScript

@Component({
  selector: 'app-editar-comunicado', // Nombre que identifica al componente
  imports: [ReactiveFormsModule], // Permite utilizar formularios reactivos en el HTML
  templateUrl: './editar-comunicado.html',
  styleUrl: './editar-comunicado.css',
})
export class EditarComunicado {

  constructor( // El constructor recibe herramientas de Angular que utilizará este componente
  private router: Router, // Router permite navegar hacia otras rutas desde el TS
  private route: ActivatedRoute// ActivatedRoute permite obtener información de la ruta actual
) {}

nuevoComunicado: any = null; // Guarda el comunicado creado por el usuario
esComunicadoNuevo: boolean = false; // Indica si estamos editando el comunicado nuevo // Inicialmente es falso



  formularioComunicado = new FormGroup({ // Formulario que contiene los campos que se pueden editar
    titulo: new FormControl( // Campo título con un valor inicial
      'Entrega de reportes de progreso',
      Validators.required
    ),

    tipo: new FormControl(  // Campo tipo con un valor inicial
      'Academico',
      Validators.required
    ),

    descripcion: new FormControl( // Campo descripción con un valor inicial
      'Información correspondiente al periodo académico.',
      Validators.required
    ),

    contenido: new FormControl( // Campo contenido con un valor inicial
      'La institución educativa informa a los padres de familia y estudiantes que se realizará la entrega de los reportes de progreso correspondientes al periodo académico.',
      Validators.required
    )
  });

ngOnInit(): void { // Se ejecuta automáticamente cuando se carga el componente
  const id = this.route.snapshot.paramMap.get('id'); // Obtiene de la URL el parámetro llamado "id"

  if (id === 'nuevo') { // Comprueba si el id recibido en la URL es "nuevo"
    const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01'); // Busca en localStorage el comunicado creado por el usuario
 
    if (comunicadoGuardado) {  // Si encontró el comunicado guardado...
      this.nuevoComunicado = JSON.parse(comunicadoGuardado); // Convierte el texto almacenado nuevamente en un objeto
      this.esComunicadoNuevo = true; // Indica que estamos trabajando con el comunicado nuevo

      this.formularioComunicado.patchValue({  // patchValue coloca los datos existentes del comunicado // dentro de los campos del formulario
        titulo: this.nuevoComunicado.titulo,
        tipo: this.nuevoComunicado.tipo,
        descripcion: this.nuevoComunicado.descripcion,
        contenido: this.nuevoComunicado.contenido
      });
    }
  }
}


mensajeExito: string = ''; // Variable que guarda el mensaje después de actualizar

  guardarCambios(): void { // Función que guarda las modificaciones realizadas

    if (this.formularioComunicado.invalid) { // Comprueba si el formulario tiene algún campo inválido
      this.formularioComunicado.markAllAsTouched(); // Detiene la función
      return;
    }

    if (this.esComunicadoNuevo && this.nuevoComunicado) {  // Comprueba que estamos editando el comunicado nuevo // Y que el objeto nuevoComunicado existe

  this.nuevoComunicado.titulo = // Actualiza el título del objeto con lo escrito en el formulario
    this.formularioComunicado.value.titulo;

  this.nuevoComunicado.tipo = // Actualiza el tipo
    this.formularioComunicado.value.tipo;

  this.nuevoComunicado.descripcion = // Actualiza la descripción
    this.formularioComunicado.value.descripcion;

  this.nuevoComunicado.contenido =  // Actualiza el contenido
    this.formularioComunicado.value.contenido;

  localStorage.setItem(  // Guarda nuevamente el comunicado actualizado en localStorage
    'nuevo_comunicado_mp01', // Clave donde se guarda el comunicado
    JSON.stringify(this.nuevoComunicado) // Convierte el objeto actualizado a texto
  );
}

    this.mensajeExito = 'Comunicado actualizado correctamente.'; // Mensaje que se mostrará después de guardar

    console.log(this.formularioComunicado.value);  // Muestra en la consola los valores actuales del formulario
  }

  cancelar(): void {  // Función para cancelar la edición
    this.router.navigate(['/dashboard/comunicados']); // Navega nuevamente a Gestión de Comunicados
  }


}