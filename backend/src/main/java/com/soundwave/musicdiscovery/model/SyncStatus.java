package com.soundwave.musicdiscovery.model;

import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;

public class SyncStatus {

    @DocumentId
    private String providerName;
    private Instant lastSyncAt;
    private String lastExternalId;
    private int newlyAddedTracks;
    private int totalTracksSynced;
    private String status;
    private String lastErrorMessage;

    public SyncStatus() {
    }

    public SyncStatus(String providerName, Instant lastSyncAt, String lastExternalId, int newlyAddedTracks,
                      int totalTracksSynced, String status, String lastErrorMessage) {
        this.providerName = providerName;
        this.lastSyncAt = lastSyncAt;
        this.lastExternalId = lastExternalId;
        this.newlyAddedTracks = newlyAddedTracks;
        this.totalTracksSynced = totalTracksSynced;
        this.status = status;
        this.lastErrorMessage = lastErrorMessage;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String providerName;
        private Instant lastSyncAt;
        private String lastExternalId;
        private int newlyAddedTracks;
        private int totalTracksSynced;
        private String status;
        private String lastErrorMessage;

        public Builder providerName(String providerName) { this.providerName = providerName; return this; }
        public Builder lastSyncAt(Instant lastSyncAt) { this.lastSyncAt = lastSyncAt; return this; }
        public Builder lastExternalId(String lastExternalId) { this.lastExternalId = lastExternalId; return this; }
        public Builder newlyAddedTracks(int newlyAddedTracks) { this.newlyAddedTracks = newlyAddedTracks; return this; }
        public Builder totalTracksSynced(int totalTracksSynced) { this.totalTracksSynced = totalTracksSynced; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder lastErrorMessage(String lastErrorMessage) { this.lastErrorMessage = lastErrorMessage; return this; }

        public SyncStatus build() {
            return new SyncStatus(providerName, lastSyncAt, lastExternalId, newlyAddedTracks, totalTracksSynced, status, lastErrorMessage);
        }
    }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public Instant getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(Instant lastSyncAt) { this.lastSyncAt = lastSyncAt; }
    public String getLastExternalId() { return lastExternalId; }
    public void setLastExternalId(String lastExternalId) { this.lastExternalId = lastExternalId; }
    public int getNewlyAddedTracks() { return newlyAddedTracks; }
    public void setNewlyAddedTracks(int newlyAddedTracks) { this.newlyAddedTracks = newlyAddedTracks; }
    public int getTotalTracksSynced() { return totalTracksSynced; }
    public void setTotalTracksSynced(int totalTracksSynced) { this.totalTracksSynced = totalTracksSynced; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getLastErrorMessage() { return lastErrorMessage; }
    public void setLastErrorMessage(String lastErrorMessage) { this.lastErrorMessage = lastErrorMessage; }
}
