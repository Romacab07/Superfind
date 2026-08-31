package com.soundwave.musicdiscovery.provider;

import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;

import java.util.List;
import java.util.Optional;

/**
 * Strategy interface for external copyright-free / Creative Commons music providers.
 * Any new music source (Jamendo, FMA, Audius, Freesound, etc.) can be integrated
 * by simply implementing this interface without modifying existing business logic (Open/Closed Principle).
 */
public interface MusicCatalogProvider {

    /**
     * Unique identifier of the provider (e.g. JAMENDO, SEED_CATALOG, FMA).
     */
    String getProviderName();

    /**
     * Fetches the latest published tracks from the external catalog.
     * @param limit maximum number of tracks to fetch
     * @return list of normalized external tracks
     */
    List<ExternalTrackDto> fetchLatestTracks(int limit);

    /**
     * Fetches a specific track by its external provider ID.
     */
    Optional<ExternalTrackDto> fetchTrackById(String externalId);

    /**
     * Checks if this provider is properly configured and available.
     */
    boolean isAvailable();
}
