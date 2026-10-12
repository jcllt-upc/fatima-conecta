import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Importamos la clase de tu nuevo Navbar institucional
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
// 1. Importamos la clase de tu nuevo Footer institucional
import { FooterComponent } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  // Importamos RouterOutlet para que este contenedor pueda renderizar páginas hijas en su interior
  // Registramos el NavbarComponent en los imports para que sea una etiqueta válida en el HTML
  // Registramos el FooterComponent en los imports al lado del Navbar y RouterOutlet
  imports: [RouterOutlet,NavbarComponent,FooterComponent],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css'
})
export class PublicLayoutComponent {
  // Este componente actúa como la plantilla maestra (Master Page) para el entorno público
}
