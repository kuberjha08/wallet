package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeMpinRequestDto {
    private String oldMpin;
    private String newMpin;
}