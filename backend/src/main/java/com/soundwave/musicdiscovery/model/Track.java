package com.soundwave.musicdiscovery.model;

import com.google.cloud.firestore.annotation.DocumentId;

import java.time.Instant;

public class Track {

    @DocumentId
    private String id;
    private String title;
    private String artist;
    private String genre;
    private String audioUrl;
    private String coverUrl;
    private int durationSeconds;
    private Instant releaseDate;
    private String license;
    private String licenseUrl;
    private String provider; // e.g. JAMENDO, SEED_CATALOG, FMA
    private String externalId;
    private long playCount24h = 0L;
    private long totalPlays = 0L;
    private Instant lastPlayedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public Track() {
    }

    public Track(String id, String title, String artist, String genre, String audioUrl, String coverUrl,
                 int durationSeconds, Instant releaseDate, String license, String licenseUrl, String provider,
                 String externalId, long playCount24h, long totalPlays, Instant lastPlayedAt,
                 Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.audioUrl = audioUrl;
        this.coverUrl = coverUrl;
        this.durationSeconds = durationSeconds;
        this.releaseDate = releaseDate;
        this.license = license;
        this.licenseUrl = licenseUrl;
        this.provider = provider;
        this.externalId = externalId;
        this.playCount24h = playCount24h;
        this.totalPlays = totalPlays;
        this.lastPlayedAt = lastPlayedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String title;
        private String artist;
        private String genre;
        private String audioUrl;
        private String coverUrl;
        private int durationSeconds;
        private Instant releaseDate;
        private String license;
        private String licenseUrl;
        private String provider;
        private String externalId;
        private long playCount24h = 0L;
        private long totalPlays = 0L;
        private Instant lastPlayedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder artist(String artist) { this.artist = artist; return this; }
        public Builder genre(String genre) { this.genre = genre; return this; }
        public Builder audioUrl(String audioUrl) { this.audioUrl = audioUrl; return this; }
        public Builder coverUrl(String coverUrl) { this.coverUrl = coverUrl; return this; }
        public Builder durationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; return this; }
        public Builder releaseDate(Instant releaseDate) { this.releaseDate = releaseDate; return this; }
        public Builder license(String license) { this.license = license; return this; }
        public Builder licenseUrl(String licenseUrl) { this.licenseUrl = licenseUrl; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }
        public Builder externalId(String externalId) { this.externalId = externalId; return this; }
        public Builder playCount24h(long playCount24h) { this.playCount24h = playCount24h; return this; }
        public Builder totalPlays(long totalPlays) { this.totalPlays = totalPlays; return this; }
        public Builder lastPlayedAt(Instant lastPlayedAt) { this.lastPlayedAt = lastPlayedAt; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Track build() {
            return new Track(id, title, artist, genre, audioUrl, coverUrl, durationSeconds, releaseDate,
                    license, licenseUrl, provider, externalId, playCount24h, totalPlays, lastPlayedAt, createdAt, updatedAt);
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }
    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }
    public Instant getReleaseDate() { return releaseDate; }
    public void setReleaseDate(Instant releaseDate) { this.releaseDate = releaseDate; }
    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }
    public String getLicenseUrl() { return licenseUrl; }
    public void setLicenseUrl(String licenseUrl) { this.licenseUrl = licenseUrl; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
    public long getPlayCount24h() { return playCount24h; }
    public void setPlayCount24h(long playCount24h) { this.playCount24h = playCount24h; }
    public long getTotalPlays() { return totalPlays; }
    public void setTotalPlays(long totalPlays) { this.totalPlays = totalPlays; }
    public Instant getLastPlayedAt() { return lastPlayedAt; }
    public void setLastPlayedAt(Instant lastPlayedAt) { this.lastPlayedAt = lastPlayedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
