package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class WalletAdminDto {
    private Long id;
    private String name;
    private Double balance;
    private String status;
    private Boolean frozen;
    private LocalDateTime lastActive;
}