package com.soundwave.musicdiscovery.controller;

import com.soundwave.musicdiscovery.dto.ApiResponse;
import com.soundwave.musicdiscovery.model.SyncStatus;
import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.MusicProviderRegistry;
import com.soundwave.musicdiscovery.service.SyncOrchestratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal")
@Tag(name = "Cloud Scheduler & Operations", description = "Endpoints de sincronización automatizada para Cloud Scheduler y monitoreo de proveedores")
public class SyncController {

    private final SyncOrchestratorService syncOrchestratorService;
    private final MusicProviderRegistry providerRegistry;

    public SyncController(
            SyncOrchestratorService syncOrchestratorService,
            MusicProviderRegistry providerRegistry) {
        this.syncOrchestratorService = syncOrchestratorService;
        this.providerRegistry = providerRegistry;
    }

    /**
     * Webhook triggered by Cloud Scheduler every 10 minutes
     */
    @PostMapping("/sync")
    @Operation(summary = "Ejecuta el proceso de sincronización para todos los proveedores activos (Cloud Scheduler Webhook)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerSync() {
        Map<String, Object> results = syncOrchestratorService.syncAllProviders();
        return ResponseEntity.ok(ApiResponse.ok("Sincronización multi-proveedor completada", results));
    }

    @GetMapping("/sync/status")
    @Operation(summary = "Consulta el estado histórico de sincronización de cada proveedor")
    public ResponseEntity<ApiResponse<List<SyncStatus>>> getSyncStatus() {
        List<SyncStatus> statuses = syncOrchestratorService.getAllSyncStatuses();
        return ResponseEntity.ok(ApiResponse.ok("Estados de sincronización", statuses));
    }

    @GetMapping("/providers")
    @Operation(summary = "Lista todos los proveedores de música registrados en el sistema")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProviders() {
        List<Map<String, Object>> providers = providerRegistry.getAllProviders().stream()
                .map(p -> Map.<String, Object>of(
                        "name", p.getProviderName(),
                        "available", p.isAvailable()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.ok("Proveedores detectados", providers));
    }
}
