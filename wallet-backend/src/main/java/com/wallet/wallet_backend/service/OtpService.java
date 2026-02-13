package com.wallet.wallet_backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class OtpService {

    private static final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    public String generateTempToken(Long userId, String mobile) {
        String rawToken = "TEMP:" + userId + ":" + mobile + ":" + System.currentTimeMillis();
        return Base64.getEncoder().encodeToString(rawToken.getBytes());
    }

    public String generateTempToken(long timestamp, String mobile) {
        String rawToken = "TEMP_NEW:" + timestamp + ":" + mobile;
        return Base64.getEncoder().encodeToString(rawToken.getBytes());
    }

    public String generatePermanentToken(Long userId, String mobile) {
        String rawToken = "PERM:" + userId + ":" + mobile + ":" + System.currentTimeMillis() + ":30days";
        return Base64.getEncoder().encodeToString(rawToken.getBytes());
    }

    public LocalDateTime getOtpExpiryTime() {
        return LocalDateTime.now().plusMinutes(10);
    }

    public LocalDateTime getTokenExpiryTime() {
        return LocalDateTime.now().plusDays(30);
    }

    public boolean isOtpValid(String otp, String storedOtp, LocalDateTime expiry) {
        if (otp == null || storedOtp == null || expiry == null) return false;
        return otp.equals(storedOtp) && LocalDateTime.now().isBefore(expiry);
    }

    public boolean isTokenValid(String token, String storedToken, LocalDateTime expiry) {
        if (token == null || storedToken == null || expiry == null) return false;
        return token.equals(storedToken) && LocalDateTime.now().isBefore(expiry);
    }
}