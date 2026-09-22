import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface EvidenciaFamilia {
  nombre: string;
  tipo: string;
}

@Component({
  selector: 'app-consulta-progreso',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-progreso.html',
  styleUrl: './consulta-progreso.css'
})
export class ConsultaProgresoComponent implements OnInit {

  protected readonly estadoFicha = signal<string>('');

  protected readonly idFicha = signal<string>('');
  protected readonly nombreAlumno = signal<string>('');
  protected readonly bimestreDesc = signal<string>('');

  protected readonly observacionesLogros = signal<string>('');
  protected readonly observacionesDificultades = signal<string>('');
  protected readonly recomendacionesTutor = signal<string>('');
  protected readonly compromisosFamilia = signal<string>('');

  protected readonly evidenciasAdjuntas = signal<EvidenciaFamilia[]>([]);

  public ngOnInit(): void {
    const estadoSaved = localStorage.getItem('contexto_ficha_estado') || 'En Proceso';
    this.estadoFicha.set(estadoSaved);

    this.idFicha.set(localStorage.getItem('contexto_ficha_id') || '0000');
    this.nombreAlumno.set(localStorage.getItem('contexto_estudiante_nombre') || 'Estudiante No Registrado');
    this.bimestreDesc.set(localStorage.getItem('contexto_bimestre') || 'Periodo Vigente');

    if (estadoSaved === 'Publicado') {
      this.observacionesLogros.set(
        localStorage.getItem('contexto_evaluacion_logros') || 'No se registraron observaciones de logros.'
      );
      this.observacionesDificultades.set(
        localStorage.getItem('contexto_evaluacion_dificultades') || 'No se registraron dificultades en el periodo.'
      );
      this.recomendacionesTutor.set(
        localStorage.getItem('contexto_retro_recomendaciones') || 'Sin recomendaciones registradas por el docente.'
      );
      this.compromisosFamilia.set(
        localStorage.getItem('contexto_retro_compromisos') || 'Sin compromisos registrados en el periodo lectivo.'
      );

      const totalArchivos = parseInt(localStorage.getItem('contexto_evidencias_count') || '0', 10);
      const subprocesoEvidenciasMocks: EvidenciaFamilia[] = [];

      if (totalArchivos > 0) {
        subprocesoEvidenciasMocks.push({ nombre: 'TallerSemana2.pdf', tipo: 'pdf' });
        if (totalArchivos > 1) {
          subprocesoEvidenciasMocks.push({ nombre: 'star-sky.jpg', tipo: 'image' });
        }
      }
      this.evidenciasAdjuntas.set(subprocesoEvidenciasMocks);
    }
  }
}
