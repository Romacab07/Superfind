package com.soundwave.musicdiscovery.dto;

public class PlayRequestDto {
    private String clientSession;
    private String userAgent;

    public PlayRequestDto() {
    }

    public PlayRequestDto(String clientSession, String userAgent) {
        this.clientSession = clientSession;
        this.userAgent = userAgent;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String clientSession;
        private String userAgent;

        public Builder clientSession(String clientSession) { this.clientSession = clientSession; return this; }
        public Builder userAgent(String userAgent) { this.userAgent = userAgent; return this; }

        public PlayRequestDto build() {
            return new PlayRequestDto(clientSession, userAgent);
        }
    }

    public String getClientSession() { return clientSession; }
    public void setClientSession(String clientSession) { this.clientSession = clientSession; }
    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
}
