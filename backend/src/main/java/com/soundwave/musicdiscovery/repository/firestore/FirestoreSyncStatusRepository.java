package com.soundwave.musicdiscovery.repository.firestore;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.soundwave.musicdiscovery.model.SyncStatus;
import com.soundwave.musicdiscovery.repository.SyncStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "true")
public class FirestoreSyncStatusRepository implements SyncStatusRepository {

    private static final Logger log = LoggerFactory.getLogger(FirestoreSyncStatusRepository.class);
    private final Firestore firestore;
    private final String collectionName;

    public FirestoreSyncStatusRepository(
            Firestore firestore,
            @Value("${gcp.firestore.collections.sync-metadata:sync_metadata}") String collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
    }

    private CollectionReference getCollection() {
        return firestore.collection(collectionName);
    }

    @Override
    public SyncStatus save(SyncStatus status) {
        try {
            String docId = status.getProviderName() != null ? status.getProviderName().toUpperCase() : "DEFAULT";
            getCollection().document(docId).set(status).get();
            return status;
        } catch (Exception e) {
            log.error("Error saving sync status to Firestore: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save sync status", e);
        }
    }

    @Override
    public Optional<SyncStatus> findByProviderName(String providerName) {
        try {
            String docId = providerName.toUpperCase();
            DocumentSnapshot snapshot = getCollection().document(docId).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(snapshot.toObject(SyncStatus.class));
            }
        } catch (Exception e) {
            log.error("Error finding sync status for provider [{}] in Firestore: {}", providerName, e.getMessage());
        }
        return Optional.empty();
    }

    @Override
    public List<SyncStatus> findAll() {
        try {
            return getCollection().get().get().toObjects(SyncStatus.class);
        } catch (Exception e) {
            log.error("Error fetching all sync statuses from Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
