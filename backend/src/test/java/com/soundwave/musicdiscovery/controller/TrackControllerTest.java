package com.soundwave.musicdiscovery.controller;

import com.soundwave.musicdiscovery.model.Track;
import com.soundwave.musicdiscovery.service.StatsService;
import com.soundwave.musicdiscovery.service.TrackService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class TrackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrackService trackService;

    @MockBean
    private StatsService statsService;

    @Test
    void shouldReturnTop24hTracks() throws Exception {
        Track sample = Track.builder()
                .id("t-1")
                .title("Neon Horizon")
                .artist("Aether")
                .playCount24h(500L)
                .build();

        when(trackService.getTopTracks24h(anyInt())).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/tracks/top-24h?limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Neon Horizon"))
                .andExpect(jsonPath("$.data[0].playCount24h").value(500));
    }

    @Test
    void shouldReturnRecentTracks() throws Exception {
        Track sample = Track.builder()
                .id("t-2")
                .title("Midnight Lofi")
                .artist("Chill Project")
                .build();

        when(trackService.getRecentTracks(anyInt())).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/tracks/recent?limit=12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Midnight Lofi"));
    }

    @Test
    void shouldRecordTrackPlay() throws Exception {
        mockMvc.perform(post("/api/tracks/t-1/play")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"clientSession\":\"sess-123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value("OK"));
    }
}
