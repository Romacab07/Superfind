package com.soundwave.musicdiscovery.provider.impl;

import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * LocalDiskMusicProvider — Integrates external USB drive / local audio folders
 * seamlessly into SoundWave's discovery universe as an external MusicCatalogProvider.
 *
 * Guarantees zero footprint in production:
 * - Active only in local/non-GCP profiles (@Profile("!gcp")).
 * - Read-only access to host audio files.
 */
@Component
@Profile("!gcp")
public class LocalDiskMusicProvider implements MusicCatalogProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalDiskMusicProvider.class);

    @Value("${soundwave.local-music.path:/app/local-music}")
    private String localMusicPath;

    private static final String HOST_FALLBACK_PATH = "E:/Pendrive 2022/Musica/Cachengue y trapo/Trvup tranca";

    private static final List<String> AESTHETIC_COVERS = List.of(
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
    );

    public File resolveMusicDirectory() {
        if (localMusicPath != null && !localMusicPath.isBlank()) {
            File dir = new File(localMusicPath);
            if (dir.exists() && dir.isDirectory()) {
                return dir;
            }
        }
        File fallback = new File(HOST_FALLBACK_PATH);
        if (fallback.exists() && fallback.isDirectory()) {
            return fallback;
        }
        return new File(localMusicPath != null ? localMusicPath : "/app/local-music");
    }

    @Override
    public String getProviderName() {
        return "LOCAL_PENDRIVE";
    }

    @Override
    public List<ExternalTrackDto> fetchLatestTracks(int limit) {
        File musicDir = resolveMusicDirectory();
        if (!musicDir.exists() || !musicDir.isDirectory()) {
            log.warn("Local pendrive music directory not accessible: {}", musicDir.getAbsolutePath());
            return Collections.emptyList();
        }

        File[] files = musicDir.listFiles((dir, name) -> {
            String lower = name.toLowerCase();
            return lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".m4a") || lower.endsWith(".ogg");
        });

        if (files == null || files.length == 0) {
            log.info("No audio files found in: {}", musicDir.getAbsolutePath());
            return Collections.emptyList();
        }

        Arrays.sort(files, Comparator.comparing(File::getName));

        List<ExternalTrackDto> tracks = new ArrayList<>();
        Instant now = Instant.now();
        int maxTracks = Math.min(limit, files.length);

        for (int i = 0; i < maxTracks; i++) {
            File file = files[i];
            String rawName = file.getName();
            ParsedTrack parsed = parseFilename(rawName);

            String encodedFile = URLEncoder.encode(rawName, StandardCharsets.UTF_8).replace("+", "%20");
            String audioUrl = "/api/tracks/stream-local?file=" + encodedFile;
            String coverUrl = AESTHETIC_COVERS.get(Math.abs(rawName.hashCode()) % AESTHETIC_COVERS.size());

            // Estimated duration based on file length (~128kbps = 16KB/s)
            int durationSeconds = (int) Math.max(90, Math.min(420, file.length() / 16000));

            ExternalTrackDto dto = ExternalTrackDto.builder()
                    .externalId("pendrive-" + Math.abs(rawName.hashCode()))
                    .title(parsed.title)
                    .artist(parsed.artist)
                    .genre("Trap / Urbano")
                    .audioUrl(audioUrl)
                    .coverUrl(coverUrl)
                    .durationSeconds(durationSeconds)
                    .releaseDate(now.minus(i * 5L, ChronoUnit.MINUTES))
                    .license("Uso Personal / Pendrive")
                    .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                    .providerName(getProviderName())
                    .build();

            tracks.add(dto);
        }

        log.info("Successfully fetched {} tracks from local pendrive [{}]", tracks.size(), musicDir.getAbsolutePath());
        return tracks;
    }

    @Override
    public Optional<ExternalTrackDto> fetchTrackById(String externalId) {
        return fetchLatestTracks(100).stream()
                .filter(t -> t.getExternalId().equals(externalId))
                .findFirst();
    }

    @Override
    public boolean isAvailable() {
        File dir = resolveMusicDirectory();
        return dir.exists() && dir.isDirectory();
    }

    public static class ParsedTrack {
        public final String artist;
        public final String title;
        public ParsedTrack(String artist, String title) {
            this.artist = artist;
            this.title = title;
        }
    }

    public static ParsedTrack parseFilename(String fileName) {
        String name = fileName.replaceAll("\\.(mp3|wav|ogg|m4a|flac)$", "").trim();
        name = name.replaceAll("^(?i)y2mate\\.com\\s*-\\s*", "");
        name = name.replaceAll("^\\d{1,3}\\s*[-_.]\\s*", "");

        name = name.replaceAll("(?i)\\s*\\(official(\\s+music)?\\s+video\\)", "");
        name = name.replaceAll("(?i)\\s*\\[video\\s+oficial\\]", "");
        name = name.replaceAll("(?i)\\s*\\(video\\s+oficial\\)", "");
        name = name.replaceAll("(?i)\\s*\\[official\\s+video\\]", "");
        name = name.replaceAll("(?i)\\s*\\[audio\\s+oficial\\]", "");
        name = name.replaceAll("(?i)\\s*\\(audio\\s+oficial\\)", "");
        name = name.replaceAll("(?i)\\s*\\(audio\\)", "");
        name = name.replaceAll("(?i)\\s*\\(letra(\\s*lyrics)?\\)", "");
        name = name.replaceAll("(?i)\\s*\\[lyrics\\s*video\\]", "");
        name = name.replaceAll("(?i)\\s*\\[lyrics\\]", "");
        name = name.replaceAll("(?i)\\s*\\(lyrics\\s*_?\\s*letra\\)", "");
        name = name.replaceAll("(?i)\\s*\\(dir\\.?\\s+por\\s+@[^)]+\\)", "");
        name = name.replaceAll("(?i)\\s*\\(shot\\s+by\\s+[^)]+\\)", "");
        name = name.replaceAll("(?i)\\s*_\\s*A\\s+COLORS\\s+SHOW", "");
        name = name.replaceAll("(?i)\\s*_[a-zA-Z0-9]{8,15}_(320|128)kbps(\\s*\\(\\d+\\))?", "");

        String artist = "Artista Urbano";
        String title = name;

        if (name.contains(" - ")) {
            String[] parts = name.split(" - ", 2);
            artist = parts[0].trim();
            title = parts[1].trim();
        } else if (name.contains(" _ ")) {
            String[] parts = name.split(" _ ", 2);
            artist = parts[0].trim();
            title = parts[1].trim();
        } else if (name.toUpperCase().contains("BZRP")) {
            int bzrpIdx = name.toUpperCase().indexOf("BZRP");
            artist = name.substring(0, bzrpIdx).trim();
            title = name.substring(bzrpIdx).trim();
            if (artist.isEmpty()) artist = "Bizarrap";
        }

        title = title.replaceAll("\\s{2,}", " ").trim();
        artist = artist.replaceAll("\\s{2,}", " ").trim();

        if (artist.isEmpty()) artist = "Artista Urbano";
        if (title.isEmpty()) title = "Pista Pendrive";

        return new ParsedTrack(artist, title);
    }
}
