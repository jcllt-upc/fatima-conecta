// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: DECORADORES, ENRUTADORES, SERVICIOS ASÍNCRONOS Y PRIMITIVAS REACTIVAS
// =====================================================================================================================
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// Importamos los componentes oficiales de formularios reactivos y validadores estrictos de Angular
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
// RetroalimentacionService: Conecta de forma directa con tu endpoint productivo en Amazon API Gateway
import { RetroalimentacionService } from '../../../../../core/services/retroalimentacion/retroalimentacion.service';

@Component({
  selector: 'app-retroalimentacion',
  standalone: true,
  // ReactiveFormsModule habilita el control estructurado de los campos de texto de compromisos
  // CommonModule y RouterLink manejan las directivas condicionales y de navegación entre subprocesos
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './retroalimentacion.html',
  styleUrl: './retroalimentacion.css'
})
export class RetroalimentacionComponent implements OnInit {

  // INYECCIÓN MODERNA DE INFRAESTRUCTURA CLOUD (ANGULAR 19 + SERVERLESS)
  private readonly retroalimentacionService = inject(RetroalimentacionService);

  /**
   * SIGNALS DE CONTEXTO CONGELADO:
   * Corrige la lectura de llaves físicas reales para heredar la consistencia del expediente (HU12, HU14).
   */
  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  /**
   * SIGNALS DE USABILIDAD (CONTADORES VIVOS): Almacenan en tiempo real la cantidad de letras escritas.
   * Angular reaccará de forma quirúrgica actualizando el contador visual sin refrescar la pantalla.
   */
  protected readonly conteoRecomendaciones = signal<number>(0);
  protected readonly conteoCompromisos = signal<number>(0);

  /**
   * SIGNAL DE BLOQUEO DE CONTROLES (UX DE PREVENCIÓN):
   * Se activa durante el viaje de los datos hacia AWS Lambda para evitar dobles clics accidentales.
   */
  protected readonly isLoading = signal<boolean>(false);

  /**
   * SIGNAL DE TRAZA DE EXCEPCIONES EN RED:
   * Almacena y despliega leyendas descriptivas si la base de datos RDS rechaza los textos.
   */
  protected readonly mensajeError = signal<string | null>(null);

  /**
   * SIGNAL DE UI: Controla la transición final de la pantalla (Oculta el formulario y muestra la confirmación de publicación).
   */
  protected readonly mostrarExitoPublicacion = signal<boolean>(false);

  /**
   * REGLAS DE NEGOCIO PEDAGÓGICAS: Límites máximos de caracteres permitidos en la base de datos.
   */
  protected readonly MAX_CARACTERES = 1000;

  /**
   * FORMULARIO REACTIVO (FormGroup): Centraliza el estado lógico de la retroalimentación cualitativa.
   * Valida que ambos campos sean obligatorios y no excedan el tamaño máximo de almacenamiento.
   */
  protected readonly retroalimentacionForm = new FormGroup({
    txtRecomendaciones: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    }),
    txtCompromisos: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.MAX_CARACTERES)]
    })
  });

  /**
   * Ciclo de vida inicial: Lee la memoria compartida para heredar de forma transparente el contexto congelado.
   */
  public ngOnInit(): void {
    // Sincronización milimétrica de llaves físicas reales mapeadas en tus DevTools
    const fichaId = localStorage.getItem('contexto_estudiante_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre_texto');

    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    } else {
      this.mensajeError.set('No se ha detectado ninguna ficha activa en el contexto. Regrese al módulo inicial.');
    }
  }

  /**
   * MÉTODO DE USABILIDAD: Escucha activamente cada pulsación de tecla en la caja de 'Recomendaciones'.
   * Sincroniza la longitud del texto directamente con su Signal correspondiente.
   */
  protected actualizarContadorRecomendaciones(): void {
    const longitudText = this.retroalimentacionForm.controls.txtRecomendaciones.value.length;
    this.conteoRecomendaciones.set(longitudText);
  }

  /**
   * MÉTODO DE USABILIDAD: Escucha activamente cada pulsación de tecla en la caja de 'Compromisos'.
   */
  protected actualizarContadorCompromisos(): void {
    const longitudText = this.retroalimentacionForm.controls.txtCompromisos.value.length;
    this.conteoCompromisos.set(longitudText);
  }

  /**
   * ACCIÓN FINAL DE EMISIÓN (HU14, HU15): Cierra y sella la bitácora escolar del bimestre.
   * Dispara el payload hacia Amazon API Gateway provocando la mutación definitiva a estado 'Publicado'.
   */
  protected onFinalizarPublicacion(): void {
    // Si el docente dejó los campos vacíos o excedió el tamaño de letras, activamos los bordes rojos.
    if (this.retroalimentacionForm.invalid || !this.idFichaContexto()) {
      this.retroalimentacionForm.markAllAsTouched();
      return;
    }

    // Congelamos UI y limpiamos errores residuales
    this.isLoading.set(true);
    this.mensajeError.set(null);

    // Extraemos los valores del formulario estructurado y parseamos el ID a tipo numérico
    const idEstudianteNumerico = Number(this.idFichaContexto());
    const recomendacionesTexto = this.retroalimentacionForm.controls.txtRecomendaciones.value;
    const compromisosTexto = this.retroalimentacionForm.controls.txtCompromisos.value;

    // CONSUMO TRANSACCIONAL DE TU BACKEND EN AWS LAMBDA
    this.retroalimentacionService.registrarRetroalimentacion(
      idEstudianteNumerico,
      recomendacionesTexto,
      compromisosTexto
    ).subscribe({
      
      // CAMINO ÉXITO (HTTP 200 OK): Columnas selladas y estado transicionado a 'Publicado' en RDS
      next: (respuestaAws) => {
        this.isLoading.set(false);
        this.mostrarExitoPublicacion.set(true); // Oculta el formulario e inyecta la card premium de éxito

        // Persistimos formalmente las conclusiones en el localStorage simulando las columnas finales de AWS RDS
        localStorage.setItem('contexto_retro_recomendaciones', recomendacionesTexto);
        localStorage.setItem('contexto_retro_compromisos', compromisosTexto);
        localStorage.setItem('contexto_ficha_estado', 'Publicado');
      },

      // CAMINO CONTROL DE EXCEPCIONES: Atrapa cortes de red, caídas de la BD o respuestas fallidas de la nube
      error: (objetoErrorException) => {
        this.isLoading.set(false);
        const errorServidor = objetoErrorException.error?.error || 'Fallo crítico al sincronizar e inmunizar la bitácora en AWS.';
        this.mensajeError.set(errorServidor);
      }
    });
  }
}
