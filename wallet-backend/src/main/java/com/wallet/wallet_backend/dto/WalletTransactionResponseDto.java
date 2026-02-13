package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class WalletTransactionResponseDto {
    private Long id;
    private Double amount;
    private String type;
    private String reference;
    private LocalDateTime createdAt;
}