package com.soundwave.musicdiscovery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "gcp")
public class GcpProperties {
    private String projectId = "soundwave-music-discovery";
    private FirestoreConfig firestore = new FirestoreConfig();
    private SecretManagerConfig secretManager = new SecretManagerConfig();

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public FirestoreConfig getFirestore() { return firestore; }
    public void setFirestore(FirestoreConfig firestore) { this.firestore = firestore; }
    public SecretManagerConfig getSecretManager() { return secretManager; }
    public void setSecretManager(SecretManagerConfig secretManager) { this.secretManager = secretManager; }

    public static class FirestoreConfig {
        private boolean enabled = false;
        private CollectionsConfig collections = new CollectionsConfig();

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public CollectionsConfig getCollections() { return collections; }
        public void setCollections(CollectionsConfig collections) { this.collections = collections; }
    }

    public static class CollectionsConfig {
        private String tracks = "tracks";
        private String playEvents = "play_events";
        private String syncMetadata = "sync_metadata";

        public String getTracks() { return tracks; }
        public void setTracks(String tracks) { this.tracks = tracks; }
        public String getPlayEvents() { return playEvents; }
        public void setPlayEvents(String playEvents) { this.playEvents = playEvents; }
        public String getSyncMetadata() { return syncMetadata; }
        public void setSyncMetadata(String syncMetadata) { this.syncMetadata = syncMetadata; }
    }

    public static class SecretManagerConfig {
        private boolean enabled = false;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}
