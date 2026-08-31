package com.soundwave.musicdiscovery.controller;

import com.soundwave.musicdiscovery.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "System Health", description = "Endpoints de salud para liveness y readiness probes de Cloud Run")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Verificación de estado de salud del servicio Cloud Run")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> health = Map.of(
                "status", "UP",
                "service", "soundwave-music-discovery",
                "version", "1.0.0",
                "timestamp", Instant.now().toString(),
                "runtime", "Java 21 / Cloud Run Ready"
        );
        return ResponseEntity.ok(ApiResponse.ok("Servicio operativo", health));
    }
}
