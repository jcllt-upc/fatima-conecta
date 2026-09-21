import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface EvidenciaPreview {
  id: string;
  nombre: string;
  tamano: string;
  tipo: string;
  urlPreview: string;
}

@Component({
  selector: 'app-registro-evidencias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registro-evidencias.html',
  styleUrl: './registro-evidencias.css'
})
export class RegistroEvidenciasComponent implements OnInit {

  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  protected readonly mostrarAlertaExito = signal<boolean>(false);

  protected readonly evidenciasCargadas = signal<EvidenciaPreview[]>([]);

  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB convertidos a Bytes
  private readonly FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];

  public ngOnInit(): void {
    const fichaId = localStorage.getItem('contexto_ficha_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre');

    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    }
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivos(input.files);
    }
  }

  private procesarArchivos(archivos: FileList): void {
    const listaActual = this.evidenciasCargadas();
    const nuevasEvidencias: EvidenciaPreview[] = [...listaActual];

    for (let i = 0; i < archivos.length; i++) {
      const archivoFisico = archivos[i];

      if (!this.FORMATOS_PERMITIDOS.includes(archivoFisico.type)) {
        alert(`Archivo rechazado: "${archivoFisico.name}".\nSolo se permiten documentos en formato JPG, PNG o PDF.`);
        continue;
      }

      if (archivoFisico.size > this.MAX_FILE_SIZE_BYTES) {
        alert(`Archivo rechazado: "${archivoFisico.name}".\nEl peso excede el límite permitido de 5 Megabytes.`);
        continue;
      }

      const pesoLegible = (archivoFisico.size / (1024 * 1024)).toFixed(2) + ' MB';

      const idLocal = Math.random().toString(36).substring(2, 9);

      const urlPreview = archivoFisico.type === 'application/pdf' 
        ? 'https://flaticon.com'
        : URL.createObjectURL(archivoFisico);

      nuevasEvidencias.push({
        id: idLocal,
        nombre: archivoFisico.name,
        tamano: pesoLegible,
        tipo: archivoFisico.type,
        urlPreview: urlPreview
      });
    }

    this.evidenciasCargadas.set(nuevasEvidencias);
  }

  protected eliminarEvidencia(idEvidencia: string): void {
    const evidencia = this.evidenciasCargadas().find(e => e.id === idEvidencia);
    
    if (evidencia && !evidencia.tipo.includes('pdf')) {
      URL.revokeObjectURL(evidencia.urlPreview);
    }

    const listaFiltrada = this.evidenciasCargadas().filter(e => e.id !== idEvidencia);
    
    this.evidenciasCargadas.set(listaFiltrada);
  }

    protected guardarEvidencias(): void 
    {
      if (this.evidenciasCargadas().length === 0)
      {
      alert('Debe adjuntar por lo menos un archivo de sustento (Foto o PDF) antes de guardar.');
      return;
      }

      localStorage.setItem('contexto_evidencias_count', this.evidenciasCargadas().length.toString());
    
      this.mostrarAlertaExito.set(true);
    }
}
