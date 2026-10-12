import { Component } from '@angular/core';
// RouterLink: Directiva que reemplaza los enlaces tradicionales 'href' para interceptar los clics del usuario dentro de la aplicación SPA.
//             Evita por completo la recarga o el parpadeo del navegador al no realizar peticiones de red externas hacia el servidor web.
//             Analiza internamente el mapa de rutas mapeado para destruir el componente actual e inyectar el nuevo destino en milisegundos
// RouterLinkActive: Directiva encargada de monitorear en tiempo real la barra de direcciones del navegador sin usar lógica TypeScript 
//                   manual.
//                   Inyecta o remueve de forma automatizada clases CSS específicas (como 'active-link') al elemento cuando coincide con 
//                   la ruta activa.
//                   Requiere la propiedad '[routerLinkActiveOptions]="{exact: true}"' en la raíz para que el menú 'Inicio' no se quede 
//                   prendido al visitar subpáginas.
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  // Importamos RouterLink para cambiar de URL sin parpadeos ni recargas de página.
  // Importamos RouterLinkActive para que Angular pinte automáticamente la pestaña activa
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  // Este componente maneja la barra de navegación pública superior
}
