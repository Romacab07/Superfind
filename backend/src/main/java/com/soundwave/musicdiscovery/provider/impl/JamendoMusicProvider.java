package com.soundwave.musicdiscovery.provider.impl;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Official Jamendo API Provider.
 * Jamendo is the world's largest Creative Commons music community.
 */
@Component
public class JamendoMusicProvider implements MusicCatalogProvider {

    private static final Logger log = LoggerFactory.getLogger(JamendoMusicProvider.class);
    private static final String JAMENDO_BASE_URL = "https://api.jamendo.com/v3.0";

    private final String clientId;
    private final RestTemplate restTemplate;

    public JamendoMusicProvider(
            @Value("${music.providers.jamendo.client-id:}") String clientId,
            RestTemplateBuilder restTemplateBuilder) {
        this.clientId = clientId != null ? clientId.trim() : "";
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(8))
                .build();
    }

    @Override
    public String getProviderName() {
        return "JAMENDO";
    }

    @Override
    public boolean isAvailable() {
        return clientId != null && !clientId.isBlank() && !clientId.equals("YOUR_JAMENDO_CLIENT_ID");
    }

    @Override
    public List<ExternalTrackDto> fetchLatestTracks(int limit) {
        if (!isAvailable()) {
            log.debug("Jamendo provider is disabled or missing valid client_id.");
            return Collections.emptyList();
        }

        try {
            String url = String.format("%s/tracks/?client_id=%s&format=json&limit=%d&order=releasedate_desc&include=musicinfo",
                    JAMENDO_BASE_URL, clientId, Math.min(limit, 50));

            ResponseEntity<JamendoResponse> response = restTemplate.getForEntity(url, JamendoResponse.class);
            if (response.getBody() != null && response.getBody().getResults() != null) {
                return response.getBody().getResults().stream()
                        .map(this::mapToDto)
                        .toList();
            }
        } catch (Exception e) {
            log.error("Failed to fetch tracks from Jamendo API: {}", e.getMessage());
        }
        return Collections.emptyList();
    }

    @Override
    public Optional<ExternalTrackDto> fetchTrackById(String externalId) {
        if (!isAvailable()) return Optional.empty();

        try {
            String url = String.format("%s/tracks/?client_id=%s&format=json&id=%s",
                    JAMENDO_BASE_URL, clientId, externalId);

            ResponseEntity<JamendoResponse> response = restTemplate.getForEntity(url, JamendoResponse.class);
            if (response.getBody() != null && response.getBody().getResults() != null && !response.getBody().getResults().isEmpty()) {
                return Optional.of(mapToDto(response.getBody().getResults().get(0)));
            }
        } catch (Exception e) {
            log.error("Failed to fetch track [{}] from Jamendo: {}", externalId, e.getMessage());
        }
        return Optional.empty();
    }

    private ExternalTrackDto mapToDto(JamendoTrackItem item) {
        String genre = "Indie";
        if (item.getMusicInfo() != null && item.getMusicInfo().getTags() != null && item.getMusicInfo().getTags().getGenres() != null) {
            List<String> genres = item.getMusicInfo().getTags().getGenres();
            if (!genres.isEmpty()) {
                genre = capitalize(genres.get(0));
            }
        }

        return ExternalTrackDto.builder()
                .externalId(item.getId())
                .title(item.getName())
                .artist(item.getArtistName())
                .genre(genre)
                .audioUrl(item.getAudio())
                .coverUrl(item.getImage() != null ? item.getImage() : "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600")
                .durationSeconds(item.getDuration())
                .releaseDate(Instant.now())
                .license(item.getLicenseCcurl() != null ? "Creative Commons " + item.getLicenseCcurl() : "Creative Commons CC-BY")
                .licenseUrl(item.getLicenseCcurl())
                .providerName(getProviderName())
                .build();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JamendoResponse {
        private List<JamendoTrackItem> results = new ArrayList<>();

        public List<JamendoTrackItem> getResults() { return results; }
        public void setResults(List<JamendoTrackItem> results) { this.results = results; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JamendoTrackItem {
        private String id;
        private String name;
        private int duration;
        @JsonProperty("artist_name")
        private String artistName;
        private String audio;
        private String audiodownload;
        private String image;
        @JsonProperty("license_ccurl")
        private String licenseCcurl;
        @JsonProperty("musicinfo")
        private JamendoMusicInfo musicInfo;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getDuration() { return duration; }
        public void setDuration(int duration) { this.duration = duration; }
        public String getArtistName() { return artistName; }
        public void setArtistName(String artistName) { this.artistName = artistName; }
        public String getAudio() { return audio; }
        public void setAudio(String audio) { this.audio = audio; }
        public String getAudiodownload() { return audiodownload; }
        public void setAudiodownload(String audiodownload) { this.audiodownload = audiodownload; }
        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
        public String getLicenseCcurl() { return licenseCcurl; }
        public void setLicenseCcurl(String licenseCcurl) { this.licenseCcurl = licenseCcurl; }
        public JamendoMusicInfo getMusicInfo() { return musicInfo; }
        public void setMusicInfo(JamendoMusicInfo musicInfo) { this.musicInfo = musicInfo; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JamendoMusicInfo {
        private JamendoTags tags;

        public JamendoTags getTags() { return tags; }
        public void setTags(JamendoTags tags) { this.tags = tags; }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class JamendoTags {
        private List<String> genres = new ArrayList<>();

        public List<String> getGenres() { return genres; }
        public void setGenres(List<String> genres) { this.genres = genres; }
    }
}
