package com.soundwave.musicdiscovery.controller;

import com.soundwave.musicdiscovery.dto.ApiResponse;
import com.soundwave.musicdiscovery.dto.PlayRequestDto;
import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.service.StatsService;
import com.soundwave.musicdiscovery.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
@Tag(name = "Tracks & Metrics", description = "Endpoints para consulta de catálogo (Bloque A y Bloque B) y registro de reproducciones")
public class TrackController {

    private final TrackService trackService;
    private final StatsService statsService;

    public TrackController(TrackService trackService, StatsService statsService) {
        this.trackService = trackService;
        this.statsService = statsService;
    }

    /**
     * Bloque A: "Top últimas 24hs"
     */
    @GetMapping("/top-24h")
    @Operation(summary = "Obtiene las canciones más reproducidas en las últimas 24 horas (Bloque A)")
    public ResponseEntity<ApiResponse<List<Track>>> getTopTracks24h(
            @RequestParam(defaultValue = "10") int limit) {
        List<Track> topTracks = trackService.getTopTracks24h(limit);
        return ResponseEntity.ok(ApiResponse.ok("Top canciones 24h recuperadas con éxito", topTracks));
    }

    /**
     * Bloque B: "Novedades"
     */
    @GetMapping("/recent")
    @Operation(summary = "Obtiene los lanzamientos más recientes del catálogo (Bloque B)")
    public ResponseEntity<ApiResponse<List<Track>>> getRecentTracks(
            @RequestParam(defaultValue = "12") int limit) {
        List<Track> recentTracks = trackService.getRecentTracks(limit);
        return ResponseEntity.ok(ApiResponse.ok("Novedades recuperadas con éxito", recentTracks));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtiene los detalles de una canción por su ID")
    public ResponseEntity<ApiResponse<Track>> getTrackById(@PathVariable String id) {
        return trackService.getTrackById(id)
                .map(track -> ResponseEntity.ok(ApiResponse.ok(track)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("Canción no encontrada")));
    }

    /**
     * Telemetría de escucha: Incrementa el contador de reproducción y audita el evento
     */
    @PostMapping("/{id}/play")
    @Operation(summary = "Registra un evento de reproducción para una canción e incrementa sus métricas 24h")
    public ResponseEntity<ApiResponse<String>> recordPlay(
            @PathVariable String id,
            @RequestBody(required = false) PlayRequestDto playRequest) {
        statsService.recordTrackPlay(id, playRequest);
        return ResponseEntity.ok(ApiResponse.ok("Reproducción registrada correctamente", "OK"));
    }
}
