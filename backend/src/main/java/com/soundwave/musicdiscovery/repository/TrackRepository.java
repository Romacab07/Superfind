package com.soundwave.musicdiscovery.repository;

import com.soundwave.musicdiscovery.model.Track;

import java.util.List;
import java.util.Optional;

public interface TrackRepository {
    Track save(Track track);
    List<Track> saveAll(List<Track> tracks);
    Optional<Track> findById(String id);
    Optional<Track> findByExternalIdAndProvider(String externalId, String provider);
    List<Track> findTopByPlayCount24h(int limit);
    List<Track> findRecentTracks(int limit);
    List<Track> findAll();
    long count();
    void incrementPlayCount(String trackId);
}
