package com.wallet.wallet_backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserAdminDto {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String status;
    private String kycStatus;
    private Double walletBalance;
    private String walletType;
    private String profilePicture;
    private String riskLevel;
    private LocalDateTime createdAt;
    private LocalDateTime lastActive;
    private Boolean walletFrozen;
}