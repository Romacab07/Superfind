package com.soundwave.musicdiscovery.provider.dto;

import java.time.Instant;

public class ExternalTrackDto {
    private String externalId;
    private String title;
    private String artist;
    private String genre;
    private String audioUrl;
    private String coverUrl;
    private int durationSeconds;
    private Instant releaseDate;
    private String license;
    private String licenseUrl;
    private String providerName;

    public ExternalTrackDto() {
    }

    public ExternalTrackDto(String externalId, String title, String artist, String genre, String audioUrl,
                            String coverUrl, int durationSeconds, Instant releaseDate, String license,
                            String licenseUrl, String providerName) {
        this.externalId = externalId;
        this.title = title;
        this.artist = artist;
        this.genre = genre;
        this.audioUrl = audioUrl;
        this.coverUrl = coverUrl;
        this.durationSeconds = durationSeconds;
        this.releaseDate = releaseDate;
        this.license = license;
        this.licenseUrl = licenseUrl;
        this.providerName = providerName;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String externalId;
        private String title;
        private String artist;
        private String genre;
        private String audioUrl;
        private String coverUrl;
        private int durationSeconds;
        private Instant releaseDate;
        private String license;
        private String licenseUrl;
        private String providerName;

        public Builder externalId(String externalId) { this.externalId = externalId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder artist(String artist) { this.artist = artist; return this; }
        public Builder genre(String genre) { this.genre = genre; return this; }
        public Builder audioUrl(String audioUrl) { this.audioUrl = audioUrl; return this; }
        public Builder coverUrl(String coverUrl) { this.coverUrl = coverUrl; return this; }
        public Builder durationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; return this; }
        public Builder releaseDate(Instant releaseDate) { this.releaseDate = releaseDate; return this; }
        public Builder license(String license) { this.license = license; return this; }
        public Builder licenseUrl(String licenseUrl) { this.licenseUrl = licenseUrl; return this; }
        public Builder providerName(String providerName) { this.providerName = providerName; return this; }

        public ExternalTrackDto build() {
            return new ExternalTrackDto(externalId, title, artist, genre, audioUrl, coverUrl, durationSeconds, releaseDate, license, licenseUrl, providerName);
        }
    }

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
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
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
}
