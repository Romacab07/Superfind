package com.soundwave.musicdiscovery.service;

import com.soundwave.musicdiscovery.model.SyncStatus;
import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.MusicProviderRegistry;
import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;
import com.soundwave.musicdiscovery.repository.inmemory.InMemorySyncStatusRepository;
import com.soundwave.musicdiscovery.repository.inmemory.InMemoryTrackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

class SyncOrchestratorServiceTest {

    private InMemoryTrackRepository trackRepository;
    private InMemorySyncStatusRepository syncStatusRepository;
    private MusicCatalogProvider mockProvider;
    private MusicProviderRegistry providerRegistry;
    private SyncOrchestratorService syncOrchestratorService;

    @BeforeEach
    void setUp() {
        trackRepository = new InMemoryTrackRepository();
        syncStatusRepository = new InMemorySyncStatusRepository();

        mockProvider = Mockito.mock(MusicCatalogProvider.class);
        when(mockProvider.getProviderName()).thenReturn("MOCK_PROVIDER");
        when(mockProvider.isAvailable()).thenReturn(true);

        providerRegistry = new MusicProviderRegistry(List.of(mockProvider));
        syncOrchestratorService = new SyncOrchestratorService(providerRegistry, trackRepository, syncStatusRepository);
    }

    @Test
    void shouldSyncNewTracksSuccessfully() {
        ExternalTrackDto track1 = ExternalTrackDto.builder()
                .externalId("ext-100")
                .title("Future Bass Anthem")
                .artist("Cyber Wave")
                .genre("Electronic")
                .audioUrl("https://example.com/audio1.mp3")
                .providerName("MOCK_PROVIDER")
                .build();

        ExternalTrackDto track2 = ExternalTrackDto.builder()
                .externalId("ext-101")
                .title("Sunset Drive")
                .artist("Neon Glow")
                .genre("Synthwave")
                .audioUrl("https://example.com/audio2.mp3")
                .providerName("MOCK_PROVIDER")
                .build();

        when(mockProvider.fetchLatestTracks(anyInt())).thenReturn(List.of(track1, track2));

        Map<String, Object> result = syncOrchestratorService.syncAllProviders();

        assertNotNull(result);
        assertTrue(result.containsKey("MOCK_PROVIDER"));

        assertEquals(2, trackRepository.count());
        Optional<Track> saved = trackRepository.findByExternalIdAndProvider("ext-100", "MOCK_PROVIDER");
        assertTrue(saved.isPresent());
        assertEquals("Future Bass Anthem", saved.get().getTitle());

        Optional<SyncStatus> status = syncStatusRepository.findByProviderName("MOCK_PROVIDER");
        assertTrue(status.isPresent());
        assertEquals("SUCCESS", status.get().getStatus());
        assertEquals(2, status.get().getNewlyAddedTracks());
    }

    @Test
    void shouldNotDuplicateExistingTracksOnSubsequentSync() {
        ExternalTrackDto track1 = ExternalTrackDto.builder()
                .externalId("ext-200")
                .title("Ambient Cosmos")
                .artist("Stella")
                .genre("Ambient")
                .audioUrl("https://example.com/ambient.mp3")
                .providerName("MOCK_PROVIDER")
                .build();

        when(mockProvider.fetchLatestTracks(anyInt())).thenReturn(List.of(track1));

        // First sync
        syncOrchestratorService.syncAllProviders();
        assertEquals(1, trackRepository.count());

        // Second sync with the same track
        syncOrchestratorService.syncAllProviders();
        assertEquals(1, trackRepository.count(), "Should not insert duplicate track");
    }
}
