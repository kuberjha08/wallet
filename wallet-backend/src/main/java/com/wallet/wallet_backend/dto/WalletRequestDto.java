package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletRequestDto {
    private Long userId;
    private Double amount;
    private String reference;
}