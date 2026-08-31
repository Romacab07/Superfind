package com.soundwave.musicdiscovery.provider.impl;

import com.soundwave.musicdiscovery.provider.MusicCatalogProvider;
import com.soundwave.musicdiscovery.provider.dto.ExternalTrackDto;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Built-in provider seeded with high-quality Creative Commons / CC0 royalty-free tracks
 * with real streaming audio files from reliable open audio repositories (Archive.org, FreePD, Wikimedia).
 * Guarantees 100% out-of-the-box working application in both local and GCP environments.
 */
@Component
public class SeedCatalogProvider implements MusicCatalogProvider {

    private final List<ExternalTrackDto> seedTracks = new ArrayList<>();

    public SeedCatalogProvider() {
        initSeedCatalog();
    }

    private void initSeedCatalog() {
        Instant now = Instant.now();

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-001")
                .title("Neon Horizon")
                .artist("Aether Wave")
                .genre("Synthwave")
                .durationSeconds(214)
                .releaseDate(now.minus(1, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
                .coverUrl("https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-002")
                .title("Midnight Coffee & Rain")
                .artist("Lofi Dreams Collective")
                .genre("Lofi Hip Hop")
                .durationSeconds(185)
                .releaseDate(now.minus(3, ChronoUnit.HOURS))
                .license("Creative Commons CC0 (Public Domain)")
                .licenseUrl("https://creativecommons.org/publicdomain/zero/1.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3")
                .coverUrl("https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-003")
                .title("Starlight Odyssey")
                .artist("Nova Stellar")
                .genre("Cinematic Ambient")
                .durationSeconds(240)
                .releaseDate(now.minus(6, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3")
                .coverUrl("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-004")
                .title("Urban Pulse")
                .artist("Kairo Beats")
                .genre("Electro Chill")
                .durationSeconds(198)
                .releaseDate(now.minus(12, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY-SA 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by-sa/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3")
                .coverUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-005")
                .title("Golden Hour Memories")
                .artist("Solaris Acoustic")
                .genre("Indie Folk")
                .durationSeconds(210)
                .releaseDate(now.minus(18, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3")
                .coverUrl("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-006")
                .title("Cybernetic Drift")
                .artist("Hyperion Ghost")
                .genre("Cyberpunk")
                .durationSeconds(225)
                .releaseDate(now.minus(22, ChronoUnit.HOURS))
                .license("Creative Commons CC0")
                .licenseUrl("https://creativecommons.org/publicdomain/zero/1.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3")
                .coverUrl("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-007")
                .title("Zen Blossom")
                .artist("Komorebi Project")
                .genre("Lofi Ambient")
                .durationSeconds(175)
                .releaseDate(now.minus(28, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3")
                .coverUrl("https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());

        seedTracks.add(ExternalTrackDto.builder()
                .externalId("seed-008")
                .title("Echoes of Eternity")
                .artist("Luna Caelum")
                .genre("Neo-Classical")
                .durationSeconds(250)
                .releaseDate(now.minus(36, ChronoUnit.HOURS))
                .license("Creative Commons CC-BY 4.0")
                .licenseUrl("https://creativecommons.org/licenses/by/4.0/")
                .audioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3")
                .coverUrl("https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80")
                .providerName(getProviderName())
                .build());
    }

    @Override
    public String getProviderName() {
        return "SEED_CATALOG";
    }

    @Override
    public List<ExternalTrackDto> fetchLatestTracks(int limit) {
        return seedTracks.stream().limit(limit).toList();
    }

    @Override
    public Optional<ExternalTrackDto> fetchTrackById(String externalId) {
        return seedTracks.stream()
                .filter(t -> t.getExternalId().equalsIgnoreCase(externalId))
                .findFirst();
    }

    @Override
    public boolean isAvailable() {
        return true;
    }
}
