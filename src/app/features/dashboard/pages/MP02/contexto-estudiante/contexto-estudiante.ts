import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Estudiante } from '../../../../../core/models/estudiante.model';

@Component({
  selector: 'app-contexto-estudiante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contexto-estudiante.html',
  styleUrl: './contexto-estudiante.css'
})
export class ContextoEstudianteComponent implements OnInit {

  private readonly ESTUDIANTES_DB: Estudiante[] = [
    { id: 10, dni: '71234567', nombres: 'Juan Carlos', apellidos: 'Pérez Mendoza', gradoSeccion: '5to de Secundaria - Sección A' },
    { id: 11, dni: '72345678', nombres: 'María Fernanda', apellidos: 'Gómez Quispe', gradoSeccion: '5to de Secundaria - Sección A' },
    { id: 12, dni: '73456789', nombres: 'Carlos Alberto', apellidos: 'Sánchez Ruiz', gradoSeccion: '4to de Secundaria - Sección B' },
    { id: 13, dni: '74567890', nombres: 'Ana Lucía', apellidos: 'Villanueva Castro', gradoSeccion: '3ro de Secundaria - Sección C' }
  ];

  protected readonly estudiantesFiltrados = signal<Estudiante[]>([]);
  protected readonly estudianteSeleccionado = signal<Estudiante | null>(null);

  protected readonly idFichaCreada = signal<number | null>(null);

  protected readonly contextoForm = new FormGroup({
    txtBuscar: new FormControl('', { nonNullable: true }),
    
    selBimestre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required] // Validación estricta: No se puede abrir ficha en el aire
    })
  });

  public ngOnInit(): void {
    this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
  }

  protected ejecutarBusqueda(): void {
    const textoBuscado = this.contextoForm.controls.txtBuscar.value.toLowerCase().trim();
    
    if (!textoBuscado) {
      this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
      return;
    }

    const resultados = this.ESTUDIANTES_DB.filter(estudiante => 
      estudiante.dni.includes(textoBuscado) || 
      estudiante.nombres.toLowerCase().includes(textoBuscado) || 
      estudiante.apellidos.toLowerCase().includes(textoBuscado)
    );

    this.estudiantesFiltrados.set(resultados);
  }

  protected seleccionarEstudiante(estudiante: Estudiante): void {
    this.estudianteSeleccionado.set(estudiante);
    this.idFichaCreada.set(null); // Reseteamos el estado de fichas creadas anteriormente
  }

  protected onRegistrarContexto(): void {
    if (this.contextoForm.controls.selBimestre.invalid) {
      this.contextoForm.controls.selBimestre.markAsTouched();
      return;
    }

    const estudiante = this.estudianteSeleccionado();
    const bimestre = this.contextoForm.controls.selBimestre.value;

    if (estudiante && bimestre) {
      const nuevoIdFicha = Math.floor(Math.random() * 9000) + 1000;
      
      this.idFichaCreada.set(nuevoIdFicha);

      localStorage.setItem('contexto_ficha_id', nuevoIdFicha.toString());
      localStorage.setItem('contexto_estudiante_nombre', `${estudiante.apellidos}, ${estudiante.nombres}`);
      localStorage.setItem('contexto_bimestre', bimestre);
    }
  }

  protected limpiarFicha(): void {
    this.estudianteSeleccionado.set(null);
    this.idFichaCreada.set(null);
    this.contextoForm.reset();
    this.estudiantesFiltrados.set(this.ESTUDIANTES_DB);
  }

  protected limpiarBuscador(): void {
    this.contextoForm.controls.txtBuscar.setValue('');
    this.ejecutarBusqueda();
  }

}
