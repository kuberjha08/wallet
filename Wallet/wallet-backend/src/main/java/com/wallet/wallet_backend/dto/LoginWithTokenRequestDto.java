package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginWithTokenRequestDto {
    private String mobile;
    private String token;
}