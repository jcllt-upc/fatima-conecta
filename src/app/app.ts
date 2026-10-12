import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos RouterOutlet para habilitar la inyección dinámica de páginas según la URL
  imports: [RouterOutlet],
  // Vinculamos de forma estricta el archivo HTML externo para el diseño de la raíz
  templateUrl: './app.html',
  // Vinculamos el archivo CSS externo exclusivo para estilos de este componente raíz
  styleUrl: './app.css',
})
export class App {
  /**
   * Propiedad reactiva de solo lectura que almacena el nombre del ecosistema.
   * Se utiliza el patrón de 'Signals' de Angular para asegurar una reactividad óptima.
   */
  protected readonly title = signal('fatima-conecta');
}
