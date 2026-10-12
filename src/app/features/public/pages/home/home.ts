import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  // Al ser una página estática por el momento, no requiere imports adicionales en este paso
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
// Forzamos el sufijo Component para cumplir estrictamente con el estándar académico de nomenclatura
export class HomeComponent {
  // Aquí se inyectará la lógica reactiva o Signals de la vista en fases posteriores
}
