import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InnovacionService } from '../../services/innovacion.service';

@Component({
  selector: 'app-validacion-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="panel-container">
      <h2>Gestión y Validación de Proyectos (P04.3 y P04.4)</h2>
      <table>
        <thead>
          <tr><th>Proyecto</th><th>Estado Actual</th><th>Validación</th><th>Publicación</th></tr>
        </thead>
        <tbody>
          @for (proyecto of proyectosMock; track proyecto._id) {
            <tr>
              <td>{{ proyecto.titulo }}</td>
              <td>{{ proyecto.estado }}</td>
              <td class="acciones">
                <input type="text" [(ngModel)]="proyecto.observaciones" placeholder="Observaciones">
                <button class="btn-aprobar" (click)="validar(proyecto._id, 'Validado', proyecto.observaciones)">Aprobar</button>
                <button class="btn-rechazar" (click)="validar(proyecto._id, 'Rechazado', proyecto.observaciones)">Rechazar</button>
              </td>
              <td>
                <button class="btn-publicar" [disabled]="proyecto.estado !== 'Validado'" (click)="publicar(proyecto._id)">Publicar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .panel-container { max-width: 1000px; margin: 2rem auto; font-family: sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
    .acciones { display: flex; gap: 0.5rem; }
    button { padding: 0.4rem 0.8rem; border: none; cursor: pointer; color: white; }
    .btn-aprobar { background: #28a745; }
    .btn-rechazar { background: #dc3545; }
    .btn-publicar { background: #007bff; }
    .btn-publicar:disabled { background: #aaa; }
  `]
})
export class ValidacionProyectoComponent {
  private innovacionService = inject(InnovacionService);
  
  proyectosMock = [
    { _id: '1', titulo: 'IA en Matemáticas', estado: 'Borrador', observaciones: '' },
    { _id: '2', titulo: 'Reciclaje', estado: 'Validado', observaciones: '' }
  ];

  validar(id: string, nuevoEstado: string, obs: string) {
    this.innovacionService.validarProyecto(id, nuevoEstado, obs).subscribe({
      next: () => alert(`Proyecto ${nuevoEstado}.`)
    });
  }

  publicar(id: string) {
    this.innovacionService.publicarProyecto(id).subscribe({
      next: () => alert('Proyecto publicado.')
    });
  }
}