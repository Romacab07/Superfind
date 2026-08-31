package com.soundwave.musicdiscovery.repository.firestore;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.soundwave.musicdiscovery.model.PlayEvent;
import com.soundwave.musicdiscovery.repository.PlayEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "true")
public class FirestorePlayEventRepository implements PlayEventRepository {

    private static final Logger log = LoggerFactory.getLogger(FirestorePlayEventRepository.class);
    private final Firestore firestore;
    private final String collectionName;

    public FirestorePlayEventRepository(
            Firestore firestore,
            @Value("${gcp.firestore.collections.play-events:play_events}") String collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }

    private CollectionReference getCollection() {
        return firestore.collection(collectionName);
    }

    @Override
    public PlayEvent save(PlayEvent event) {
        try {
            if (event.getId() == null || event.getId().isBlank()) {
                event.setId(UUID.randomUUID().toString());
            }
            if (event.getTimestamp() == null) {
                event.setTimestamp(Instant.now());
            }
            getCollection().document(event.getId()).set(event).get();
            return event;
        } catch (Exception e) {
            log.error("Error saving play event to Firestore: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save play event", e);
        }
    }

    @Override
    public List<PlayEvent> findEventsSince(Instant since) {
        try {
            QuerySnapshot querySnapshot = getCollection()
                    .whereGreaterThan("timestamp", since.toString())
                    .get()
                    .get();

            return querySnapshot.toObjects(PlayEvent.class);
        } catch (Exception e) {
            log.error("Error finding play events since [{}] in Firestore: {}", since, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, Long> countPlaysByTrackSince(Instant since) {
        List<PlayEvent> events = findEventsSince(since);
        return events.stream()
                .filter(e -> e.getTrackId() != null)
                .collect(Collectors.groupingBy(PlayEvent::getTrackId, Collectors.counting()));
    }
}
