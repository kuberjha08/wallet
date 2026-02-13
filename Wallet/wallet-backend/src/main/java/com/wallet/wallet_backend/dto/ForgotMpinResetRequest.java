package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotMpinResetRequest {
    private String mobile;
    private String otp;
    private String newMpin;
}