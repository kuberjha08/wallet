package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendOtpRequestDto {
    private String mobile;
    private String name;
}