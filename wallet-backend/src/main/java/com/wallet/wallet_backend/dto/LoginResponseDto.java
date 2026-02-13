package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponseDto {
    private String token;
    private String permanentToken;
    private UserResponseDto user;
    private String step;
    private String message;
    
    public LoginResponseDto(String token, String permanentToken, UserResponseDto user, String step, String message) {
        this.token = token;
        this.permanentToken = permanentToken;
        this.user = user;
        this.step = step;
        this.message = message;
    }
    
    // Keep old constructor for backward compatibility
    public LoginResponseDto(String token, UserResponseDto user, String step, String message) {
        this(token, null, user, step, message);
    }
}