package com.soundwave.musicdiscovery.model;

public class GeminiRecommendation {
    private String trackId;
    private String reasoning;
    private PlayTier tier;
    private String vibeSummary;
    private double confidenceScore;

    public GeminiRecommendation() {
    }

    public GeminiRecommendation(String trackId, String reasoning, PlayTier tier, String vibeSummary, double confidenceScore) {
        this.trackId = trackId;
        this.reasoning = reasoning;
        this.tier = tier;
        this.vibeSummary = vibeSummary;
        this.confidenceScore = confidenceScore;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String trackId;
        private String reasoning;
        private PlayTier tier;
        private String vibeSummary;
        private double confidenceScore;

        public Builder trackId(String trackId) { this.trackId = trackId; return this; }
        public Builder reasoning(String reasoning) { this.reasoning = reasoning; return this; }
        public Builder tier(PlayTier tier) { this.tier = tier; return this; }
        public Builder vibeSummary(String vibeSummary) { this.vibeSummary = vibeSummary; return this; }
        public Builder confidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; return this; }

        public GeminiRecommendation build() {
            return new GeminiRecommendation(trackId, reasoning, tier, vibeSummary, confidenceScore);
        }
    }

    public String getTrackId() { return trackId; }
    public void setTrackId(String trackId) { this.trackId = trackId; }
    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
    public PlayTier getTier() { return tier; }
    public void setTier(PlayTier tier) { this.tier = tier; }
    public String getVibeSummary() { return vibeSummary; }
    public void setVibeSummary(String vibeSummary) { this.vibeSummary = vibeSummary; }
    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }
}
