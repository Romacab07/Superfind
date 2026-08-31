package com.soundwave.musicdiscovery.repository.inmemory;

import com.soundwave.musicdiscovery.model.SyncStatus;
import com.soundwave.musicdiscovery.repository.SyncStatusRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "false", matchIfMissing = true)
public class InMemorySyncStatusRepository implements SyncStatusRepository {

    private final Map<String, SyncStatus> storage = new ConcurrentHashMap<>();

    @Override
    public SyncStatus save(SyncStatus status) {
        if (status.getProviderName() != null) {
            storage.put(status.getProviderName().toUpperCase(), status);
        }
        return status;
    }

    @Override
    public Optional<SyncStatus> findByProviderName(String providerName) {
        if (providerName == null) return Optional.empty();
        return Optional.ofNullable(storage.get(providerName.toUpperCase()));
    }

    @Override
    public List<SyncStatus> findAll() {
        return new ArrayList<>(storage.values());
    }
}
