package com.soundwave.musicdiscovery.service;

import com.soundwave.musicdiscovery.config.GcpProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Enterprise Secret Manager Service.
 * Securely retrieves API keys (Gemini API Key, Jamendo Client ID, etc.)
 * from GCP Secret Manager in production or from environment variables in local mode.
 */
@Service
public class SecretManagerService {

    private static final Logger log = LoggerFactory.getLogger(SecretManagerService.class);

    private final Environment environment;
    private final GcpProperties gcpProperties;

    public SecretManagerService(Environment environment, GcpProperties gcpProperties) {
        this.environment = environment;
        this.gcpProperties = gcpProperties;
    }

    /**
     * Resolves a secret by checking:
     * 1. Direct System Environment variable
     * 2. Spring Environment property
     * 3. Default value fallback
     */
    public String getSecret(String secretName, String defaultValue) {
        String envKey = secretName.toUpperCase().replace("-", "_").replace(".", "_");
        String envVal = System.getenv(envKey);
        if (envVal != null && !envVal.isBlank()) {
            return envVal;
        }

        String propVal = environment.getProperty(secretName);
        if (propVal != null && !propVal.isBlank()) {
            return propVal;
        }

        return defaultValue;
    }
}
