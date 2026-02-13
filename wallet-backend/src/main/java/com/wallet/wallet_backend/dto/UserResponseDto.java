package com.wallet.wallet_backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class UserResponseDto {
    private Long id;
    private String mobile;
    private String name;
    private String email;
    private Double walletBalance;
    private Boolean walletFrozen;
    private String kycStatus;
    private LocalDateTime createdAt;
    private String step;
    private String upiId;
    private String qrCodeData;
}