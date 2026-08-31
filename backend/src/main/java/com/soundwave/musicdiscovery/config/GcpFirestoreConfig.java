package com.soundwave.musicdiscovery.config;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GcpFirestoreConfig {

    private static final Logger log = LoggerFactory.getLogger(GcpFirestoreConfig.class);

    @Bean
    @ConditionalOnProperty(name = "gcp.firestore.enabled", havingValue = "true")
    @ConditionalOnMissingBean
    public Firestore firestore(GcpProperties properties) {
        log.info("Initializing Google Cloud Firestore Client for Project: [{}]", properties.getProjectId());
        return FirestoreOptions.getDefaultInstance().toBuilder()
                .setProjectId(properties.getProjectId())
                .build()
                .getService();
    }
}
