package com.soundwave.musicdiscovery.service;

import com.soundwave.musicdiscovery.dto.PlayRequestDto;
import com.soundwave.musicdiscovery.model.PlayEvent;
import com.soundwave.musicdiscovery.repository.PlayEventRepository;
import com.soundwave.musicdiscovery.repository.TrackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
public class StatsService {

    private static final Logger log = LoggerFactory.getLogger(StatsService.class);

    private final PlayEventRepository playEventRepository;
    private final TrackRepository trackRepository;

    public StatsService(PlayEventRepository playEventRepository, TrackRepository trackRepository) {
        this.playEventRepository = playEventRepository;
        this.trackRepository = trackRepository;
    }

    /**
     * Records a play interaction for a track, saving the audit event
     * and incrementing the 24-hour and total play count.
     */
    public void recordTrackPlay(String trackId, PlayRequestDto requestDto) {
        if (trackId == null || trackId.isBlank()) return;

        PlayEvent event = PlayEvent.builder()
                .id(UUID.randomUUID().toString())
                .trackId(trackId)
                .timestamp(Instant.now())
                .clientSession(requestDto != null ? requestDto.getClientSession() : null)
                .userAgent(requestDto != null ? requestDto.getUserAgent() : null)
                .build();

        playEventRepository.save(event);
        trackRepository.incrementPlayCount(trackId);
        log.info("Play recorded for trackId [{}] at [{}]", trackId, event.getTimestamp());
    }

    /**
     * Recalculates rolling 24-hour play counts from raw play events.
     */
    public Map<String, Long> get24hPlayCounts() {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        return playEventRepository.countPlaysByTrackSince(since);
    }
}
