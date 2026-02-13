package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginWithPermanentTokenRequest {
    private String mobile;
    private String permanentToken;
}