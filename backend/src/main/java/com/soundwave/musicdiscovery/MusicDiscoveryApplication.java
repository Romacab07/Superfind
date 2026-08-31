package com.soundwave.musicdiscovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MusicDiscoveryApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicDiscoveryApplication.class, args);
    }
}
