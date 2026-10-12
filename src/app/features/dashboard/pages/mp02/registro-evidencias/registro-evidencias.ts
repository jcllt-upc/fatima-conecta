// =====================================================================================================================
// 1. SECCIÓN DE IMPORTACIONES: DECORADORES, PRIMITIVAS REACTIVAS Y PROCESAMIENTO ASÍNCRONO MULTIMEDIA
// =====================================================================================================================

// Component, signal, OnInit, inject: Núcleo estructural de Angular para gobernar la vista, manejar estados y dependencias.
import { Component, signal, OnInit, inject } from '@angular/core';
// CommonModule: Habilita el renderizado condicional (@if) y bucles repetitivos (@for) en tu plantilla HTML.
import { CommonModule } from '@angular/common';
// RouterLink: Permite enganchar transiciones de navegación fluidas entre las pantallas de la UPC.
import { RouterLink } from '@angular/router';
// forkJoin: Operador de RxJS que une múltiples peticiones asíncronas paralelas y espera a que todas terminen con éxito.
import { forkJoin, Observable } from 'rxjs';
import { EvidenciasService } from '../../../../../core/services/evidencias/evidencias.service';

// EvidenciasService: El orquestador de red global creado por consola que interactúa con tu API Gateway y Amazon S3.

/**
 * INTERFAZ LOCAL ROBUSTA: Define el contrato de los objetos en memoria RAM.
 * Almacena el archivo binario nativo (esencial para la transferencia PUT final) y los metadatos visuales.
 */
interface EvidenciaPreview {
  id: string;
  nombre: string;
  tamano: string;
  tipo: string;
  urlPreview: string;   // Enlace temporal 'blob:' de corto alcance para pintar miniaturas locales
  archivoBinario: File; // El objeto binario puro de la computadora listo para ser transmitido a AWS S3
}

@Component({
  selector: 'app-registro-evidencias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './registro-evidencias.html',
  styleUrl: './registro-evidencias.css'
})
export class RegistroEvidenciasComponent implements OnInit {

  // INYECCIÓN MODERNA DE INFRAESTRUCTURA (DESACOPLADA Y SIN CONSTRUCTORES)
  private readonly evidenciasService = inject(EvidenciasService);

  /**
   * SIGNALS DE CONTEXTO CONGELADO (REGLA DE TESIS):
   * Recuperan y memorizan la identidad inmutable establecida en el subproceso P02.1.
   */
  protected readonly nombreEstudiante = signal<string>('No seleccionado');
  protected readonly bimestreActivo = signal<string>('');
  protected readonly idFichaContexto = signal<string>('');

  /**
   * SIGNAL DE PANEL TRANSACCIONAL (UX/UI):
   * Muestra el banner verde institucional de felicitación una vez que el 100% de los archivos están a salvo en AWS.
   */
  protected readonly mostrarAlertaExito = signal<boolean>(false);

  /**
   * SIGNAL DE BLOQUEO DE CONTROLES (SPINNER CLOUD):
   * Cambia a 'true' para inhabilitar botones y el Dropzone mientras los archivos se transmiten por internet.
   */
  protected readonly isLoading = signal<boolean>(false);

  /**
   * SIGNAL DE NOTIFICACIÓN DE EXCEPCIONES EN PANTALLA:
   * Captura en caliente si la red falla, si el token caduca o si SQL Server rechaza los metadatos por FK.
   */
  protected readonly mensajeError = signal<string | null>(null);

  /**
   * REJILLA REACTIVA CENTRAL: Matriz viva de previsualizaciones y binarios adjuntos por el docente.
   */
  protected readonly evidenciasCargadas = signal<EvidenciaPreview[]>([]);

  /**
   * REGLAS DE NEGOCIO INSTITUCIONALES PENSADAS PARA TU SUSTENTACIÓN
   */
  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Límite estricto de 5 Megabytes por archivo para cuidar el almacenamiento
  private readonly FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf']; // Lista blanca estricta

  /**
   * CICLO DE VIDA INICIALIZADOR (OnInit):
   * Descongela los hilos lógicos inmutables guardados en el disco local por el subproceso anterior.
   */
  public ngOnInit(): void {
    // Es vital notar que en tu componente anterior del contexto guardamos las variables como 'contexto_estudiante_id',
    // 'contexto_estudiante_nombre' y 'contexto_bimestre_texto'. Adecuamos las lecturas a esas llaves exactas.
    const fichaId = localStorage.getItem('contexto_estudiante_id');
    const estudiante = localStorage.getItem('contexto_estudiante_nombre');
    const bimestre = localStorage.getItem('contexto_bimestre_texto');

    if (fichaId && estudiante && bimestre) {
      this.idFichaContexto.set(fichaId);
      this.nombreEstudiante.set(estudiante);
      this.bimestreActivo.set(bimestre);
    }
  }

  /**
   * CAPTURA TRADICIONAL POR EXPLORADOR DE ARCHIVOS (BOTÓN AZUL DE LA COMPUTADORA)
   */
  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivos(input.files);
    }
  }

  /**
   * MOTOR DE VALIDACIÓN Y PRE-PROCESAMIENTO EN MEMORIA (DROPZONE / LOCAL)
   */
  private procesarArchivos(archivos: FileList): void {
    const listaActual = this.evidenciasCargadas();
    const nuevasEvidencias: EvidenciaPreview[] = [...listaActual];

    for (let i = 0; i < archivos.length; i++) {
      const archivoFisico = archivos[i];

      // CONTROL DE CALIDAD 1: Filtro de formato criptográfico / institucional
      if (!this.FORMATOS_PERMITIDOS.includes(archivoFisico.type)) {
        alert(`Archivo rechazado: "${archivoFisico.name}".\nSolo se permiten documentos en formato JPG, PNG o PDF.`);
        continue;
      }

      // CONTROL DE CALIDAD 2: Control preventivo de saturación de cuotas Cloud de Amazon S3
      if (archivoFisico.size > this.MAX_FILE_SIZE_BYTES) {
        alert(`Archivo rechazado: "${archivoFisico.name}".\nEl peso excede el límite permitido de 5 Megabytes.`);
        continue;
      }

      // Transformación a escala amigable legible para que el profesor sepa cuánto pesan sus archivos
      const pesoLegible = (archivoFisico.size / (1024 * 1024)).toFixed(2) + ' MB';
      const idLocal = Math.random().toString(36).substring(2, 9);

      // ASIGNACIÓN DE MINIATURAS: Si es PDF pintamos un icono estático, si es foto creamos un Blob de corto alcance
      const urlPreview = archivoFisico.type === 'application/pdf'
        ? 'https://wikimedia.org' // Icono premium estandarizado de PDF para la UI
        : URL.createObjectURL(archivoFisico);

      // Inyectamos el binario real dentro de la propiedad 'archivoBinario' para no perderlo al viajar a AWS
      nuevasEvidencias.push({
        id: idLocal,
        nombre: archivoFisico.name,
        tamano: pesoLegible,
        tipo: archivoFisico.type,
        urlPreview: urlPreview,
        archivoBinario: archivoFisico
      });
    }

    this.evidenciasCargadas.set(nuevasEvidencias);
  }

  /**
   * DESTRUCTOR DE CACHÉ LOCAL: Elimina miniaturas antes del disparo y evita fugas de memoria RAM en el navegador.
   */
  protected eliminarEvidencia(idEvidencia: string): void {
    const evidencia = this.evidenciasCargadas().find(e => e.id === idEvidencia);

    if (evidencia && !evidencia.tipo.includes('pdf')) {
      URL.revokeObjectURL(evidencia.urlPreview); // Rompemos el Blob de la RAM
    }

    const listaFiltrada = this.evidenciasCargadas().filter(e => e.id !== idEvidencia);
    this.evidenciasCargadas.set(listaFiltrada);
  }

  /**
   * ===================================================================================================================
   * 🚀 MOTOR TRANSACCIONAL DE CARGA MASIVA ASÍNCRONA EN LA NUBE (AMAZON S3 & AWS RDS - HU13)
   * ===================================================================================================================
   * Este método resuelve de forma magistral el envío en masa de múltiples archivos. Por cada archivo adjunto,
   * gatilla secuencialmente: 1. Petición de Firma (POST) ➔ 2. Subida física (PUT a S3) ➔ 3. Inserción lógica (POST a RDS).
   */
  protected guardarEvidencias(): void {
    // Validación inicial defensiva del Frontend
    if (this.evidenciasCargadas().length === 0) {
      alert('Debe adjuntar por lo menos un archivo de sustento (Foto o PDF) antes de guardar.');
      return;
    }

    // Congelamos controles e inicializamos hilos de descarte de alertas de error
    this.isLoading.set(true);
    this.mensajeError.set(null);

    // Recuperamos el ID numérico de la ficha activa que viaja de forma transparente
    const idBitacoraPadre = Number(this.idFichaContexto());
    const coleccionArchivos = this.evidenciasCargadas();

    // Matriz de Observables: Almacenará los hilos de ejecución individuales de cada archivo para unificarlos al final
    const flujosDeCargaS3yRds: Observable<any>[] = [];

    // Algoritmo de Orquestación Multipropósito por cada archivo en la Grilla
    coleccionArchivos.forEach((evidenciaItem) => {

      // Creamos un flujo asíncrono personalizado encapsulado para este archivo en particular
      const flujoIndividualCompleto = new Observable((observador) => {

        // FASE A: Tocamos la puerta de tu AWS Lambda para solicitar la Presigned URL de 5 minutos
        this.evidenciasService.solicitarFirmaSubidaS3(
          idBitacoraPadre,
          evidenciaItem.nombre,
          evidenciaItem.tipo
        ).subscribe({
          next: (respuestaFirmadaAws) => {

            // FASE B: Con la firma en mano, disparamos los bytes puros directamente hacia tu Bucket de Amazon S3 (PUT)
            this.evidenciasService.subirArchivoBinarioDirectoS3(
              respuestaFirmadaAws.urlSubidaFirmada,
              evidenciaItem.archivoBinario
            ).subscribe({
              next: () => {

                // FASE C: Una vez que S3 confirma el alojamiento físico, mandamos el INSERT INTO a tu SQL Server
                this.evidenciasService.registrarEvidenciaEnBaseDatos(
                  idBitacoraPadre,
                  respuestaFirmadaAws.nombreArchivoFinal,
                  respuestaFirmadaAws.urlLecturaFinal
                ).subscribe({
                  next: (respuestaRdsSuccess) => {
                    // Notificamos al observador central que este archivo culminó su viaje con rotundo éxito relacional
                    observador.next(respuestaRdsSuccess);
                    observador.complete();
                  },
                  error: (errRds) => observador.error(errRds) // Atrapa fallas lógicas de base de datos
                });
              },
              error: (errS3) => observador.error(errS3) // Atrapa bloqueos de red o fallas físicas en Amazon S3
            });
          },
          error: (errFirma) => observador.error(errFirma) // Atrapa caídas del API Gateway o la Lambda de firmas
        });
      });
      // Insertamos esta tarea en nuestra cola general de procesamiento masivo
      flujosDeCargaS3yRds.push(flujoIndividualCompleto);
    });
    // DISPARO CENTRALIZADO SIMULTÁNEO (FORKJOIN): Ejecuta en masa todas las cargas y espera el fin de la última
    forkJoin(flujosDeCargaS3yRds).subscribe({
      next: (resultadosGlobales) => {
        this.isLoading.set(false); // Apagamos el estado de carga liberando controles
        this.mostrarAlertaExito.set(true); // Desplegamos el hermoso banner de felicitación verde en el HTML
        // Memorizamos la cantidad de evidencias consolidadas para las lógicas de las pantallas siguientes
        localStorage.setItem('contexto_evidencias_count', coleccionArchivos.length.toString());
      },
      error: (fallaGeneralDeRed) => {
        this.isLoading.set(false); // Apagamos el spinner de carga para permitir descarte
        // Atrapamos la traza del error del backend de AWS y la proyectamos reactivamente al docente en la pantalla
        const detalleError = fallaGeneralDeRed.error?.error || 'Fallo crítico de red o de consistencia al sincronizar los archivos con los servidores de AWS.';
        this.mensajeError.set(detalleError);
      }
    });
  }
}