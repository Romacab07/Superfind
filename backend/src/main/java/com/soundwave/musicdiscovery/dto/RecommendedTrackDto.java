package com.soundwave.musicdiscovery.dto;

import com.soundwave.musicdiscovery.model.PlayTier;
import com.soundwave.musicdiscovery.model.Track;

public class RecommendedTrackDto {
    private Track track;
    private String reasoning;
    private PlayTier tier;
    private String vibeSummary;
    private double confidenceScore;

    public RecommendedTrackDto() {
    }

    public RecommendedTrackDto(Track track, String reasoning, PlayTier tier, String vibeSummary, double confidenceScore) {
        this.track = track;
        this.reasoning = reasoning;
        this.tier = tier;
        this.vibeSummary = vibeSummary;
        this.confidenceScore = confidenceScore;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Track track;
        private String reasoning;
        private PlayTier tier;
        private String vibeSummary;
        private double confidenceScore;

        public Builder track(Track track) { this.track = track; return this; }
        public Builder reasoning(String reasoning) { this.reasoning = reasoning; return this; }
        public Builder tier(PlayTier tier) { this.tier = tier; return this; }
        public Builder vibeSummary(String vibeSummary) { this.vibeSummary = vibeSummary; return this; }
        public Builder confidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; return this; }

        public RecommendedTrackDto build() {
            return new RecommendedTrackDto(track, reasoning, tier, vibeSummary, confidenceScore);
        }
    }

    public Track getTrack() { return track; }
    public void setTrack(Track track) { this.track = track; }
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    public PlayTier getTier() { return tier; }
    public void setTier(PlayTier tier) { this.tier = tier; }
    public String getVibeSummary() { return vibeSummary; }
    public void setVibeSummary(String vibeSummary) { this.vibeSummary = vibeSummary; }
    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
}
