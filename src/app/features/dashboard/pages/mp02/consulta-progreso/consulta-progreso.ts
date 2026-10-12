// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: DECORADORES, ENRUTADORES, SERVICIOS ASÍNCRONOS Y PRIMITIVAS REACTIVAS
// =====================================================================================================================
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// Importamos el servicio core que acabas de dar de alta en el proyecto para interactuar con AWS
import { ConsultaProgresoService, EvidenciaAdjunta } from '../../../../../core/services/consulta-progreso/consulta-progreso.service';

@Component({
  selector: 'app-consulta-progreso',
  standalone: true,
  // Mantendremos intactas tus directivas de control estructural para no alterar el renderizado condicional
  imports: [CommonModule, RouterLink],
  templateUrl: './consulta-progreso.html',
  styleUrl: './consulta-progreso.css'
})
export class ConsultaProgresoComponent implements OnInit {

  // INYECCIÓN MODERNA DE INFRAESTRUCTURA RELACIONAL EN ANGULAR 19
  private readonly consultaProgresoService = inject(ConsultaProgresoService);

  /**
   * SIGNAL DE CONTROL DE ACCESO (HU10): 
   * Gobierno centralizado de la compuerta visual. Cambiará dinámicamente a 'Publicado'.
   */
  protected readonly estadoFicha = signal<string>('En Proceso');

  /**
   * SIGNALS DE EXPEDIENTE ESCOLAR: Memorizan la identidad recuperada en caliente desde AWS.
   */
  protected readonly idFicha = signal<string>('0000');
  protected readonly nombreAlumno = signal<string>('Estudiante No Registrado');
  protected readonly bimestreDesc = signal<string>('Periodo Vigente');

  /**
   * SIGNALS CUALITATIVOS (SOLO LECTURA): Almacenan los textos descriptivos reales de SQL Server.
   */
  protected readonly observacionesLogros = signal<string>('');
  protected readonly observacionesDificultades = signal<string>('');
  protected readonly recomendacionesTutor = signal<string>('');
  protected readonly compromisosFamilia = signal<string>('');

  protected readonly evidenciasAdjuntas = signal<EvidenciaAdjunta[]>([]);

  protected readonly isLoading = signal<boolean>(false);
  protected readonly mensajeError = signal<string | null>(null);

  public ngOnInit(): void {
    // 1. Extraemos el identificador único del apoderado autenticado en la sesión actual
    const userIdLocal = localStorage.getItem('fc_user_id');

    if (!userIdLocal) {
      this.mensajeError.set('No se ha detectado una sesión válida de Padre de Familia. Por favor, reautentíquese.');
      this.estadoFicha.set('Bloqueado');
      return;
    }

    const idUsuarioAutenticado = Number(userIdLocal);

    // 2. Activamos el spinner visual de carga e iniciamos la invocación asíncrona hacia AWS API Gateway
    this.isLoading.set(true);
    this.mensajeError.set(null);

    this.consultaProgresoService.obtenerProgresoHijo(idUsuarioAutenticado).subscribe({
      
      // CAMINO ÉXITO (HTTP 200 OK): El backend localizó y compiló la bitácora relacional de SQL Server
      next: (respuestaAws) => {
        this.isLoading.set(false);
        
        // Seteamos la compuerta de control del flujo ('Publicado' o 'En Proceso')
        this.estadoFicha.set(respuestaAws.estadoFicha);

        // Si la ficha ya fue liberada por el profesor, inyectamos la data en las señales reactivas
        if (respuestaAws.estadoFicha === 'Publicado') {
          this.idFicha.set(String(respuestaAws.idFicha || '0000'));
          this.nombreAlumno.set(respuestaAws.nombreAlumno || 'Estudiante No Registrado');
          this.bimestreDesc.set(respuestaAws.bimestreDesc || 'Periodo Vigente');
          
          // Asignación de párrafos cualitativos de diagnóstico y retroalimentación
          this.observacionesLogros.set(respuestaAws.observacionesLogros || 'No se registraron observaciones de logros.');
          this.observacionesDificultades.set(respuestaAws.observacionesDificultades || 'No se registraron dificultades en el periodo.');
          this.recomendacionesTutor.set(respuestaAws.recomendacionesTutor || 'Sin recomendaciones registradas por el docente.');
          this.compromisosFamilia.set(respuestaAws.compromisosFamilia || 'Sin compromisos registrados en el periodo lectivo.');
          
          // Inyectamos las evidencias con sus llaves binarias y enlaces web nativos de Amazon S3
          this.evidenciasAdjuntas.set(respuestaAws.evidenciasAdjuntas || []);
        }
      },

      // CAMINO EXCEPCIÓN: Atrapa fallos del API Gateway, desconexiones o bloqueos de red
      error: (objetoErrorException) => {
        this.isLoading.set(false);
        this.estadoFicha.set('En Proceso'); // Ante cualquier fallo de red, se mantiene el fallback preventivo de protección
        const errorServidor = objetoErrorException.error?.error || 'Fallo crítico al conectar con el servidor AWS de progreso escolar.';
        this.mensajeError.set(errorServidor);
      }
    });
  }
}
