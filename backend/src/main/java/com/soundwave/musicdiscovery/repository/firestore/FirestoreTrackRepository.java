package com.soundwave.musicdiscovery.repository.firestore;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.repository.TrackRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "true")
public class FirestoreTrackRepository implements TrackRepository {

    private static final Logger log = LoggerFactory.getLogger(FirestoreTrackRepository.class);
    private final Firestore firestore;
    private final String collectionName;

    public FirestoreTrackRepository(
            Firestore firestore,
            @Value("${gcp.firestore.collections.tracks:tracks}") String collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }

    private CollectionReference getCollection() {
        return firestore.collection(collectionName);
    }

    @Override
    public Track save(Track track) {
        try {
            if (track.getId() == null || track.getId().isBlank()) {
                track.setId(UUID.randomUUID().toString());
            }
            if (track.getCreatedAt() == null) {
                track.setCreatedAt(Instant.now());
            }
            track.setUpdatedAt(Instant.now());

            DocumentReference docRef = getCollection().document(track.getId());
            docRef.set(track).get();
            return track;
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error saving track to Firestore: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save track to Firestore", e);
        }
    }

    @Override
    public List<Track> saveAll(List<Track> tracks) {
        return tracks.stream().map(this::save).toList();
    }

    @Override
    public Optional<Track> findById(String id) {
        try {
            DocumentSnapshot snapshot = getCollection().document(id).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(snapshot.toObject(Track.class));
            }
        } catch (Exception e) {
            log.error("Error reading track [{}] from Firestore: {}", id, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public Optional<Track> findByExternalIdAndProvider(String externalId, String provider) {
        try {
            QuerySnapshot querySnapshot = getCollection()
                    .whereEqualTo("externalId", externalId)
                    .whereEqualTo("provider", provider)
                    .limit(1)
                    .get()
                    .get();

            if (!querySnapshot.isEmpty()) {
                return Optional.ofNullable(querySnapshot.getDocuments().get(0).toObject(Track.class));
            }
        } catch (Exception e) {
            log.error("Error searching track externalId [{}] provider [{}] in Firestore: {}", externalId, provider, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<Track> findTopByPlayCount24h(int limit) {
        try {
            QuerySnapshot querySnapshot = getCollection()
                    .orderBy("playCount24h", Query.Direction.DESCENDING)
                    .limit(limit)
                    .get()
                    .get();

            return querySnapshot.toObjects(Track.class);
        } catch (Exception e) {
            log.error("Error querying top tracks from Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Track> findRecentTracks(int limit) {
        try {
            QuerySnapshot querySnapshot = getCollection()
                    .orderBy("releaseDate", Query.Direction.DESCENDING)
                    .limit(limit)
                    .get()
                    .get();

            return querySnapshot.toObjects(Track.class);
        } catch (Exception e) {
            log.error("Error querying recent tracks from Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Track> findAll() {
        try {
            return getCollection().get().get().toObjects(Track.class);
        } catch (Exception e) {
            log.error("Error fetching all tracks from Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public long count() {
        try {
            AggregateQuerySnapshot snapshot = getCollection().count().get().get();
            return snapshot.getCount();
        } catch (Exception e) {
            log.error("Error counting tracks in Firestore: {}", e.getMessage());
            return 0;
        }
    }

    @Override
    public void incrementPlayCount(String trackId) {
        try {
            DocumentReference docRef = getCollection().document(trackId);
            firestore.runTransaction(transaction -> {
                DocumentSnapshot snapshot = transaction.get(docRef).get();
                if (snapshot.exists()) {
                    long current24h = snapshot.getLong("playCount24h") != null ? snapshot.getLong("playCount24h") : 0L;
                    long total = snapshot.getLong("totalPlays") != null ? snapshot.getLong("totalPlays") : 0L;
                    transaction.update(docRef, "playCount24h", current24h + 1);
                    transaction.update(docRef, "totalPlays", total + 1);
                    transaction.update(docRef, "lastPlayedAt", Instant.now().toString());
                    transaction.update(docRef, "updatedAt", Instant.now().toString());
                }
                return null;
            }).get();
        } catch (Exception e) {
            log.error("Error incrementing play count for track [{}] in Firestore: {}", trackId, e.getMessage());
        }
    }
}
