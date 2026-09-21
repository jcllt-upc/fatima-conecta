import { Routes } from '@angular/router';
import { RegistroProyectoComponent } from './components/registro-proyecto/registro-proyecto.component';
import { EvidenciasProyectoComponent } from './components/evidencias-proyecto/evidencias-proyecto.component';
import { ValidacionProyectoComponent } from './components/validacion-proyecto/validacion-proyecto.component';
import { CatalogoInnovacionComponent } from './components/catalogo-innovacion/catalogo-innovacion.component';

export const routes: Routes = [
  { path: 'innovacion/registro', component: RegistroProyectoComponent },
  { path: 'innovacion/evidencias', component: EvidenciasProyectoComponent },
  { path: 'innovacion/validacion', component: ValidacionProyectoComponent },
  { path: 'innovacion/catalogo', component: CatalogoInnovacionComponent },
];