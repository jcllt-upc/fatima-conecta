import { Component } from '@angular/core'; // Importa Component para poder crear un componente de Angular
import { RouterLink } from '@angular/router'; // Importa RouterLink para poder usar routerLink en el HTML

@Component({
  imports: [RouterLink],
  selector: 'app-gestion-comunicados',
  styleUrl: './gestion-comunicados.css',
  templateUrl: './gestion-comunicados.html',
})
export class GestionComunicados { // Clase que contiene la lógica del componente Gestión de Comunicados

  estadoComunicado1: string = 'Pendiente'; // Guarda el estado del comunicado 1.  // Inicialmente comienza como "Pendiente"
  nuevoComunicado: any = null; // Guarda el nuevo comunicado creado por el usuario. // "any" permite guardar cualquier tipo de dato y empieza vacío (null)

  ngOnInit(): void {  // ngOnInit se ejecuta automáticamente cuando se inicia/carga el componente
    const estadoGuardado = localStorage.getItem('estado_comunicado_1'); // Busca en localStorage el estado guardado del comunicado 1

    if (estadoGuardado) {  // Si existe un estado guardado...
      this.estadoComunicado1 = estadoGuardado; // Reemplaza el estado inicial por el estado encontrado en localStorage
    }

    const comunicadoGuardado = localStorage.getItem('nuevo_comunicado_mp01'); // Busca en localStorage el comunicado guardado

    if (comunicadoGuardado) { // Si existe un comunicado guardado...
      // JSON.parse convierte el texto guardado en localStorage nuevamente en un objeto // y lo guarda en la variable nuevoComunicado
      this.nuevoComunicado = JSON.parse(comunicadoGuardado); 
    }
  }

  publicarComunicado1(): void { // Función que cambia el comunicado 1 al estado "Publicado"
    this.estadoComunicado1 = 'Publicado'; // Cambia el estado del comunicado a Publicado

    localStorage.setItem('estado_comunicado_1', 'Publicado');  // Guarda el nuevo estado en localStorage
  }

  publicarNuevoComunicado(): void {  // Función para publicar el nuevo comunicado creado por el usuario
  if (!this.nuevoComunicado) { // Si NO existe un nuevo comunicado...
    return; // Detiene la función y no continúa
  }

  this.nuevoComunicado.estado = 'Publicado'; // Cambia la propiedad estado del objeto nuevoComunicado a "Publicado"
  this.nuevoComunicado.fechaPublicacion = new Date().toISOString(); // Agrega al comunicado la fecha y hora en que fue publicado

  localStorage.setItem( // Guarda nuevamente el comunicado actualizado en localStorage
    'nuevo_comunicado_mp01', // Nombre o clave con la que se guarda
    JSON.stringify(this.nuevoComunicado)  // Convierte el objeto nuevoComunicado a texto // porque localStorage almacena cadenas de texto
  );
}



}


