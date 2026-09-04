# AGENTS.md — SoundWave (Music Discovery Platform)

## 1. Objetivo del Proyecto

**SoundWave** es una aplicación web de descubrimiento de música sin derechos de autor (Creative Commons / CC0 / Royalty-Free) construida con estándares de ingeniería enterprise para portfolio profesional y entrevistas técnicas.

### Stack Tecnológico:
* **Backend**: Java 21 (LTS), Spring Boot 3.4.3 (Arquitectura de **Monolito Modular**).
* **Infraestructura Cloud**: Google Cloud Platform (GCP) Serverless.
  * **Cloud Run**: Alojamiento en contenedor con escalado a cero ($0.00 en reposo).
  * **Cloud Firestore**: Persistencia NoSQL para catálogo, auditoría de eventos y checkpoints.
  * **Cloud Scheduler**: Disparador OIDC programado cada 10 minutos (`POST /api/internal/sync`).
  * **Secret Manager**: Almacenamiento seguro de API keys (`gemini-api-key`, `jamendo-client-id`).
  * **Cloud Logging**: Observabilidad y trazas estructuradas en formato JSON.
* **Inteligencia Artificial**: Google Gemini API (Modelos 1.5 Flash / 2.0 Flash) con *Explainable AI*.
* **Frontend**: React 18 SPA + Vite + Tailwind CSS + Lucide Icons con reproductor continuo de streaming MP3.

### Bloques Principales de la Aplicación:
1. **Bloque A: "Top últimas 24hs."**
   * Muestra las canciones con mayor tracción y reproducciones acumuladas en las últimas 24 horas.
2. **Bloque B: "Novedades"**
   * Muestra los lanzamientos más recientes sincronizados desde catálogos abiertos.
3. **Bloque C: "Sugeridos" (Gemini AI)**
   * Recomendaciones inteligentes que analizan la distribución de escuchas por tiers (*Heavy Rotation*, *Growing*, *Underground*), dando visibilidad a gemas ocultas y nuevos talentos con explicaciones humanas.

---

## 2. Principios de Trabajo para Agentes

Antes de modificar código:
1. **Inspeccionar la arquitectura existente**: Respetar el diseño de Monolito Modular y el patrón Strategy (`MusicCatalogProvider`).
2. **Identificar los módulos afectados**: `config`, `controller`, `dto`, `model`, `provider`, `repository`, `service`.
3. **Revisar la documentación en `docs/`**: Consultar `docs/data-model.md`, `docs/api-contracts.md` y `docs/gemini-prompts.md`.
4. **No asumir contratos externos**: Jamendo, Free Music Archive u otras APIs deben encapsularse dentro de su respectivo `MusicCatalogProvider`.
5. **Formular un plan claro**: Validar compatibilidad tanto con el perfil `local` como con el perfil `gcp`.
6. **Mantener los cambios acotados**: No realizar refactorizaciones no solicitadas fuera del alcance de la tarea.

Después de modificar código:
1. **Compilar** el backend (`.\mvnw.cmd compile`) y el frontend (`npm run build`).
2. **Ejecutar la suite de tests** (`.\mvnw.cmd test`).
3. **Revisar warnings y errores** de compilación.
4. **Verificar que no existan secretos** expuestos en commits ni en código fuente.
5. **Comprobar compatibilidad GCP & Local**: El código debe funcionar 100% en local sin credenciales y en Cloud Run con Secret Manager.
6. **Actualizar la documentación** si cambia la arquitectura o los contratos de datos.

> [!IMPORTANT]
> Una tarea no se considera terminada únicamente porque el código compile; debe estar probada y documentada.

---

## 3. Reglas de Seguridad

Bajo ninguna circunstancia se debe:
* Introducir API keys o tokens directamente en archivos de código fuente (`.java`, `.js`, `.jsx`, `.yml`).
* Subir credenciales a Git ni permitir archivos de claves en `.gitignore`.
* Imprimir claves o tokens en logs de consola o Cloud Logging.
* Hardcodear credenciales de GCP (usar `GoogleCredentials.getApplicationDefault()` o Secret Manager).
* Deshabilitar validaciones de seguridad o CORS indebidamente.

Las credenciales se obtienen exclusivamente a través de:
1. **Entorno Local**: Variables de entorno (`.env` o `System.getenv()`).
2. **Entorno GCP**: Inyección desde **GCP Secret Manager** vía Cloud Run environment secrets.

---

## 4. Backend (Java 21 & Spring Boot 3)

El backend está estructurado como un **Monolito Modular**. Los módulos de negocio se comunican en memoria mediante contratos desacoplados:

### Módulo Provider & Strategy (`com.soundwave.musicdiscovery.provider`)
* **`MusicCatalogProvider` (Interfaz)**: Define el contrato `fetchLatestTracks(limit)`, `fetchTrackById(id)`, `getProviderName()`, `isAvailable()`.
* **`MusicProviderRegistry`**: Registra dinámicamente cualquier implementación de proveedor detectada por Spring.
* **Extensibilidad (OCP)**: Para añadir una nueva API (ej: Free Music Archive o Audius), sólo se crea una clase que implemente `MusicCatalogProvider` sin modificar el resto del sistema.

### Módulo Sync (`com.soundwave.musicdiscovery.service.SyncOrchestratorService`)
* Consulta los proveedores activos, detecta pistas inéditas comparando IDs externos contra Firestore y persiste las novedades.
* Diseñado para ser invocado automáticamente cada 10 minutos mediante `@Scheduled` o por webhook de Cloud Scheduler (`POST /api/internal/sync`).
* Aísla fallos: Si una API externa falla o tiene rate limit, las demás fuentes continúan sincronizándose y el fallo se registra en Cloud Logging sin tirar la app.
* No debe contener lógica de negocio de recomendación con Gemini.

### Módulo Recomendación (`com.soundwave.musicdiscovery.service.GeminiRecommendationService`)
* Consulta las métricas de las últimas 24 horas y agrupa las canciones en 3 tiers:
  * `HEAVY_ROTATION`: > 70% reproducciones relativas.
  * `GROWING`: 25% - 70% reproducciones relativas.
  * `UNDERGROUND`: < 25% reproducciones relativas (Gemas Ocultas).
* Construye un prompt estructurado (JSON Schema) para Gemini solicitando recomendaciones fundamentadas.
* Posee un **motor heurístico de fallback**: Si no hay API key o la red falla, genera recomendaciones inteligentes localmente con justificaciones contextuales.

### Módulo Estadísticas (`com.soundwave.musicdiscovery.service.StatsService`)
* Registra eventos de escucha y gestiona la ventana deslizante de 24 horas.
* La reproducción se contabiliza formalmente tras 5 segundos de escucha activa desde el reproductor frontend.

---

## 5. Firestore NoSQL

Firestore almacena las siguientes colecciones:
1. **`tracks`**: Metadatos de canciones (`id`, `title`, `artist`, `genre`, `audioUrl`, `coverUrl`, `durationSeconds`, `releaseDate`, `license`, `provider`, `externalId`, `playCount24h`, `totalPlays`).
2. **`play_events`**: Auditoría de reproducciones temporales (`id`, `trackId`, `timestamp`, `clientSession`).
3. **`sync_metadata`**: Checkpoints de sincronización por proveedor (`providerName`, `lastSyncAt`, `lastExternalId`, `newlyAddedTracks`, `status`).

Directrices:
* Antes de agregar campos o colecciones, consultar [`docs/data-model.md`](file:///F:/WWZ/docs/data-model.md).
* Utilizar transacciones atómicas para contadores concurrentes.
* Mantener la compatibilidad dual: Repositorios en memoria (`InMemoryTrackRepository`) para tests/local y `FirestoreTrackRepository` para perfil `gcp`.

---

## 6. Gemini AI

* **Propósito**: Curaduría humana y explicable de música independiente y rescate de nuevos artistas.
* **Límites de IA**:
  * No delegar a Gemini operaciones deterministas de base de datos o cálculos matemáticos simples.
  * El backend debe filtrar y pre-procesar el catálogo antes de invocar a Gemini.
  * El prompt debe exigir estrictamente salida JSON válida (`responseMimeType: application/json`).
  * Todas las respuestas de Gemini deben validarse y parsearse contra el catálogo real antes de ser expuestas en la API.

---

## 7. Infraestructura GCP & DevOps

* **Cloud Run**: Servicio administrado con `min-instances: 0` y `max-instances: 5` para garantizar costo $0 en reposo.
* **Cloud Scheduler**: Cron `*/10 * * * *` autenticado con OIDC Service Account.
* **Terraform**: Toda la infraestructura se define en [`infra/main.tf`](file:///F:/WWZ/infra/main.tf).
* **Docker Compose**: [`docker-compose.yml`](file:///F:/WWZ/docker-compose.yml) levanta Backend + Frontend con 1 comando.

---

## 8. Estrategia de Testing

Cada cambio debe estar respaldado por pruebas:

1. **Unit Tests (JUnit 5 + Mockito)**:
   * Lógica de particionado por tiers en `GeminiRecommendationServiceTest`.
   * Lógica de deduplicación e ingesta en `SyncOrchestratorServiceTest`.
2. **Integration Tests (MockMvc + SpringBootTest)**:
   * Endpoints REST en `TrackControllerTest` (`/api/tracks/top-24h`, `/api/tracks/recent`, `/api/tracks/{id}/play`).
3. **Frontend Build & Visual Verification**:
   * `npm run build` en el directorio `frontend/`.
   * Auditoría de fidelidad visual y diseño por `visual_qa` (sin bloqueos críticos en composición, burbujas, player, dark mode ni responsive). Ver detalles en [`docs/team-agents.md`](file:///F:/WWZ/docs/team-agents.md).

---

## 9. Git & Flujo de Trabajo

* Trabajar en ramas temáticas: `agent/<tipo>-<descripcion>` (ej: `agent/feature-audius-provider`, `agent/fix-tier-calculation`).
* Verificar que no haya secretos expuestos antes de hacer commit.
* Mensajes de commit semánticos (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).

---

## 10. Criterio de Finalización (Definition of Done)

Antes de dar por concluida una tarea:
* [ ] Implementación de código completada y formateada.
* [ ] Compilación exitosa sin errores (`.\mvnw.cmd compile`, `npm run build`).
* [ ] Tests ejecutados y pasando al 100% (`.\mvnw.cmd test`).
* [ ] Verificación de fidelidad visual por `visual_qa` (sin incidencias críticas de UI/UX).
* [ ] Verificación de seguridad: cero secretos en código o logs.
* [ ] Compatibilidad dual verificada (perfil `local` y `gcp`).
* [ ] Documentación actualizada en `docs/` o `ARCHITECTURE.md` si hubo cambios de diseño.
* [ ] Resumen claro de cambios entregado al usuario.
