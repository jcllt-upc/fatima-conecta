import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  // Al ser un componente de presentación estática, no requiere imports adicionales en este paso
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  // Este componente maneja el pie de página institucional unificado
}
