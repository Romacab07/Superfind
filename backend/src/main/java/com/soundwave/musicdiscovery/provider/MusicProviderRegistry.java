package com.soundwave.musicdiscovery.provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dynamic registry and factory that automatically discovers and registers all
 * {@link MusicCatalogProvider} beans in the Spring ApplicationContext.
 */
@Component
public class MusicProviderRegistry {

    private static final Logger log = LoggerFactory.getLogger(MusicProviderRegistry.class);

    private final Map<String, MusicCatalogProvider> providers = new ConcurrentHashMap<>();

    public MusicProviderRegistry(List<MusicCatalogProvider> detectedProviders) {
        for (MusicCatalogProvider provider : detectedProviders) {
            String name = provider.getProviderName().toUpperCase();
            providers.put(name, provider);
            log.info("Registered Music Catalog Provider: [{}] (Available: {})", name, provider.isAvailable());
        }
    }

    public Optional<MusicCatalogProvider> getProvider(String providerName) {
        if (providerName == null) return Optional.empty();
        return Optional.ofNullable(providers.get(providerName.toUpperCase()));
    }

    public List<MusicCatalogProvider> getAllProviders() {
        return Collections.unmodifiableList(List.copyOf(providers.values()));
    }

    public List<MusicCatalogProvider> getAvailableProviders() {
        return providers.values().stream()
                .filter(MusicCatalogProvider::isAvailable)
                .toList();
    }
}
