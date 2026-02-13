package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequestDto {
    private String mobile;
    private String otp;
    private String tempToken;
}