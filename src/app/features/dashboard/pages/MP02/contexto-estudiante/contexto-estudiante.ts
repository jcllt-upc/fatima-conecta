import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos las herramientas oficiales para construir y validar formularios reactivos en la lógica
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
// 1. Importamos la interfaz reutilizable desde la capa Core global que acabamos de crear
import { Estudiante } from '../../../../../core/models/estudiante.model';

@Component({
  selector: 'app-contexto-estudiante',
  standalone: true,
  // CommonModule es necesario para poder usar la directiva estructural @for en la lista de resultados
  // ReactiveFormsModule habilita el enlazado lógico del buscador y los selectores bimestrales
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contexto-estudiante.html',
  styleUrl: './contexto-estudiante.css'
})
export class ContextoEstudianteComponent implements OnInit {

  /**
   * CONSTANTE MOCK (BASE DE DATOS SIMULADA): Alumnos previamente dados de alta por el proceso P06.1.
   * Representa la información que el docente puede buscar en tiempo real para iniciar el seguimiento.
   */
  private readonly ESTUDIANTES_DB: Estudiante[] = [
    { id: 10, dni: '71234567', nombres: 'Juan Carlos', apellidos: 'Pérez Mendoza', gradoSeccion: '5to de Secundaria - Sección A' },
    { id: 11, dni: '72345678', nombres: 'María Fernanda', apellidos: 'Gómez Quispe', gradoSeccion: '5to de Secundaria - Sección A' },
    { id: 12, dni: '73456789', nombres: 'Carlos Alberto', apellidos: 'Sánchez Ruiz', gradoSeccion: '4to de Secundaria - Sección B' },
    { id: 13, dni: '74567890', nombres: 'Ana Lucía', apellidos: 'Villanueva Castro', gradoSeccion: '3ro de Secundaria - Sección C' }
  ];

  /**
   * SIGNAL: Almacena la lista de estudiantes filtrados que coinciden con lo que escribe el profesor.
   * Nace como una matriz vacía y se actualiza reactivamente durante la búsqueda.
   */
  protected readonly estudiantesFiltrados = signal<Estudiante[]>([]);

  /**
   * SIGNAL: Almacena de forma segura el expediente del estudiante seleccionado por el profesor.
   * Actúa como el 'Contexto Congelado'. Si está en null, significa que aún no se abre ninguna ficha escolar.
   */
  protected readonly estudianteSeleccionado = signal<Estudiante | null>(null);

  /**
   * SIGNAL: Almacena el número de la bitácora escolar creada tras presionar 'Abrir Ficha'.
   * Sirve para darle trazabilidad y confirmación visual al docente de que el registro fue exitoso.
   */
  protected readonly idFichaCreada = signal<number | null>(null);

  /**
   * FORMULARIO REACTIVO (FormGroup): Controla los campos de interacción en la pantalla.
   * Monitorea el buscador de texto y obliga a seleccionar un bimestre antes de guardar la ficha.
   */
  protected readonly contextoForm = new FormGroup({
    // Campo de búsqueda: permite ingresar texto libre (DNI o Nombres) para filtrar la grilla
    txtBuscar: new FormControl('', { nonNullable: true }),
    
    // Campo del Periodo: Obliga al docente a seleccionar una opción válida en el menú desplegable
    selBimestre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required] // Validación estricta: No se puede abrir ficha en el aire
    })
  });

  /**
   * Ciclo de vida inicial del componente: Se ejecuta automáticamente al renderizar la vista.
   * Inicializa la pantalla mostrando la lista completa de alumnos asignados por defecto al profesor.
   */
  public ngOnInit(): void {
    this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
  }

  /**
   * Método encargado de filtrar la lista de alumnos en tiempo real.
   * Captura el texto ingresado en el buscador y realiza una búsqueda de coincidencia por DNI o Apellidos.
   */
  protected ejecutarBusqueda(): void {
    const textoBuscado = this.contextoForm.controls.txtBuscar.value.toLowerCase().trim();
    
    // Si la caja de búsqueda está vacía, restablecemos la grilla con todos los estudiantes
    if (!textoBuscado) {
      this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
      return;
    }

    // Filtramos la base de datos local buscando coincidencias parciales en DNI, Nombres o Apellidos
    const resultados = this.ESTUDIANTES_DB.filter(estudiante => 
      estudiante.dni.includes(textoBuscado) || 
      estudiante.nombres.toLowerCase().includes(textoBuscado) || 
      estudiante.apellidos.toLowerCase().includes(textoBuscado)
    );

    // Actualizamos la señal con los resultados encontrados para refrescar la interfaz de usuario
    this.estudiantesFiltrados.set(resultados);
  }

  /**
   * Método que se gatilla al hacer clic sobre la fila o tarjeta de un alumno específico.
   * Almacena temporalmente el objeto seleccionado en el Signal de contexto.
   */
  protected seleccionarEstudiante(estudiante: Estudiante): void {
    this.estudianteSeleccionado.set(estudiante);
    this.idFichaCreada.set(null); // Reseteamos el estado de fichas creadas anteriormente
  }

  /**
   * ACCIÓN PRINCIPAL DE REGISTRO (HU12): Procesa la apertura y registro del contexto formativo.
   * Genera la fila virtual intermedia que enlazará las futuras evidencias cualitativas.
   */
  protected onRegistrarContexto(): void {
    // Forzamos la validación del selector de bimestre por si el docente intentó enviarlo vacío
    if (this.contextoForm.controls.selBimestre.invalid) {
      this.contextoForm.controls.selBimestre.markAsTouched();
      return;
    }

    const estudiante = this.estudianteSeleccionado();
    const bimestre = this.contextoForm.controls.selBimestre.value;

    // Si hay un alumno y un bimestre válidos en memoria, simulamos el guardado de la bitácora
    if (estudiante && bimestre) {
      // Generamos un identificador de ficha aleatorio simulando el ID autoincremental de AWS RDS
      const nuevoIdFicha = Math.floor(Math.random() * 9000) + 1000;
      
      // Actualizamos el Signal con el ID generado para desplegar el banner verde de éxito en el HTML
      this.idFichaCreada.set(nuevoIdFicha);

      // BUENA PRÁCTICA: Almacenamos el contexto unificado en el localStorage del navegador.
      // Esto permitirá que las futuras pantallas (Evidencias y Progreso) lean a qué alumno se está evaluando.
      localStorage.setItem('contexto_ficha_id', nuevoIdFicha.toString());
      localStorage.setItem('contexto_estudiante_nombre', `${estudiante.apellidos}, ${estudiante.nombres}`);
      localStorage.setItem('contexto_bimestre', bimestre);
    }
  }

  /**
   * Método auxiliar para limpiar los estados de la pantalla y cancelar el proceso actual.
   * Devuelve el componente a su estado neutro inicial de forma amigable.
   */
  protected limpiarFicha(): void {
    this.estudianteSeleccionado.set(null);
    this.idFichaCreada.set(null);
    this.contextoForm.reset();
    this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
  }

  /**
   * MÉTODO DE USABILIDAD: Limpia de golpe el texto ingresado en la caja del buscador.
   * Restablece la grilla al estado inicial y devuelve la lista completa de alumnos.
   */
  protected limpiarBuscador(): void {
    // Reseteamos el valor de la caja de texto a un string vacío
    this.contextoForm.controls.txtBuscar.setValue('');
    // Volvemos a ejecutar la función para pintar todos los estudiantes de la base de datos
    this.ejecutarBusqueda();
  }

}
