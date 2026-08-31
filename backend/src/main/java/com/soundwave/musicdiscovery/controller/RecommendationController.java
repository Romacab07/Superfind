package com.soundwave.musicdiscovery.controller;

import com.soundwave.musicdiscovery.dto.ApiResponse;
import com.soundwave.musicdiscovery.dto.RecommendedTrackDto;
import com.soundwave.musicdiscovery.service.GeminiRecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@Tag(name = "AI Recommendations", description = "Endpoints para recomendaciones explicables generadas por Gemini (Bloque C: Sugeridos)")
public class RecommendationController {

    private final GeminiRecommendationService geminiRecommendationService;

    public RecommendationController(GeminiRecommendationService geminiRecommendationService) {
        this.geminiRecommendationService = geminiRecommendationService;
    }

    /**
     * Bloque C: "Sugeridos" (Gemini AI)
     */
    @GetMapping("/gemini")
    @Operation(summary = "Obtiene recomendaciones personalizadas generadas por Gemini AI con razonamiento explicable (Bloque C)")
    public ResponseEntity<ApiResponse<List<RecommendedTrackDto>>> getGeminiRecommendations(
            @RequestParam(defaultValue = "6") int limit) {
        List<RecommendedTrackDto> recommendations = geminiRecommendationService.generateRecommendations(limit);
        return ResponseEntity.ok(ApiResponse.ok("Recomendaciones de Gemini generadas con éxito", recommendations));
    }

    @PostMapping("/gemini/refresh")
    @Operation(summary = "Fuerza la regeneración fresca de recomendaciones mediante Gemini AI")
    public ResponseEntity<ApiResponse<List<RecommendedTrackDto>>> refreshGeminiRecommendations(
            @RequestParam(defaultValue = "6") int limit) {
        List<RecommendedTrackDto> recommendations = geminiRecommendationService.generateRecommendations(limit);
        return ResponseEntity.ok(ApiResponse.ok("Recomendaciones regeneradas", recommendations));
    }
}
