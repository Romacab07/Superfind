package com.soundwave.musicdiscovery.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soundwave.musicdiscovery.config.GeminiConfig;
import com.soundwave.musicdiscovery.dto.RecommendedTrackDto;
import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.repository.inmemory.InMemoryTrackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class GeminiRecommendationServiceTest {

    private InMemoryTrackRepository trackRepository;
    private GeminiRecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        trackRepository = new InMemoryTrackRepository();
        GeminiConfig config = new GeminiConfig();
        config.setApiKey(""); // Test heuristic mode
        SecretManagerService secretService = new SecretManagerService(null, null) {
            @Override
            public String getSecret(String name, String def) {
                return def;
            }
        };

        recommendationService = new GeminiRecommendationService(
                trackRepository,
                config,
                secretService,
                new RestTemplateBuilder(),
                new ObjectMapper()
        );
    }

    @Test
    void shouldGenerateRecommendationsWithHeuristicReasoningWhenApiKeyNotPresent() {
        for (int i = 1; i <= 10; i++) {
            trackRepository.save(Track.builder()
                    .title("Track " + i)
                    .artist("Artist " + i)
                    .genre("Synthwave")
                    .audioUrl("https://example.com/audio" + i + ".mp3")
                    .playCount24h((long) (i * 10))
                    .releaseDate(Instant.now())
                    .build());
        }

        List<RecommendedTrackDto> recommendations = recommendationService.generateRecommendations(5);

        assertNotNull(recommendations);
        assertEquals(5, recommendations.size());

        for (RecommendedTrackDto reco : recommendations) {
            assertNotNull(reco.getTrack());
            assertNotNull(reco.getReasoning(), "Must have explainable AI reasoning");
            assertNotNull(reco.getTier(), "Must be categorized in a play tier");
            assertNotNull(reco.getVibeSummary(), "Must have vibe summary");
            assertTrue(reco.getConfidenceScore() > 0.0);
        }
    }
}
