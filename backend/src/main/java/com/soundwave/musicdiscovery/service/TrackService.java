package com.soundwave.musicdiscovery.service;

import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.repository.TrackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrackService {

    private static final Logger log = LoggerFactory.getLogger(TrackService.class);
    private final TrackRepository trackRepository;

    public TrackService(TrackRepository trackRepository) {
        this.trackRepository = trackRepository;
    }

    /**
     * Bloque A: Top tracks in the last 24 hours
     */
    public List<Track> getTopTracks24h(int limit) {
        int safeLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        return trackRepository.findTopByPlayCount24h(safeLimit);
    }

    /**
     * Bloque B: Latest catalog releases (Novedades)
     */
    public List<Track> getRecentTracks(int limit) {
        int safeLimit = limit <= 0 ? 12 : Math.min(limit, 50);
        return trackRepository.findRecentTracks(safeLimit);
    }

    public Optional<Track> getTrackById(String id) {
        return trackRepository.findById(id);
    }

    public List<Track> getAllTracks() {
        return trackRepository.findAll();
    }

    public long getTotalTracksCount() {
        return trackRepository.count();
    }
}
