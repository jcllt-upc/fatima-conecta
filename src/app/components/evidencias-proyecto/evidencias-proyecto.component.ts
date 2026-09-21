import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnovacionService } from '../../services/innovacion.service';

@Component({
  selector: 'app-evidencias-proyecto',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="evidencias-container">
      <h2>Subir Avances y Evidencias (P04.2)</h2>
      <div class="upload-box">
        <input type="file" (change)="onFileSelected($event)" accept=".pdf,.jpg,.png">
        <button (click)="subirArchivo()" [disabled]="!archivoSeleccionado" class="btn-subir">Subir Evidencia</button>
      </div>
      @if (mensaje) { <p class="mensaje">{{ mensaje }}</p> }
    </div>
  `,
  styles: [`
    .evidencias-container { max-width: 600px; margin: 2rem auto; font-family: sans-serif; }
    .upload-box { border: 2px dashed #ccc; padding: 2rem; text-align: center; background: #f9f9f9; }
    input[type="file"] { margin: 1rem 0; width: 100%; }
    .btn-subir { background: #17a2b8; color: white; padding: 0.5rem 1rem; border: none; cursor: pointer; }
    .btn-subir:disabled { background: #ccc; }
    .mensaje { margin-top: 1rem; font-weight: bold; }
  `]
})
export class EvidenciasProyectoComponent {
  private innovacionService = inject(InnovacionService);
  archivoSeleccionado: File | null = null;
  mensaje = '';
  proyectoIdActual = 'proyecto-demo-123'; 

  onFileSelected(event: any) { 
    this.archivoSeleccionado = event.target.files[0]; 
  }

  subirArchivo() {
    if (this.archivoSeleccionado) {
      this.innovacionService.subirEvidencia(this.proyectoIdActual, this.archivoSeleccionado).subscribe({
        next: () => { 
          this.mensaje = 'Evidencia subida correctamente.'; 
          this.archivoSeleccionado = null; 
        }
      });
    }
  }
}