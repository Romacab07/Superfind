package com.soundwave.musicdiscovery.provider.impl;

import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Extensibility Template: Example provider demonstrating how easily third-party partners
 * or new open APIs (such as Free Music Archive, Audius, Freesound) can be connected
 * by implementing {@link MusicCatalogProvider} without altering existing codebase.
 */
@Component
public class GenericOpenMusicProvider implements MusicCatalogProvider {

    @Value("${music.providers.generic-open.enabled:false}")
    private boolean enabled;

    @Override
    public String getProviderName() {
        return "GENERIC_OPEN_API";
    }

    @Override
    public List<ExternalTrackDto> fetchLatestTracks(int limit) {
        if (!isAvailable()) {
            return Collections.emptyList();
        }
        // Template for HTTP call to new external partner endpoint
        return Collections.emptyList();
    }

    @Override
    public Optional<ExternalTrackDto> fetchTrackById(String externalId) {
        if (!isAvailable()) {
            return Optional.empty();
        }
        return Optional.empty();
    }

    @Override
    public boolean isAvailable() {
        return enabled;
    }
}
