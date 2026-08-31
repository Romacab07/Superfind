---
name: music-provider-scaffolder
description: Genera e integra rápidamente un nuevo proveedor de música externa (ej. Free Music Archive, Audius, Freesound) implementando el patrón Strategy y registrándolo en el catálogo de SoundWave.
---

# Music Provider Scaffolder Skill

Esta skill guía la incorporación de nuevas APIs y catálogos de música sin copyright al backend de **SoundWave**, asegurando el cumplimiento del principio *Open/Closed* de SOLID.

## Procedimiento para Agregar un Nuevo Proveedor:

1. **Crear la clase en `com.soundwave.musicdiscovery.provider.impl`**:
   - Nombre de clase sugerido: `{NombrePlataforma}MusicProvider.java`
   - Debe implementar la interfaz `MusicCatalogProvider`.
   - Anotar con `@Component`.

2. **Implementar los 4 métodos del contrato**:
   ```java
   @Component
   public class AudiusMusicProvider implements MusicCatalogProvider {
       @Override
       public String getProviderName() {
           return "AUDIUS";
       }

       @Override
       public List<ExternalTrackDto> fetchLatestTracks(int limit) {
           // Realizar llamada HTTP a la API pública
           // Mapear cada elemento a ExternalTrackDto con licencia Creative Commons
       }

       @Override
       public Optional<ExternalTrackDto> fetchTrackById(String externalId) {
           // Consultar pista por su ID externo
       }

       @Override
       public boolean isAvailable() {
           // Retornar true si la API key o endpoint está configurado
       }
   }
   ```

3. **Verificación Automática**:
   - Spring Boot detectará automáticamente la nueva clase gracias al `MusicProviderRegistry`.
   - El `SyncOrchestratorService` la incluirá en la próxima sincronización de 10 minutos.

4. **Testing**:
   - Agregar un unit test en `SyncOrchestratorServiceTest` validando el mock del nuevo proveedor.
