package com.soundwave.musicdiscovery.repository.inmemory;

import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.repository.TrackRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryTrackRepository implements TrackRepository {

    private final Map<String, Track> storage = new ConcurrentHashMap<>();

    @Override
    public Track save(Track track) {
        if (track.getId() == null || track.getId().isBlank()) {
            track.setId(UUID.randomUUID().toString());
        }
        if (track.getCreatedAt() == null) {
            track.setCreatedAt(Instant.now());
        }
        track.setUpdatedAt(Instant.now());
        storage.put(track.getId(), track);
        return track;
    }

    @Override
    public List<Track> saveAll(List<Track> tracks) {
        return tracks.stream().map(this::save).toList();
    }

    @Override
    public Optional<Track> findById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public Optional<Track> findByExternalIdAndProvider(String externalId, String provider) {
        return storage.values().stream()
                .filter(t -> t.getExternalId() != null && t.getExternalId().equalsIgnoreCase(externalId))
                .filter(t -> t.getProvider() != null && t.getProvider().equalsIgnoreCase(provider))
                .findFirst();
    }

    @Override
    public List<Track> findTopByPlayCount24h(int limit) {
        return storage.values().stream()
                .sorted(Comparator.comparingLong(Track::getPlayCount24h).reversed()
                        .thenComparing(Track::getTotalPlays).reversed())
                .limit(limit)
                .toList();
    }

    @Override
    public List<Track> findRecentTracks(int limit) {
        return storage.values().stream()
                .sorted(Comparator.comparing(Track::getReleaseDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Track::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .toList();
    }

    @Override
    public List<Track> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public long count() {
        return storage.size();
    }

    @Override
    public void incrementPlayCount(String trackId) {
        Track track = storage.get(trackId);
        if (track != null) {
            track.setPlayCount24h(track.getPlayCount24h() + 1);
            track.setTotalPlays(track.getTotalPlays() + 1);
            track.setLastPlayedAt(Instant.now());
            track.setUpdatedAt(Instant.now());
        }
    }
}
