package com.soundwave.musicdiscovery.model;

import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;

public class PlayEvent {

    @DocumentId
    private String id;
    private String trackId;
    private Instant timestamp;
    private String clientSession;
    private String userAgent;

    public PlayEvent() {
    }

    public PlayEvent(String id, String trackId, Instant timestamp, String clientSession, String userAgent) {
        this.id = id;
        this.trackId = trackId;
        this.timestamp = timestamp;
        this.clientSession = clientSession;
        this.userAgent = userAgent;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String trackId;
        private Instant timestamp;
        private String clientSession;
        private String userAgent;

        public Builder id(String id) { this.id = id; return this; }
        public Builder trackId(String trackId) { this.trackId = trackId; return this; }
        public Builder timestamp(Instant timestamp) { this.timestamp = timestamp; return this; }
        public Builder clientSession(String clientSession) { this.clientSession = clientSession; return this; }
        public Builder userAgent(String userAgent) { this.userAgent = userAgent; return this; }

        public PlayEvent build() {
            return new PlayEvent(id, trackId, timestamp, clientSession, userAgent);
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getClientSession() { return clientSession; }
    public void setClientSession(String clientSession) { this.clientSession = clientSession; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
