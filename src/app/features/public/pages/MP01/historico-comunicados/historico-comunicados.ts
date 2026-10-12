import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-historico-comunicados',
  styleUrl: './historico-comunicados.css',
  templateUrl: './historico-comunicados.html',
})
export class HistoricoComunicados { // Contiene los datos de los comunicados históricos

  comunicadosHistoricos = [ // Arreglo que almacena los comunicados antiguos // que serán mostrados en la página de histórico

    // COMUNICADO HISTÓRICO 1
    {
      dia: '20',
      mes: 'AGO',
      tipo: 'INSTITUCIONAL',
      titulo: 'Ceremonia por aniversario institucional',
      descripcion: 'Comunicado relacionado con las actividades realizadas por el aniversario de nuestra institución educativa.'
    },

      // COMUNICADO HISTÓRICO 2
    {
      dia: '08',
      mes: 'AGO',
      tipo: 'ACADÉMICO',
      titulo: 'Cronograma de evaluaciones',
      descripcion: 'Información sobre el cronograma de evaluaciones correspondiente al periodo académico.'
    },

    // COMUNICADO HISTÓRICO 3
    {
      dia: '25',
      mes: 'JUL',
      tipo: 'ACTIVIDADES',
      titulo: 'Actividades por Fiestas Patrias',
      descripcion: 'Información sobre las actividades desarrolladas por la comunidad educativa con motivo de Fiestas Patrias.'
    }
  ];

}
