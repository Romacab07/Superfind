package com.soundwave.musicdiscovery.repository;

import com.soundwave.musicdiscovery.model.PlayEvent;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface PlayEventRepository {
    PlayEvent save(PlayEvent event);
    List<PlayEvent> findEventsSince(Instant since);
    Map<String, Long> countPlaysByTrackSince(Instant since);
}
