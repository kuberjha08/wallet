package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetMpinRequestDto {
    private String token;
    private String mpin;
}