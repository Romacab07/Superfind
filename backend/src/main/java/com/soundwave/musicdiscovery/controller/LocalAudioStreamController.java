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
 * directly from the mounted local pendrive / folder for seamless timeline scrubbing in the browser.
 *
 * Spring's ResourceHttpMessageConverter automatically handles Range requests for Resource returns.
 *
 * Active only in local environments (@Profile("!gcp")).
 */
@RestController
@Profile("!gcp")
@RequestMapping("/api/tracks")
public class LocalAudioStreamController {

    private static final Logger log = LoggerFactory.getLogger(LocalAudioStreamController.class);

    @Value("${soundwave.local-music.path:/app/local-music}")
    private String localMusicPath;

    private static final String HOST_FALLBACK_PATH = "E:/Pendrive 2022/Musica/Cachengue y trapo/Trvup tranca";

    private File resolveMusicDirectory() {
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

    @GetMapping("/stream-local")
    public ResponseEntity<Resource> streamAudio(
            @RequestParam("file") String rawFileName) throws IOException {

        String fileName = URLDecoder.decode(rawFileName, StandardCharsets.UTF_8);

        // Security check: prevent directory traversal
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        File musicDir = resolveMusicDirectory();
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
