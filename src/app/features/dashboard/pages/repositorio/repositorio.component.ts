import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

interface RecursoPedagogico {
  id: number;
  titulo: string;
  curso: string;
  grado: string;
  descripcion: string;
  archivoUrl: string;
  fechaRegistro: string;
}

@Component({
  selector: 'app-repositorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './repositorio.component.html',
  styleUrl: './repositorio.component.css'
})
export class RepositorioComponent implements OnInit {
  recursoForm!: FormGroup;
  recursos: RecursoPedagogico[] = [];
  filtroBusqueda: string = '';
  filtroCurso: string = '';

  cursosList: string[] = ['Matemática', 'Comunicación', 'Ciencia y Tecnología', 'Ciencias Sociales', 'Inglés'];
  gradosList: string[] = ['1° Secundaria', '2° Secundaria', '3° Secundaria', '4° Secundaria', '5° Secundaria'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.recursoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      curso: ['', Validators.required],
      grado: ['', Validators.required],
      descripcion: ['', Validators.required],
      archivoUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });

    this.cargarRecursosIniciales();
  }

  cargarRecursosIniciales(): void {
    const dataGuardada = localStorage.getItem('repositorio_pedagogico');
    if (dataGuardada) {
      this.recursos = JSON.parse(dataGuardada);
    } else {
      this.recursos = [
        {
          id: 1,
          titulo: 'Guía de Ecuaciones Cuadráticas',
          curso: 'Matemática',
          grado: '3° Secundaria',
          descripcion: 'Ejercicios resueltos y guía de trabajo práctico.',
          archivoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fechaRegistro: '15/09/2026'
        },
        {
          id: 2,
          titulo: 'Comprensión Lectora - Mitos y Leyendas',
          curso: 'Comunicación',
          grado: '1° Secundaria',
          descripcion: 'Ficha de análisis literario y lectura guiada.',
          archivoUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fechaRegistro: '18/09/2026'
        }
      ];
      this.guardarEnLocalStorage();
    }
  }

  registrarRecurso(): void {
    if (this.recursoForm.valid) {
      const nuevoRecurso: RecursoPedagogico = {
        id: Date.now(),
        ...this.recursoForm.value,
        fechaRegistro: new Date().toLocaleDateString('es-PE')
      };

      this.recursos.unshift(nuevoRecurso);
      this.guardarEnLocalStorage();
      this.recursoForm.reset({ curso: '', grado: '' });
    }
  }

  eliminarRecurso(id: number): void {
    this.recursos = this.recursos.filter(r => r.id !== id);
    this.guardarEnLocalStorage();
  }

  guardarEnLocalStorage(): void {
    localStorage.setItem('repositorio_pedagogico', JSON.stringify(this.recursos));
  }

  get recursosFiltrados(): RecursoPedagogico[] {
    return this.recursos.filter(recurso => {
      const coincideTexto = recurso.titulo.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                            recurso.descripcion.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const coincideCurso = this.filtroCurso === '' || recurso.curso === this.filtroCurso;
      return coincideTexto && coincideCurso;
    });
  }
}