package com.soundwave.musicdiscovery.repository.inmemory;

import com.soundwave.musicdiscovery.model.PlayEvent;
import com.soundwave.musicdiscovery.repository.PlayEventRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryPlayEventRepository implements PlayEventRepository {

    private final List<PlayEvent> storage = Collections.synchronizedList(new ArrayList<>());

    @Override
    public PlayEvent save(PlayEvent event) {
        if (event.getId() == null || event.getId().isBlank()) {
            event.setId(UUID.randomUUID().toString());
        }
        if (event.getTimestamp() == null) {
            event.setTimestamp(Instant.now());
        }
        storage.add(event);
        return event;
    }

    @Override
    public List<PlayEvent> findEventsSince(Instant since) {
        return storage.stream()
                .filter(e -> e.getTimestamp() != null && e.getTimestamp().isAfter(since))
                .toList();
    }

    @Override
    public Map<String, Long> countPlaysByTrackSince(Instant since) {
        return storage.stream()
                .filter(e -> e.getTimestamp() != null && e.getTimestamp().isAfter(since))
                .filter(e -> e.getTrackId() != null)
                .collect(Collectors.groupingBy(PlayEvent::getTrackId, Collectors.counting()));
    }
}
