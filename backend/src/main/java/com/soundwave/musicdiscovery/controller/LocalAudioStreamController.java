package com.soundwave.musicdiscovery.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * LocalAudioStreamController — Streams audio files with HTTP Byte-Range support (206 Partial Content)
 * directly from a user-provided local music folder for seamless timeline scrubbing in the browser.
 *
 * Spring's ResourceHttpMessageConverter automatically handles Range requests for Resource returns.
 *
 * Active only in local environments (@Profile("!gcp")).
 * Requires the {@code LOCAL_MUSIC_PATH} environment variable; without it the endpoint stays disabled
 * so the app runs out of the box with no local audio folder attached.
 */
@RestController
@Profile("!gcp")
@RequestMapping("/api/tracks")
public class LocalAudioStreamController {

    private static final Logger log = LoggerFactory.getLogger(LocalAudioStreamController.class);

    @Value("${soundwave.local-music.path:}")
    private String localMusicPath;

    /**
     * @return the configured music folder, or {@code null} when local streaming is not configured.
     */
    private File resolveMusicDirectory() {
        if (localMusicPath == null || localMusicPath.isBlank()) {
            return null;
        }
        return new File(localMusicPath.trim());
    }

    @GetMapping("/stream-local")
    public ResponseEntity<Resource> streamAudio(
            @RequestParam("file") String rawFileName) throws IOException {

        String fileName = URLDecoder.decode(rawFileName, StandardCharsets.UTF_8);

        // Security check: prevent directory traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        File musicDir = resolveMusicDirectory();
        if (musicDir == null || !musicDir.isDirectory()) {
            log.warn("Local audio streaming is disabled: set LOCAL_MUSIC_PATH to a readable folder");
            return ResponseEntity.notFound().build();
        }

        File audioFile = new File(musicDir, fileName);

        if (!audioFile.exists() || !audioFile.isFile()) {
            log.warn("Local audio file not found: {}", audioFile.getAbsolutePath());
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(audioFile);

        MediaType mediaType = MediaType.parseMediaType("audio/mpeg");
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".wav")) {
            mediaType = MediaType.parseMediaType("audio/wav");
        } else if (lower.endsWith(".ogg")) {
            mediaType = MediaType.parseMediaType("audio/ogg");
        } else if (lower.endsWith(".m4a")) {
            mediaType = MediaType.parseMediaType("audio/mp4");
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                .body(resource);
    }
}
