import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InnovacionService } from '../../services/innovacion.service';

@Component({
  selector: 'app-catalogo-innovacion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="catalogo-container">
      <h2>Repositorio de Innovación (P04.5)</h2>
      <div class="grid-proyectos">
        @for (proyecto of proyectos; track proyecto._id) {
          <div class="tarjeta-proyecto">
            <h3>{{ proyecto.titulo }}</h3>
            <span class="badge">{{ proyecto.area }}</span>
            <p>{{ proyecto.descripcion }}</p>
            <button (click)="verDetalle(proyecto._id)">Ver Evidencias</button>
          </div>
        } @empty {
          <p>No hay proyectos publicados actualmente.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .catalogo-container { max-width: 900px; margin: 2rem auto; font-family: sans-serif; }
    .grid-proyectos { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .tarjeta-proyecto { border: 1px solid #eee; padding: 1rem; border-radius: 8px; }
    .badge { background-color: #e9ecef; padding: 0.2rem 0.5rem; border-radius: 12px; }
    button { margin-top: 1rem; padding: 0.5rem; width: 100%; background: #28a745; color: white; border: none; cursor: pointer; }
  `]
})
export class CatalogoInnovacionComponent implements OnInit {
  private innovacionService = inject(InnovacionService);
  proyectos: any[] = [];

  ngOnInit() {
    this.innovacionService.consultarProyectosPublicos().subscribe({
      next: (data) => this.proyectos = data
    });
  }

  verDetalle(id: string) {}
}