package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateAdminRequestDto {
    private String mobile;
    private String name;
    private String mpin;
}