import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-historico-comunicados',
  styleUrl: './historico-comunicados.css',
  templateUrl: './historico-comunicados.html',
})
export class HistoricoComunicados {

  comunicadosHistoricos = [
    {
      dia: '20',
      mes: 'AGO',
      tipo: 'INSTITUCIONAL',
      titulo: 'Ceremonia por aniversario institucional',
      descripcion: 'Comunicado relacionado con las actividades realizadas por el aniversario de nuestra institución educativa.'
    },
    {
      dia: '08',
      mes: 'AGO',
      tipo: 'ACADÉMICO',
      titulo: 'Cronograma de evaluaciones',
      descripcion: 'Información sobre el cronograma de evaluaciones correspondiente al periodo académico.'
    },
    {
      dia: '25',
      mes: 'JUL',
      tipo: 'ACTIVIDADES',
      titulo: 'Actividades por Fiestas Patrias',
      descripcion: 'Información sobre las actividades desarrolladas por la comunidad educativa con motivo de Fiestas Patrias.'
    }
  ];

}
