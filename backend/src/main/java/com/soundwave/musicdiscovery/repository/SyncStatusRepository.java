package com.soundwave.musicdiscovery.repository;

import com.soundwave.musicdiscovery.model.SyncStatus;

import java.util.List;
import java.util.Optional;

public interface SyncStatusRepository {
    SyncStatus save(SyncStatus status);
    Optional<SyncStatus> findByProviderName(String providerName);
    List<SyncStatus> findAll();
}
